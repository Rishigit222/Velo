"""
FastAPI endpoints for PDF Evidence Reports and Certified Custody Dossiers.
"""
from fastapi import APIRouter, Depends, Query, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from backend.app.database.connection import get_db
from backend.app.models.user import User
from backend.app.routes.deps import get_current_user
from backend.app.schemas.report import ReportGenerateRequest, ReportResponse
from backend.app.services.report_service import (
    _format_report_response,
    download_report_file,
    generate_pdf_report,
    get_latest_report_for_order,
    get_report_for_user,
)

router = APIRouter(prefix="/reports", tags=["Evidence Reports"])


@router.post(
    "/orders/{order_id}/generate",
    response_model=ReportResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Generate PDF evidence dossier",
    description="Compile an official, tamper-evident PDF report with SHA-256 digests, condition notes, and audit history.",
)
def post_generate_report(
    order_id: int,
    options: ReportGenerateRequest = ReportGenerateRequest(),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ReportResponse:
    report = generate_pdf_report(
        db=db,
        order_id=order_id,
        current_user=current_user,
        report_type=options.report_type,
        include_audit_trail=options.include_audit_trail,
        include_disputes=options.include_disputes,
    )
    return ReportResponse.model_validate(_format_report_response(report))


@router.get(
    "/orders/{order_id}",
    response_model=ReportResponse,
    summary="Get latest report metadata for an order",
    description="Retrieve metadata for the most recently compiled evidence report for an order.",
)
def get_order_report(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ReportResponse:
    report = get_latest_report_for_order(db=db, order_id=order_id, current_user=current_user)
    if not report:
        # If no report yet generated, auto-generate on first request
        report = generate_pdf_report(db=db, order_id=order_id, current_user=current_user)
    return ReportResponse.model_validate(_format_report_response(report))


@router.get(
    "/{report_id}",
    response_model=ReportResponse,
    summary="Get report metadata by ID",
    description="Retrieve report metadata and checksum by report ID.",
)
def get_single_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ReportResponse:
    report = get_report_for_user(db=db, report_id=report_id, current_user=current_user)
    return ReportResponse.model_validate(_format_report_response(report))


@router.get(
    "/{report_id}/download",
    summary="Download certified PDF report file",
    description="Download encrypted/private PDF evidence report payload with Content-Disposition headers.",
)
def get_download_report_by_id(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    physical_path, media_type, file_name = download_report_file(
        db=db,
        report_id=report_id,
        current_user=current_user,
    )
    return FileResponse(
        path=physical_path,
        media_type=media_type,
        filename=file_name,
    )


@router.get(
    "/order/{order_id}/pdf",
    summary="Direct authenticated PDF download by order ID",
    description="Stream the certified PDF evidence dossier for an order (generates if not yet compiled).",
)
def get_download_report_by_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    report = get_latest_report_for_order(db=db, order_id=order_id, current_user=current_user)
    if not report:
        report = generate_pdf_report(db=db, order_id=order_id, current_user=current_user)

    physical_path, media_type, file_name = download_report_file(
        db=db,
        report_id=report.id,
        current_user=current_user,
    )
    return FileResponse(
        path=physical_path,
        media_type=media_type,
        filename=file_name,
    )
