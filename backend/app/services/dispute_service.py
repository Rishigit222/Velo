"""
Dispute management service handling claims, role authorization, evidence association, and audit history.
"""
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from backend.app.models.dispute import Dispute
from backend.app.models.order import Order
from backend.app.models.user import User
from backend.app.schemas.dispute import DisputeCreate, DisputeStatusUpdate
from backend.app.services.audit_service import AuditEventType, record_audit_event


VALID_DISPUTE_STATUSES = {"submitted", "under_review", "resolved", "rejected"}
ACTIVE_DISPUTE_STATUSES = {"submitted", "under_review", "open"}


def create_dispute(
    db: Session,
    dispute_in: DisputeCreate,
    current_user: User,
) -> Dispute:
    """
    Raise a structured dispute linked to an authorized order.
    Enforces that buyer or seller is party to the order and prevents duplicate open disputes.
    """
    stmt = (
        select(Order)
        .options(joinedload(Order.product))
        .where(Order.id == dispute_in.order_id)
    )
    order = db.execute(stmt).scalar_one_or_none()

    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order #{dispute_in.order_id} does not exist.",
        )

    # Validate authorization: Buyer or Seller of the order, or Admin
    is_buyer = order.buyer_id == current_user.id
    is_seller = order.seller_id == current_user.id
    is_admin = current_user.role == "admin"

    if not (is_buyer or is_seller or is_admin):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to raise a dispute for an order you are not a party to.",
        )

    # Prevent duplicate active disputes on the same order
    existing_active = db.execute(
        select(Dispute).where(
            Dispute.order_id == order.id,
            Dispute.status.in_(ACTIVE_DISPUTE_STATUSES),
        )
    ).scalars().first()

    if existing_active:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"An active dispute (#{existing_active.id} - '{existing_active.status}') already exists for order #{order.id}.",
        )

    # Normalize initial status to 'submitted'
    dispute = Dispute(
        order_id=order.id,
        raised_by=current_user.id,
        dispute_reason=dispute_in.dispute_reason.strip(),
        description=dispute_in.description.strip(),
        status="submitted",
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    db.add(dispute)
    db.flush()

    # Transactional audit logging
    record_audit_event(
        db=db,
        event_type=AuditEventType.DISPUTE_CREATED,
        event_description=f"Dispute #{dispute.id} lodged by User #{current_user.id} on Order #{order.id}: {dispute.dispute_reason}",
        user_id=current_user.id,
        order_id=order.id,
    )

    db.commit()
    db.refresh(dispute)
    return dispute


def list_disputes(
    db: Session,
    current_user: User,
    order_id: Optional[int] = None,
    status_filter: Optional[str] = None,
) -> List[Dispute]:
    """
    List disputes accessible to current user with role-based filtering.
    """
    stmt = (
        select(Dispute)
        .options(joinedload(Dispute.order).joinedload(Order.product))
        .order_by(Dispute.created_at.desc())
    )

    is_admin = current_user.role == "admin"

    if not is_admin:
        # User sees disputes on orders they purchased or sold, or disputes they raised
        stmt = stmt.join(Dispute.order).where(
            (Order.buyer_id == current_user.id)
            | (Order.seller_id == current_user.id)
            | (Dispute.raised_by == current_user.id)
        )

    if order_id is not None:
        stmt = stmt.where(Dispute.order_id == order_id)

    if status_filter:
        s_norm = status_filter.strip().lower()
        if s_norm == "open":
            stmt = stmt.where(Dispute.status.in_(["submitted", "open"]))
        else:
            stmt = stmt.where(Dispute.status == s_norm)

    return db.execute(stmt).scalars().all()


def get_dispute_for_user(
    db: Session,
    dispute_id: int,
    current_user: User,
) -> Dispute:
    """
    Retrieve single dispute and enforce ownership access.
    """
    stmt = (
        select(Dispute)
        .options(joinedload(Dispute.order).joinedload(Order.product))
        .where(Dispute.id == dispute_id)
    )
    dispute = db.execute(stmt).scalar_one_or_none()

    if not dispute:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Dispute #{dispute_id} does not exist.",
        )

    is_admin = current_user.role == "admin"
    is_claimant = dispute.raised_by == current_user.id
    is_buyer = dispute.order and dispute.order.buyer_id == current_user.id
    is_seller = dispute.order and dispute.order.seller_id == current_user.id

    if not (is_admin or is_claimant or is_buyer or is_seller):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to access this dispute dossier.",
        )

    return dispute


def update_dispute_status(
    db: Session,
    dispute_id: int,
    status_update: DisputeStatusUpdate,
    current_user: User,
) -> Dispute:
    """
    Validate and execute dispute lifecycle transition with role-based checks and audit recording.
    """
    dispute = get_dispute_for_user(db=db, dispute_id=dispute_id, current_user=current_user)

    new_status = status_update.status.strip().lower()
    if new_status == "open":
        new_status = "submitted"

    if new_status not in VALID_DISPUTE_STATUSES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status '{status_update.status}'. Valid statuses are: {', '.join(sorted(VALID_DISPUTE_STATUSES))}.",
        )

    is_admin = current_user.role == "admin"
    is_seller = dispute.order and dispute.order.seller_id == current_user.id
    current_status = dispute.status.lower()

    # Terminal state check: finalized disputes cannot be modified
    if current_status in ("resolved", "rejected"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Dispute #{dispute.id} is finalized in state '{dispute.status}' and cannot be modified.",
        )

    # Transition authorization rules:
    # 1. Buyer cannot change dispute statuses
    if not is_admin and not is_seller:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Buyers are not permitted to update dispute statuses.",
        )

    # 2. Seller can only move submitted -> under_review
    if is_seller and not is_admin:
        if new_status != "under_review":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Sellers may only transition disputes to 'under_review'. Administrative review is required for resolution or rejection.",
            )

    # 3. Transition graph validation: cannot jump from submitted directly to resolved/rejected
    if current_status == "submitted" and new_status in ("resolved", "rejected"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid status transition: A dispute must be moved to 'under_review' before resolution or rejection.",
        )

    # Determine audit event type
    if new_status == "under_review":
        event_type = AuditEventType.DISPUTE_MOVED_TO_REVIEW
    elif new_status == "resolved":
        event_type = AuditEventType.DISPUTE_RESOLVED
    elif new_status == "rejected":
        event_type = AuditEventType.DISPUTE_REJECTED
    else:
        event_type = AuditEventType.DISPUTE_STATUS_CHANGED

    # Update dispute record
    old_status = dispute.status
    dispute.status = new_status
    if status_update.resolution_details:
        dispute.resolution_details = status_update.resolution_details.strip()
    dispute.updated_at = datetime.now(timezone.utc)

    # Record transactional audit log
    record_audit_event(
        db=db,
        event_type=event_type,
        event_description=f"Dispute #{dispute.id} transitioned from '{old_status}' to '{new_status}' by User #{current_user.id}. Notes: {status_update.resolution_details or 'None'}",
        user_id=current_user.id,
        order_id=dispute.order_id,
    )

    db.commit()
    db.refresh(dispute)
    return dispute


def get_dispute_details_for_user(
    db: Session,
    dispute_id: int,
    current_user: User,
) -> Dict[str, Any]:
    """
    Retrieve full dispute dossier including order, product, sessions, condition reports, and audit history.
    """
    dispute = get_dispute_for_user(db=db, dispute_id=dispute_id, current_user=current_user)

    order = dispute.order
    evidence_sessions_data = []
    if order and order.evidence_sessions:
        for s in order.evidence_sessions:
            evidence_sessions_data.append({
                "id": s.id,
                "session_type": s.session_type,
                "session_status": s.session_status,
                "created_at": s.created_at,
                "files_count": len(s.files) if s.files else 0,
                "condition_reports": [
                    {
                        "id": r.id,
                        "product_condition": r.product_condition,
                        "packaging_condition": r.packaging_condition,
                        "accessories_status": r.accessories_status,
                        "damage_description": r.damage_description,
                        "created_at": r.created_at,
                    }
                    for r in (s.condition_reports or [])
                ],
            })

    verification_results_data = []
    if order and order.verification_results:
        for v in order.verification_results:
            verification_results_data.append({
                "id": v.id,
                "identity_result": v.identity_result,
                "damage_result": v.damage_result,
                "accessories_result": v.accessories_result,
                "overall_status": v.overall_status,
                "findings": v.findings,
                "created_at": v.created_at,
            })

    audit_events_data = []
    if order and order.audit_logs:
        for a in order.audit_logs:
            audit_events_data.append({
                "id": a.id,
                "event_type": a.event_type,
                "event_description": a.event_description,
                "current_hash": a.current_hash,
                "created_at": a.created_at,
            })

    return {
        "id": dispute.id,
        "order_id": dispute.order_id,
        "raised_by": dispute.raised_by,
        "dispute_reason": dispute.dispute_reason,
        "description": dispute.description,
        "status": dispute.status,
        "resolution_details": dispute.resolution_details,
        "created_at": dispute.created_at,
        "updated_at": dispute.updated_at,
        "order": {
            "id": order.id,
            "order_number": order.order_number,
            "status": order.status,
            "total_amount": order.total_amount,
            "product_name": order.product.product_name if order.product else "N/A",
            "buyer_id": order.buyer_id,
            "seller_id": order.seller_id,
        } if order else None,
        "evidence_sessions": evidence_sessions_data,
        "verification_results": verification_results_data,
        "audit_events": audit_events_data,
    }
