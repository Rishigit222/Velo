"""
FastAPI endpoints for Evidence Capture, File Ingestion, and Chain-of-Custody Ledger.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, File, Query, UploadFile, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from backend.app.database.connection import get_db
from backend.app.models.user import User
from backend.app.routes.deps import get_current_user
from backend.app.schemas.evidence import (
    AuditLogResponse,
    AuditVerificationResponse,
    ConditionReportCreate,
    ConditionReportResponse,
    EvidenceFileResponse,
    EvidenceSessionCreate,
    EvidenceSessionResponse,
    EvidenceSessionStatusUpdate,
)
from backend.app.services.audit_service import verify_audit_chain
from backend.app.services.evidence_service import (
    create_condition_report,
    create_evidence_session,
    download_evidence_file,
    get_condition_reports_for_session,
    get_evidence_file_for_user,
    get_evidence_session_for_user,
    list_evidence_sessions,
    list_files_for_session,
    update_evidence_session_status,
    upload_files_to_session,
)

router = APIRouter(prefix="/evidence", tags=["Evidence & Custody"])


def _format_file_response(evidence_file) -> EvidenceFileResponse:
    """Format file record hiding physical filesystem path."""
    download_url = f"/api/v1/evidence/files/{evidence_file.id}/download"
    return EvidenceFileResponse(
        id=evidence_file.id,
        session_id=evidence_file.session_id,
        file_name=evidence_file.file_name,
        file_type=evidence_file.file_type,
        file_path=download_url,  # Never expose physical storage path
        file_hash=evidence_file.file_hash,
        file_size=evidence_file.file_size,
        uploaded_by=evidence_file.uploaded_by,
        uploaded_at=evidence_file.uploaded_at,
        download_url=download_url,
    )


def _format_session_response(session) -> EvidenceSessionResponse:
    """Format session response with formatted child files and status alias."""
    files = [_format_file_response(f) for f in (session.files or [])]
    reports = [
        ConditionReportResponse.model_validate(r)
        for r in (session.condition_reports or [])
    ]
    return EvidenceSessionResponse(
        id=session.id,
        order_id=session.order_id,
        session_type=session.session_type,
        session_status=session.session_status,
        status=session.session_status,
        created_by=session.created_by,
        created_at=session.created_at,
        completed_at=session.completed_at,
        updated_at=session.completed_at or session.created_at,
        files=files,
        condition_reports=reports,
    )


# ─────────────────────────────────────────────────────────────────────────────
# 1. Evidence Session Management
# ─────────────────────────────────────────────────────────────────────────────

@router.post(
    "/sessions",
    response_model=EvidenceSessionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create evidence session",
    description="Initiate a delivery or return evidence capture session for an order.",
)
def create_session(
    session_in: EvidenceSessionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> EvidenceSessionResponse:
    session = create_evidence_session(db=db, session_in=session_in, current_user=current_user)
    return _format_session_response(session)


@router.get(
    "/sessions",
    response_model=List[EvidenceSessionResponse],
    summary="List evidence sessions",
    description="List evidence sessions accessible to current user with role-based filtering.",
)
def get_sessions(
    order_id: Optional[int] = Query(None, description="Optional order ID filter"),
    session_type: Optional[str] = Query(None, description="Optional session type ('delivery' or 'return')"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> List[EvidenceSessionResponse]:
    sessions = list_evidence_sessions(
        db=db,
        current_user=current_user,
        order_id=order_id,
        session_type=session_type,
    )
    return [_format_session_response(s) for s in sessions]


@router.get(
    "/sessions/{session_id}",
    response_model=EvidenceSessionResponse,
    summary="Get evidence session details",
    description="Retrieve full details, uploaded files, and condition reports for an evidence session.",
)
def get_session_details(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> EvidenceSessionResponse:
    session = get_evidence_session_for_user(db=db, session_id=session_id, current_user=current_user)
    return _format_session_response(session)


@router.patch(
    "/sessions/{session_id}/status",
    response_model=EvidenceSessionResponse,
    summary="Update evidence session status",
    description="Transition session lifecycle status between 'active', 'completed', and 'cancelled'.",
)
def patch_session_status(
    session_id: int,
    status_update: EvidenceSessionStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> EvidenceSessionResponse:
    session = update_evidence_session_status(
        db=db,
        session_id=session_id,
        status_update=status_update,
        current_user=current_user,
    )
    return _format_session_response(session)


# ─────────────────────────────────────────────────────────────────────────────
# 2. Evidence Files Upload & Download
# ─────────────────────────────────────────────────────────────────────────────

@router.post(
    "/sessions/{session_id}/files",
    response_model=List[EvidenceFileResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Upload evidence files",
    description="Upload JPEG, PNG, WebP, MP4, or WebM media files to an active evidence session. Calculates backend SHA-256.",
)
def upload_files(
    session_id: int,
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> List[EvidenceFileResponse]:
    uploaded = upload_files_to_session(
        db=db,
        session_id=session_id,
        files=files,
        current_user=current_user,
    )
    return [_format_file_response(f) for f in uploaded]


@router.get(
    "/sessions/{session_id}/files",
    response_model=List[EvidenceFileResponse],
    summary="List files for session",
    description="List all evidence media files associated with an evidence session.",
)
def get_session_files(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> List[EvidenceFileResponse]:
    files = list_files_for_session(db=db, session_id=session_id, current_user=current_user)
    return [_format_file_response(f) for f in files]


@router.get(
    "/files/{file_id}",
    response_model=EvidenceFileResponse,
    summary="Get evidence file metadata",
    description="Retrieve metadata and SHA-256 cryptographic digest for a specific evidence file.",
)
def get_file_metadata(
    file_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> EvidenceFileResponse:
    file_record = get_evidence_file_for_user(db=db, file_id=file_id, current_user=current_user)
    return _format_file_response(file_record)


@router.get(
    "/files/{file_id}/download",
    summary="Download evidence file",
    description="Download encrypted/private evidence media file payload. Protected by RBAC.",
)
def download_file(
    file_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    physical_path, file_type, file_name = download_evidence_file(
        db=db,
        file_id=file_id,
        current_user=current_user,
    )
    return FileResponse(
        path=physical_path,
        media_type=file_type,
        filename=file_name,
    )


# ─────────────────────────────────────────────────────────────────────────────
# 3. Condition Assessment Reports
# ─────────────────────────────────────────────────────────────────────────────

@router.post(
    "/sessions/{session_id}/condition",
    response_model=ConditionReportResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Submit condition assessment report",
    description="Record physical condition, damage description, packaging integrity, and accessories status.",
)
def post_condition_report(
    session_id: int,
    report_in: ConditionReportCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ConditionReportResponse:
    report = create_condition_report(
        db=db,
        session_id=session_id,
        report_in=report_in,
        current_user=current_user,
    )
    return ConditionReportResponse.model_validate(report)


@router.get(
    "/sessions/{session_id}/condition",
    response_model=List[ConditionReportResponse],
    summary="Get condition assessment reports",
    description="Retrieve all condition assessment reports recorded for an evidence session.",
)
def get_condition_reports(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> List[ConditionReportResponse]:
    reports = get_condition_reports_for_session(
        db=db,
        session_id=session_id,
        current_user=current_user,
    )
    return [ConditionReportResponse.model_validate(r) for r in reports]


# ─────────────────────────────────────────────────────────────────────────────
# 4. Tamper-Evident Audit Chain Verification
# ─────────────────────────────────────────────────────────────────────────────

@router.get(
    "/audit/verify",
    response_model=AuditVerificationResponse,
    summary="Verify cryptographic audit log chain",
    description="Recalculates SHA-256 hashes across the entire digital chain-of-custody ledger to detect tampering.",
)
def verify_audit_log_chain(
    order_id: Optional[int] = Query(None, description="Optional order ID to verify order-scoped chain"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> AuditVerificationResponse:
    return verify_audit_chain(db=db, order_id=order_id)
