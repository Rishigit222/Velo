"""
Evidence capture, immutable file storage, and condition assessment business logic.
"""
from datetime import datetime, timezone
import hashlib
import os
from pathlib import Path
import time
from typing import List, Optional, Tuple
import uuid

from fastapi import HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from backend.app.core.config import settings
from backend.app.models.condition_report import ConditionReport
from backend.app.models.evidence_file import EvidenceFile
from backend.app.models.evidence_session import EvidenceSession, SessionStatus, SessionType
from backend.app.models.order import Order
from backend.app.models.user import User
from backend.app.schemas.evidence import (
    ConditionReportCreate,
    EvidenceSessionCreate,
    EvidenceSessionStatusUpdate,
)
from backend.app.schemas.user import UserRole
from backend.app.services.audit_service import AuditEventType, record_audit_event


def validate_file_content(filename: str, content: bytes) -> Tuple[str, str]:
    """
    Validate file extension, size, and binary magic bytes.
    Supported types: JPEG, PNG, WebP, MP4, WebM.
    Returns: (sanitized_extension, detected_mime_type)
    """
    if len(content) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File content cannot be empty (0 bytes received).",
        )

    if len(content) > settings.MAX_UPLOAD_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_CONTENT_TOO_LARGE,
            detail=f"File size ({len(content)} bytes) exceeds the maximum allowed limit of {settings.MAX_UPLOAD_SIZE_BYTES} bytes.",
        )

    # 1. Extension validation
    ext = os.path.splitext(filename)[1].lower()
    if ext not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file extension '{ext}'. Allowed extensions: {settings.ALLOWED_EXTENSIONS}",
        )

    # 2. Magic byte inspection
    mime_type = None
    if content.startswith(b"\xff\xd8\xff"):
        mime_type = "image/jpeg"
    elif content.startswith(b"\x89PNG\r\n\x1a\n"):
        mime_type = "image/png"
    elif content[:4] == b"RIFF" and len(content) >= 12 and content[8:12] == b"WEBP":
        mime_type = "image/webp"
    elif len(content) >= 8 and content[4:8] == b"ftyp":
        mime_type = "video/mp4"
    elif content.startswith(b"\x1a\x45\xdf\xa3"):
        mime_type = "video/webm"

    if not mime_type or mime_type not in settings.ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file format: binary content signature does not match allowed types ({settings.ALLOWED_MIME_TYPES}).",
        )

    # Cross-check extension against detected MIME type
    if mime_type == "image/jpeg" and ext not in [".jpg", ".jpeg"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="File extension does not match JPEG content.")
    if mime_type == "image/png" and ext != ".png":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="File extension does not match PNG content.")
    if mime_type == "image/webp" and ext != ".webp":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="File extension does not match WebP content.")
    if mime_type == "video/mp4" and ext != ".mp4":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="File extension does not match MP4 content.")
    if mime_type == "video/webm" and ext != ".webm":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="File extension does not match WebM content.")

    return ext, mime_type


def compute_sha256(content: bytes) -> str:
    """Compute cryptographic SHA-256 hex digest of file payload."""
    return hashlib.sha256(content).hexdigest()


def save_evidence_file(content: bytes, ext: str, upload_base_dir: Optional[str] = None) -> str:
    """
    Save uploaded file to private local storage with a random collision-free filename.
    Guarantees no path traversal and protects storage paths.
    """
    base_dir = Path(upload_base_dir or settings.UPLOAD_DIR) / "evidence"
    base_dir.mkdir(parents=True, exist_ok=True)

    unique_filename = f"{uuid.uuid4().hex}_{int(time.time())}{ext}"
    target_path = (base_dir / unique_filename).resolve()

    # Verify no path traversal outside designated upload directory
    if not target_path.is_relative_to(base_dir.resolve()):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Illegal file storage path attempt detected.",
        )

    with open(target_path, "wb") as f:
        f.write(content)

    # Return internal relative path
    return str(target_path)


# ─────────────────────────────────────────────────────────────────────────────
# Session Access Control Helper
# ─────────────────────────────────────────────────────────────────────────────

def _validate_order_access(order: Order, current_user: User) -> None:
    """Enforce that only order buyer, assigned seller, or admin can access order evidence."""
    if current_user.role == UserRole.ADMIN.value:
        return
    if current_user.role == UserRole.BUYER.value and order.buyer_id == current_user.id:
        return
    if current_user.role == UserRole.SELLER.value and order.seller_id == current_user.id:
        return

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="You do not have permission to access evidence for this order.",
    )


def _get_session_with_eager_load(db: Session, session_id: int) -> Optional[EvidenceSession]:
    """Retrieve an evidence session with eager loaded relationships."""
    stmt = (
        select(EvidenceSession)
        .options(
            joinedload(EvidenceSession.order),
            joinedload(EvidenceSession.files),
            joinedload(EvidenceSession.condition_reports),
        )
        .where(EvidenceSession.id == session_id)
    )
    return db.execute(stmt).unique().scalar_one_or_none()


# ─────────────────────────────────────────────────────────────────────────────
# Evidence Session CRUD
# ─────────────────────────────────────────────────────────────────────────────

def create_evidence_session(
    db: Session,
    session_in: EvidenceSessionCreate,
    current_user: User,
) -> EvidenceSession:
    """
    Create a new evidence session for an existing order.
    Validates order existence, permissions, and session type ('delivery' or 'return').
    """
    # 1. Validate order existence
    order = db.execute(select(Order).where(Order.id == session_in.order_id)).scalar_one_or_none()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order with ID {session_in.order_id} not found.",
        )

    # 2. Validate permissions
    _validate_order_access(order, current_user)

    # 3. Validate session type
    raw_type = session_in.session_type.value if hasattr(session_in.session_type, "value") else str(session_in.session_type)
    if raw_type not in [SessionType.DELIVERY.value, SessionType.RETURN.value]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid session type '{raw_type}'. Must be 'delivery' or 'return'.",
        )

    # 4. Create Session
    now_utc = datetime.now(timezone.utc)
    new_session = EvidenceSession(
        order_id=order.id,
        session_type=raw_type,
        created_by=current_user.id,
        session_status=SessionStatus.ACTIVE.value,
        created_at=now_utc,
    )

    db.add(new_session)
    db.flush()

    # 5. Record Hash-Linked Audit Event
    record_audit_event(
        db=db,
        event_type=AuditEventType.EVIDENCE_SESSION_CREATED,
        event_description=(
            f"Evidence session #{new_session.id} ({raw_type}) initiated for order #{order.order_number} "
            f"by {current_user.role} '{current_user.email}'"
        ),
        user_id=current_user.id,
        order_id=order.id,
        commit=False,
    )

    db.commit()
    db.refresh(new_session)

    return _get_session_with_eager_load(db, new_session.id)  # type: ignore


def list_evidence_sessions(
    db: Session,
    current_user: User,
    order_id: Optional[int] = None,
    session_type: Optional[str] = None,
) -> List[EvidenceSession]:
    """
    List evidence sessions accessible to the current user.
    Enforces that buyers see only their sessions and sellers see only their sold products' sessions.
    """
    stmt = (
        select(EvidenceSession)
        .join(Order, EvidenceSession.order_id == Order.id)
        .options(
            joinedload(EvidenceSession.order),
            joinedload(EvidenceSession.files),
            joinedload(EvidenceSession.condition_reports),
        )
    )

    # Filter by user role ownership
    if current_user.role == UserRole.ADMIN.value:
        pass
    elif current_user.role == UserRole.BUYER.value:
        stmt = stmt.where(Order.buyer_id == current_user.id)
    elif current_user.role == UserRole.SELLER.value:
        stmt = stmt.where(Order.seller_id == current_user.id)
    else:
        stmt = stmt.where(Order.buyer_id == current_user.id)

    # Optional order_id filter
    if order_id is not None:
        # Check order existence and permission first
        order = db.execute(select(Order).where(Order.id == order_id)).scalar_one_or_none()
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Order with ID {order_id} not found.",
            )
        _validate_order_access(order, current_user)
        stmt = stmt.where(EvidenceSession.order_id == order_id)

    # Optional session_type filter
    if session_type is not None:
        stmt = stmt.where(EvidenceSession.session_type == session_type)

    stmt = stmt.order_by(EvidenceSession.created_at.desc())
    return list(db.execute(stmt).scalars().unique().all())


def get_evidence_session_for_user(
    db: Session,
    session_id: int,
    current_user: User,
) -> EvidenceSession:
    """Retrieve a single evidence session with authorization check."""
    session = _get_session_with_eager_load(db, session_id)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Evidence session with ID {session_id} not found.",
        )

    _validate_order_access(session.order, current_user)
    return session


def update_evidence_session_status(
    db: Session,
    session_id: int,
    status_update: EvidenceSessionStatusUpdate,
    current_user: User,
) -> EvidenceSession:
    """Update lifecycle status of an evidence session (active -> completed/cancelled)."""
    session = get_evidence_session_for_user(db, session_id, current_user)

    target_status = status_update.status or status_update.session_status
    if not target_status:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Must specify target 'status' or 'session_status'.",
        )

    raw_status = target_status.value if hasattr(target_status, "value") else str(target_status)
    if raw_status not in [SessionStatus.ACTIVE.value, SessionStatus.COMPLETED.value, SessionStatus.CANCELLED.value]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status '{raw_status}'. Allowed: 'active', 'completed', 'cancelled'.",
        )

    old_status = session.session_status
    session.session_status = raw_status
    if raw_status == SessionStatus.COMPLETED.value:
        session.completed_at = datetime.now(timezone.utc)

    # Record hash-linked audit record
    record_audit_event(
        db=db,
        event_type=AuditEventType.SESSION_STATUS_CHANGED,
        event_description=(
            f"Evidence session #{session.id} status transitioned from '{old_status}' to '{raw_status}' "
            f"by user '{current_user.email}'"
        ),
        user_id=current_user.id,
        order_id=session.order_id,
        commit=False,
    )

    db.commit()
    db.refresh(session)
    return _get_session_with_eager_load(db, session.id)  # type: ignore


# ─────────────────────────────────────────────────────────────────────────────
# Evidence Files Management & Downloads
# ─────────────────────────────────────────────────────────────────────────────

def upload_files_to_session(
    db: Session,
    session_id: int,
    files: List[UploadFile],
    current_user: User,
) -> List[EvidenceFile]:
    """
    Process, validate, compute SHA-256, and store uploaded evidence files.
    Creates immutable metadata records in EvidenceFile and hash-linked audit logs.
    """
    session = get_evidence_session_for_user(db, session_id, current_user)

    if session.session_status != SessionStatus.ACTIVE.value:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot upload evidence files to a {session.session_status} session. Session must be 'active'.",
        )

    if not files:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one evidence file must be provided.",
        )

    created_files: List[EvidenceFile] = []
    now_utc = datetime.now(timezone.utc)

    for upload_file in files:
        # Read uploaded bytes
        content = upload_file.file.read()
        filename = os.path.basename(upload_file.filename or f"evidence_{uuid.uuid4().hex}")

        # Validate content & extension
        ext, detected_mime = validate_file_content(filename, content)

        # Compute SHA-256 digest on backend (never trust client)
        file_hash = compute_sha256(content)
        file_size = len(content)

        # Save to private local storage
        saved_path = save_evidence_file(content, ext)

        evidence_file = EvidenceFile(
            session_id=session.id,
            file_name=filename,
            file_type=detected_mime,
            file_path=saved_path,
            file_hash=file_hash,
            file_size=file_size,
            uploaded_by=current_user.id,
            uploaded_at=now_utc,
        )

        db.add(evidence_file)
        db.flush()

        # Record hash-linked audit log
        record_audit_event(
            db=db,
            event_type=AuditEventType.FILE_UPLOADED,
            event_description=(
                f"Evidence file '{filename}' ({file_size} bytes, {detected_mime}) uploaded to session #{session.id} "
                f"with SHA-256 digest: {file_hash}"
            ),
            user_id=current_user.id,
            order_id=session.order_id,
            commit=False,
        )

        created_files.append(evidence_file)

    db.commit()
    for f in created_files:
        db.refresh(f)

    return created_files


def list_files_for_session(
    db: Session,
    session_id: int,
    current_user: User,
) -> List[EvidenceFile]:
    """List all evidence files associated with a session."""
    session = get_evidence_session_for_user(db, session_id, current_user)
    stmt = (
        select(EvidenceFile)
        .where(EvidenceFile.session_id == session.id)
        .order_by(EvidenceFile.uploaded_at.asc())
    )
    return list(db.execute(stmt).scalars().all())


def get_evidence_file_for_user(
    db: Session,
    file_id: int,
    current_user: User,
) -> EvidenceFile:
    """Retrieve single evidence file metadata with strict access validation."""
    stmt = (
        select(EvidenceFile)
        .options(
            joinedload(EvidenceFile.session).joinedload(EvidenceSession.order),
        )
        .where(EvidenceFile.id == file_id)
    )
    evidence_file = db.execute(stmt).unique().scalar_one_or_none()
    if not evidence_file:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Evidence file with ID {file_id} not found.",
        )

    # Validate access through parent session and order
    _validate_order_access(evidence_file.session.order, current_user)
    return evidence_file


def download_evidence_file(
    db: Session,
    file_id: int,
    current_user: User,
) -> Tuple[str, str, str]:
    """
    Verify access and prepare evidence file for secure streaming download.
    Records an audit log entry for the download action.
    Returns: (physical_file_path, file_type, file_name)
    """
    evidence_file = get_evidence_file_for_user(db, file_id, current_user)

    if not os.path.exists(evidence_file.file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evidence media payload is not present in local storage repository.",
        )

    # Record audit log event for authorized download
    record_audit_event(
        db=db,
        event_type=AuditEventType.FILE_DOWNLOADED,
        event_description=(
            f"Evidence file #{evidence_file.id} ('{evidence_file.file_name}') downloaded by "
            f"{current_user.role} '{current_user.email}'"
        ),
        user_id=current_user.id,
        order_id=evidence_file.session.order_id,
        commit=True,
    )

    return evidence_file.file_path, evidence_file.file_type, evidence_file.file_name


# ─────────────────────────────────────────────────────────────────────────────
# Condition Reports
# ─────────────────────────────────────────────────────────────────────────────

def create_condition_report(
    db: Session,
    session_id: int,
    report_in: ConditionReportCreate,
    current_user: User,
) -> ConditionReport:
    """Submit a physical condition assessment report for an active evidence session."""
    session = get_evidence_session_for_user(db, session_id, current_user)

    if session.session_status != SessionStatus.ACTIVE.value:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot submit condition reports to a {session.session_status} session. Session must be 'active'.",
        )

    # Combine description and additional notes cleanly
    description = report_in.damage_description or ""
    if report_in.additional_notes:
        if description:
            description = f"{description}\nNotes: {report_in.additional_notes}"
        else:
            description = f"Notes: {report_in.additional_notes}"

    report = ConditionReport(
        session_id=session.id,
        product_condition=report_in.product_condition,
        damage_description=description if description else None,
        accessories_status=report_in.accessories_status,
        packaging_condition=report_in.packaging_condition,
        created_at=datetime.now(timezone.utc),
    )

    db.add(report)
    db.flush()

    # Record hash-linked audit event
    record_audit_event(
        db=db,
        event_type=AuditEventType.CONDITION_REPORT_SUBMITTED,
        event_description=(
            f"Condition report #{report.id} submitted for session #{session.id}: "
            f"Condition='{report.product_condition}', Packaging='{report.packaging_condition or 'N/A'}'"
        ),
        user_id=current_user.id,
        order_id=session.order_id,
        commit=False,
    )

    db.commit()
    db.refresh(report)
    return report


def get_condition_reports_for_session(
    db: Session,
    session_id: int,
    current_user: User,
) -> List[ConditionReport]:
    """Retrieve all condition assessment reports for an evidence session."""
    session = get_evidence_session_for_user(db, session_id, current_user)
    stmt = (
        select(ConditionReport)
        .where(ConditionReport.session_id == session.id)
        .order_by(ConditionReport.created_at.desc())
    )
    return list(db.execute(stmt).scalars().all())
