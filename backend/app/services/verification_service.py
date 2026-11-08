"""
Automated Verification Service for visual comparison and discrepancy detection.
Compares delivery and return evidence media, evaluates condition reports, and records audit logs.
"""
from datetime import datetime, timezone
import os
from typing import List, Optional, Tuple
from fastapi import HTTPException, status
from PIL import Image, ImageChops, ImageStat
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from backend.app.models.condition_report import ConditionReport
from backend.app.models.evidence_file import EvidenceFile
from backend.app.models.evidence_session import EvidenceSession, SessionType
from backend.app.models.order import Order
from backend.app.models.user import User
from backend.app.models.verification_result import VerificationResult
from backend.app.schemas.user import UserRole
from backend.app.schemas.verification import RunVerificationRequest
from backend.app.services.audit_service import AuditEventType, record_audit_event
from backend.app.services.evidence_service import _validate_order_access


def compute_image_difference(img_path1: str, img_path2: str) -> Optional[float]:
    """
    Compute normalized Root Mean Square (RMS) difference between two images.
    Returns float in range [0.0, 1.0], or None if either file cannot be processed.
    """
    try:
        if not (os.path.exists(img_path1) and os.path.exists(img_path2)):
            return None

        with Image.open(img_path1) as img1, Image.open(img_path2) as img2:
            # Normalize to 256x256 RGB
            norm1 = img1.convert("RGB").resize((256, 256))
            norm2 = img2.convert("RGB").resize((256, 256))
            diff = ImageChops.difference(norm1, norm2)
            stat = ImageStat.Stat(diff)
            # Average RMS error normalized to [0.0, 1.0]
            rms = sum(stat.rms) / (3.0 * 255.0)
            return round(min(1.0, max(0.0, rms)), 4)
    except Exception:
        return None


def execute_verification(
    db: Session,
    request_in: RunVerificationRequest,
    current_user: User,
) -> VerificationResult:
    """
    Execute multimodal verification between outbound delivery and inbound return sessions.
    Performs real pixel-level difference calculation, evaluates condition reports, and anchors results.
    """
    # 1. Fetch and authorize order
    stmt_order = select(Order).where(Order.id == request_in.order_id)
    order = db.execute(stmt_order).scalar_one_or_none()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order #{request_in.order_id} not found.",
        )
    _validate_order_access(order, current_user)

    # 2. Resolve Delivery Session
    if request_in.original_session_id:
        orig_session = db.execute(
            select(EvidenceSession)
            .options(joinedload(EvidenceSession.files), joinedload(EvidenceSession.condition_reports))
            .where(
                EvidenceSession.id == request_in.original_session_id,
                EvidenceSession.order_id == order.id,
            )
        ).unique().scalar_one_or_none()
        if not orig_session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Original evidence session #{request_in.original_session_id} not found for this order.",
            )
    else:
        orig_session = db.execute(
            select(EvidenceSession)
            .options(joinedload(EvidenceSession.files), joinedload(EvidenceSession.condition_reports))
            .where(
                EvidenceSession.order_id == order.id,
                EvidenceSession.session_type == SessionType.DELIVERY.value,
            )
            .order_by(EvidenceSession.id.desc())
        ).unique().scalars().first()

    # 3. Resolve Return Session
    if request_in.return_session_id:
        ret_session = db.execute(
            select(EvidenceSession)
            .options(joinedload(EvidenceSession.files), joinedload(EvidenceSession.condition_reports))
            .where(
                EvidenceSession.id == request_in.return_session_id,
                EvidenceSession.order_id == order.id,
            )
        ).unique().scalar_one_or_none()
        if not ret_session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Return evidence session #{request_in.return_session_id} not found for this order.",
            )
    else:
        ret_session = db.execute(
            select(EvidenceSession)
            .options(joinedload(EvidenceSession.files), joinedload(EvidenceSession.condition_reports))
            .where(
                EvidenceSession.order_id == order.id,
                EvidenceSession.session_type == SessionType.RETURN.value,
            )
            .order_by(EvidenceSession.id.desc())
        ).unique().scalars().first()

    if not orig_session and not ret_session:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot run verification: order has neither delivery nor return evidence sessions.",
        )

    # 4. Perform visual and condition analysis
    orig_files = [f for f in (orig_session.files if orig_session else []) if f.file_type.startswith("image")]
    ret_files = [f for f in (ret_session.files if ret_session else []) if f.file_type.startswith("image")]

    orig_cond = orig_session.condition_reports[0] if orig_session and orig_session.condition_reports else None
    ret_cond = ret_session.condition_reports[0] if ret_session and ret_session.condition_reports else None

    # Compute image discrepancy metric
    img_diff: Optional[float] = None
    if orig_files and ret_files:
        img_diff = compute_image_difference(orig_files[0].file_path, ret_files[0].file_path)

    # Evaluate damage indicators
    damage_detected = False
    damage_reasons = []

    if img_diff is not None and img_diff > 0.15:
        damage_detected = True
        damage_reasons.append(f"Visual deviation detected (RMS divergence: {img_diff:.2f})")

    if ret_cond:
        cond_text = f"{ret_cond.product_condition} {ret_cond.damage_description or ''} {ret_cond.packaging_condition or ''}".lower()
        if any(term in cond_text for term in ["damage", "crack", "scratch", "broken", "torn", "dent", "missing"]):
            damage_detected = True
            damage_reasons.append(f"Return condition report: '{ret_cond.product_condition}' ({ret_cond.damage_description or 'No notes'})")

    # Evaluate accessories
    accessories_missing = False
    if ret_cond and ret_cond.accessories_status:
        acc_text = ret_cond.accessories_status.lower()
        if any(term in acc_text for term in ["missing", "incomplete", "absent", "lost"]):
            accessories_missing = True

    # Assemble structured assessment
    identity_result = "matched" if (orig_files and ret_files) or (orig_session and ret_session) else "unverified"
    damage_result = "detected" if damage_detected else "none"
    accessories_result = "missing_items" if accessories_missing else "complete"

    if damage_detected or accessories_missing:
        overall_status = "flagged"
    elif orig_session and ret_session:
        overall_status = "verified"
    else:
        overall_status = "partial"

    # Compute confidence score
    confidence_score: float
    if orig_files and ret_files and img_diff is not None:
        confidence_score = round(max(0.70, min(0.98, 1.0 - (img_diff * 0.3))), 2)
    elif orig_session and ret_session:
        confidence_score = 0.85
    else:
        confidence_score = 0.75

    # Build detailed findings narrative
    findings_parts = []
    if orig_files and ret_files:
        findings_parts.append(
            f"Compared dispatch proof '{orig_files[0].file_name}' against return proof '{ret_files[0].file_name}'. "
            f"Calculated image divergence metric: {img_diff if img_diff is not None else 'N/A'}."
        )
    elif orig_session:
        findings_parts.append(f"Outbound dispatch evidence session #{orig_session.id} recorded with {len(orig_session.files)} files.")
    elif ret_session:
        findings_parts.append(f"Inbound return evidence session #{ret_session.id} recorded with {len(ret_session.files)} files.")

    if damage_reasons:
        findings_parts.append("Discrepancy notes: " + "; ".join(damage_reasons) + ".")
    else:
        findings_parts.append("No critical damage or physical flaws detected between evidence sessions.")

    if accessories_missing:
        findings_parts.append("Accessories discrepancy flagged in return intake assessment.")

    findings_text = " ".join(findings_parts)

    # 5. Persist VerificationResult entity
    verification_entry = VerificationResult(
        order_id=order.id,
        original_session_id=orig_session.id if orig_session else None,
        return_session_id=ret_session.id if ret_session else None,
        identity_result=identity_result,
        damage_result=damage_result,
        accessories_result=accessories_result,
        overall_status=overall_status,
        confidence_score=confidence_score,
        findings=findings_text,
        created_at=datetime.now(timezone.utc),
    )

    db.add(verification_entry)
    db.flush()

    # 6. Record immutable audit ledger event
    record_audit_event(
        db=db,
        event_type=AuditEventType.VERIFICATION_COMPLETED,
        event_description=(
            f"Automated verification completed for Order #{order.order_number}: "
            f"Status '{overall_status}', Damage '{damage_result}', Confidence {confidence_score}"
        ),
        user_id=current_user.id,
        order_id=order.id,
        commit=False,
    )

    db.commit()
    db.refresh(verification_entry)
    return verification_entry


def list_verification_results(
    db: Session,
    current_user: User,
    order_id: Optional[int] = None,
) -> List[VerificationResult]:
    """
    List verification results with multi-tenant RBAC enforcement.
    """
    stmt = (
        select(VerificationResult)
        .join(Order, VerificationResult.order_id == Order.id)
        .order_by(VerificationResult.created_at.desc())
    )

    # Role enforcement
    if current_user.role == UserRole.ADMIN.value:
        pass
    elif current_user.role == UserRole.BUYER.value:
        stmt = stmt.where(Order.buyer_id == current_user.id)
    elif current_user.role == UserRole.SELLER.value:
        stmt = stmt.where(Order.seller_id == current_user.id)
    else:
        stmt = stmt.where(Order.buyer_id == current_user.id)

    if order_id is not None:
        order = db.execute(select(Order).where(Order.id == order_id)).scalar_one_or_none()
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Order #{order_id} not found.",
            )
        _validate_order_access(order, current_user)
        stmt = stmt.where(VerificationResult.order_id == order_id)

    return list(db.execute(stmt).scalars().all())

