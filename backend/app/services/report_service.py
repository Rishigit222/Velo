"""
PDF Evidence Report generator service using ReportLab.
Compiles certified chain-of-custody dossiers with SHA-256 hashes, condition reports, audit trails, and disputes.
"""
from datetime import datetime, timezone
import hashlib
import os
from typing import List, Optional, Tuple
import uuid

from fastapi import HTTPException, status
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.pdfgen import canvas
from reportlab.platypus import (
    HRFlowable,
    KeepTogether,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from backend.app.core.config import settings
from backend.app.models.order import Order
from backend.app.models.report import Report
from backend.app.models.user import User
from backend.app.services.audit_service import AuditEventType, record_audit_event


REPORTS_STORAGE_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
    "uploads",
    "reports",
)


class NumberedCanvas(canvas.Canvas):
    """
    Two-pass canvas to calculate total page count and draw running header/footer.
    """
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count: int):
        self.saveState()
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor("#334155"))
        # Running Top Header
        self.drawString(54, 755, "RETURNPROOF · DIGITAL CHAIN-OF-CUSTODY DOSSIER")
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748B"))
        self.drawRightString(558, 755, "SHA-256 TAMPER-EVIDENT RECORD")

        self.setStrokeColor(colors.HexColor("#CBD5E1"))
        self.setLineWidth(0.6)
        self.line(54, 747, 558, 747)

        # Running Bottom Footer
        self.line(54, 46, 558, 46)
        self.drawString(54, 33, "CONFIDENTIAL & PROPRIETARY · GENERATED FOR ARBITRATION & COMPLIANCE")
        self.drawRightString(558, 33, f"Page {self._pageNumber} of {page_count}")
        self.restoreState()


def _ensure_reports_directory():
    os.makedirs(REPORTS_STORAGE_DIR, exist_ok=True)


def _format_report_response(report: Report) -> dict:
    """Format report model into client response hiding physical file path."""
    return {
        "id": report.id,
        "order_id": report.order_id,
        "generated_by": report.generated_by,
        "report_type": report.report_type,
        "file_name": report.file_name,
        "file_size": report.file_size,
        "file_hash": report.file_hash,
        "version": report.version,
        "status": report.status,
        "download_url": f"/api/v1/reports/{report.id}/download",
        "created_at": report.created_at,
    }


def generate_pdf_report(
    db: Session,
    order_id: int,
    current_user: User,
    report_type: str = "full_chain_of_custody",
    include_audit_trail: bool = True,
    include_disputes: bool = True,
) -> Report:
    """
    Generate an audit-grade evidence dossier in PDF format using ReportLab.
    Enforces authorization: only buyer, seller, or admin can generate.
    """
    _ensure_reports_directory()

    # Query target order with all related evidence, verification, condition reports, and disputes
    stmt = (
        select(Order)
        .options(
            joinedload(Order.product),
            joinedload(Order.buyer),
            joinedload(Order.seller),
            joinedload(Order.evidence_sessions),
            joinedload(Order.verification_results),
            joinedload(Order.disputes),
            joinedload(Order.audit_logs),
        )
        .where(Order.id == order_id)
    )
    order = db.execute(stmt).unique().scalar_one_or_none()

    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order #{order_id} does not exist.",
        )

    # Validate authorization
    is_admin = current_user.role == "admin"
    is_buyer = order.buyer_id == current_user.id
    is_seller = order.seller_id == current_user.id

    if not (is_admin or is_buyer or is_seller):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to generate or access evidence reports for this order.",
        )

    # Generate unique filename and physical destination path
    report_uuid = uuid.uuid4().hex[:10]
    file_name = f"ReturnProof-Report-Order-{order.id}-{report_uuid}.pdf"
    file_path = os.path.join(REPORTS_STORAGE_DIR, file_name)

    # Document Styles
    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        "DocTitle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=20,
        leading=24,
        textColor=colors.HexColor("#0F172A"),
        spaceAfter=6,
    )
    subtitle_style = ParagraphStyle(
        "DocSubtitle",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#475569"),
        spaceAfter=14,
    )
    h1_style = ParagraphStyle(
        "SectionHeader",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=12,
        leading=15,
        textColor=colors.HexColor("#1E293B"),
        spaceBefore=12,
        spaceAfter=6,
    )
    body_style = ParagraphStyle(
        "BodyDark",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor("#1E293B"),
    )
    body_bold = ParagraphStyle(
        "BodyBold",
        parent=body_style,
        fontName="Helvetica-Bold",
    )
    mono_style = ParagraphStyle(
        "MonoStyle",
        parent=styles["Normal"],
        fontName="Courier",
        fontSize=7.5,
        leading=10,
        textColor=colors.HexColor("#0F172A"),
    )
    disclaimer_style = ParagraphStyle(
        "Disclaimer",
        parent=styles["Normal"],
        fontName="Helvetica-Oblique",
        fontSize=7.5,
        leading=10.5,
        textColor=colors.HexColor("#64748B"),
    )

    story = []

    # 1. Title & Header Banner
    story.append(Paragraph("EVIDENCE CERTIFICATION & CUSTODY REPORT", title_style))
    story.append(
        Paragraph(
            f"Official digital chain-of-custody verification report compiled for Order <b>{order.order_number or f'#ORD-{order.id}'}</b>. "
            f"Generated on {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC')} under platform security protocol v1.0.",
            subtitle_style,
        )
    )

    # 2. Section A: Report Metadata Box
    report_meta_data = [
        [
            Paragraph("<b>Report Dossier ID:</b>", body_style),
            Paragraph(f"RPT-{order.id}-{report_uuid.upper()}", mono_style),
            Paragraph("<b>Generated By:</b>", body_style),
            Paragraph(f"{current_user.full_name} ({current_user.role.upper()})", body_style),
        ],
        [
            Paragraph("<b>Generated Timestamp:</b>", body_style),
            Paragraph(datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC"), body_style),
            Paragraph("<b>Classification:</b>", body_style),
            Paragraph("Confidential / Evidentiary", body_bold),
        ],
    ]
    t_meta = Table(report_meta_data, colWidths=[110, 142, 100, 152])
    t_meta.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#F8FAFC")),
            ("BOX", (0, 0), (-1, -1), 0.8, colors.HexColor("#CBD5E1")),
            ("INNERGRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#E2E8F0")),
            ("PADDING", (0, 0), (-1, -1), 5),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ])
    )
    story.append(t_meta)
    story.append(Spacer(1, 10))

    # 3. Section B: Order & Product Specifications
    story.append(Paragraph("A. Order & Commercial Specifications", h1_style))
    order_data = [
        [
            Paragraph("<b>Product Name:</b>", body_style),
            Paragraph(order.product.product_name if order.product else "N/A", body_bold),
            Paragraph("<b>SKU:</b>", body_style),
            Paragraph(order.product.sku if order.product and order.product.sku else "—", mono_style),
        ],
        [
            Paragraph("<b>Serial Number:</b>", body_style),
            Paragraph(order.product.serial_number if order.product and order.product.serial_number else "—", mono_style),
            Paragraph("<b>Unit / Total Price:</b>", body_style),
            Paragraph(f"${order.total_amount:.2f}", body_style),
        ],
        [
            Paragraph("<b>Order Status:</b>", body_style),
            Paragraph(order.status.upper(), body_bold),
            Paragraph("<b>Order Placement:</b>", body_style),
            Paragraph(str(order.created_at).split(".")[0], body_style),
        ],
        [
            Paragraph("<b>Buyer Reference:</b>", body_style),
            Paragraph(f"{order.buyer.full_name} (#{order.buyer_id})" if order.buyer else f"User #{order.buyer_id}", body_style),
            Paragraph("<b>Seller Reference:</b>", body_style),
            Paragraph(f"{order.seller.full_name} (#{order.seller_id})" if order.seller else f"User #{order.seller_id}", body_style),
        ],
    ]
    t_order = Table(order_data, colWidths=[110, 142, 100, 152])
    t_order.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#FFFFFF")),
            ("BOX", (0, 0), (-1, -1), 0.8, colors.HexColor("#CBD5E1")),
            ("INNERGRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#E2E8F0")),
            ("PADDING", (0, 0), (-1, -1), 5),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ])
    )
    story.append(t_order)
    story.append(Spacer(1, 10))

    # 4. Section C & D: Delivery and Return Evidence
    delivery_session = next((s for s in (order.evidence_sessions or []) if s.session_type == "delivery"), None)
    return_session = next((s for s in (order.evidence_sessions or []) if s.session_type == "return"), None)

    story.append(Paragraph("B. Dispatch Delivery Evidence (Carrier Handover)", h1_style))
    if delivery_session:
        del_files_data = [
            [
                Paragraph("<b>File Name</b>", body_bold),
                Paragraph("<b>Format</b>", body_bold),
                Paragraph("<b>Size</b>", body_bold),
                Paragraph("<b>SHA-256 Checksum</b>", body_bold),
            ]
        ]
        for f in (delivery_session.files or []):
            del_files_data.append([
                Paragraph(f.file_name, body_style),
                Paragraph(f.file_type.split("/")[-1].upper(), body_style),
                Paragraph(f"{(f.file_size / 1024):.1f} KB", body_style),
                Paragraph(f.file_hash, mono_style),
            ])
        if len(del_files_data) == 1:
            del_files_data.append([Paragraph("No media files captured for this session", body_style), Paragraph("—", body_style), Paragraph("—", body_style), Paragraph("—", body_style)])

        t_del = Table(del_files_data, colWidths=[130, 54, 54, 266])
        t_del.setStyle(
            TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#F1F5F9")),
                ("BOX", (0, 0), (-1, -1), 0.8, colors.HexColor("#CBD5E1")),
                ("INNERGRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#E2E8F0")),
                ("PADDING", (0, 0), (-1, -1), 4),
            ])
        )
        story.append(t_del)

        # Condition reports for delivery
        if delivery_session.condition_reports:
            for rep in delivery_session.condition_reports:
                story.append(Spacer(1, 4))
                del_cond_text = f"<b>Delivery Condition:</b> {rep.product_condition} · <b>Packaging:</b> {rep.packaging_condition} · <b>Accessories:</b> {rep.accessories_status}"
                if rep.damage_description:
                    del_cond_text += f"<br/><b>Notes:</b> {rep.damage_description}"
                story.append(Paragraph(del_cond_text, body_style))
    else:
        story.append(Paragraph("<i>No dispatch delivery evidence session recorded.</i>", disclaimer_style))

    story.append(Spacer(1, 10))

    # Return Evidence
    story.append(Paragraph("C. Customer Return Evidence (Intake Examination)", h1_style))
    if return_session:
        ret_files_data = [
            [
                Paragraph("<b>File Name</b>", body_bold),
                Paragraph("<b>Format</b>", body_bold),
                Paragraph("<b>Size</b>", body_bold),
                Paragraph("<b>SHA-256 Checksum</b>", body_bold),
            ]
        ]
        for f in (return_session.files or []):
            ret_files_data.append([
                Paragraph(f.file_name, body_style),
                Paragraph(f.file_type.split("/")[-1].upper(), body_style),
                Paragraph(f"{(f.file_size / 1024):.1f} KB", body_style),
                Paragraph(f.file_hash, mono_style),
            ])
        if len(ret_files_data) == 1:
            ret_files_data.append([Paragraph("No media files captured for this session", body_style), Paragraph("—", body_style), Paragraph("—", body_style), Paragraph("—", body_style)])

        t_ret = Table(ret_files_data, colWidths=[130, 54, 54, 266])
        t_ret.setStyle(
            TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#F1F5F9")),
                ("BOX", (0, 0), (-1, -1), 0.8, colors.HexColor("#CBD5E1")),
                ("INNERGRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#E2E8F0")),
                ("PADDING", (0, 0), (-1, -1), 4),
            ])
        )
        story.append(t_ret)

        if return_session.condition_reports:
            for rep in return_session.condition_reports:
                story.append(Spacer(1, 4))
                ret_cond_text = f"<b>Return Condition:</b> {rep.product_condition} · <b>Packaging:</b> {rep.packaging_condition} · <b>Accessories:</b> {rep.accessories_status}"
                if rep.damage_description:
                    ret_cond_text += f"<br/><b>Notes:</b> {rep.damage_description}"
                story.append(Paragraph(ret_cond_text, body_style))
    else:
        story.append(Paragraph("<i>No customer return evidence session recorded.</i>", disclaimer_style))

    story.append(Spacer(1, 10))

    # 5. Section E: AI & Visual Verification Findings
    story.append(Paragraph("D. Automated Condition Verification Findings", h1_style))
    verif = order.verification_results[0] if (order.verification_results and len(order.verification_results) > 0) else None
    if verif:
        verif_data = [
            [
                Paragraph("<b>Product Identity:</b>", body_style),
                Paragraph(verif.identity_result.upper(), body_bold),
                Paragraph("<b>Physical Damage:</b>", body_style),
                Paragraph(verif.damage_result, body_style),
            ],
            [
                Paragraph("<b>Accessories Check:</b>", body_style),
                Paragraph(verif.accessories_result, body_style),
                Paragraph("<b>Overall Status:</b>", body_style),
                Paragraph(verif.overall_status.upper(), body_bold),
            ],
        ]
        t_verif = Table(verif_data, colWidths=[110, 142, 100, 152])
        t_verif.setStyle(
            TableStyle([
                ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#F8FAFC")),
                ("BOX", (0, 0), (-1, -1), 0.8, colors.HexColor("#CBD5E1")),
                ("INNERGRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#E2E8F0")),
                ("PADDING", (0, 0), (-1, -1), 4),
            ])
        )
        story.append(t_verif)
        if verif.findings:
            story.append(Spacer(1, 3))
            story.append(Paragraph(f"<b>Engine Observations:</b> {verif.findings}", body_style))
    else:
        story.append(Paragraph("<i>Automated comparison verification not yet executed for this order.</i>", disclaimer_style))

    story.append(Spacer(1, 10))

    # 6. Section F: Dispute & Claim Particulars (if requested/present)
    if include_disputes and order.disputes and len(order.disputes) > 0:
        story.append(Paragraph("E. Arbitration & Dispute Record", h1_style))
        for disp in order.disputes:
            disp_data = [
                [
                    Paragraph(f"<b>Dispute #{disp.id}:</b>", body_bold),
                    Paragraph(disp.dispute_reason, body_bold),
                    Paragraph("<b>Status:</b>", body_style),
                    Paragraph(disp.status.upper(), body_bold),
                ],
                [
                    Paragraph("<b>Claimant Notes:</b>", body_style),
                    Paragraph(disp.description, body_style),
                    Paragraph("<b>Decision Notes:</b>", body_style),
                    Paragraph(disp.resolution_details or "Under examination", body_style),
                ],
            ]
            t_disp = Table(disp_data, colWidths=[100, 172, 90, 142])
            t_disp.setStyle(
                TableStyle([
                    ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#FFFBEB")),
                    ("BOX", (0, 0), (-1, -1), 0.8, colors.HexColor("#FDE68A")),
                    ("INNERGRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#FDE68A")),
                    ("PADDING", (0, 0), (-1, -1), 4),
                ])
            )
            story.append(t_disp)
            story.append(Spacer(1, 6))

    # 7. Section G: Audit Trail (if requested)
    if include_audit_trail and order.audit_logs and len(order.audit_logs) > 0:
        story.append(Paragraph("F. Tamper-Evident Ledger History", h1_style))
        audit_table_data = [
            [
                Paragraph("<b>Timestamp (UTC)</b>", body_bold),
                Paragraph("<b>Event Type</b>", body_bold),
                Paragraph("<b>Description</b>", body_bold),
                Paragraph("<b>SHA-256 Ledger Hash</b>", body_bold),
            ]
        ]
        # Show up to 10 latest audit events to ensure clean readability
        for a in order.audit_logs[-10:]:
            audit_table_data.append([
                Paragraph(str(a.created_at).split(".")[0], body_style),
                Paragraph(a.event_type, body_style),
                Paragraph(a.event_description, body_style),
                Paragraph(f"{a.current_hash[:16]}...", mono_style),
            ])

        t_audit = Table(audit_table_data, colWidths=[104, 110, 190, 100])
        t_audit.setStyle(
            TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#F1F5F9")),
                ("BOX", (0, 0), (-1, -1), 0.8, colors.HexColor("#CBD5E1")),
                ("INNERGRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#E2E8F0")),
                ("PADDING", (0, 0), (-1, -1), 3.5),
            ])
        )
        story.append(t_audit)
        story.append(Spacer(1, 10))

    # 8. Section H: Legal & Cryptographic Disclaimers
    story.append(KeepTogether([
        HRFlowable(width="100%", thickness=0.8, color=colors.HexColor("#CBD5E1"), spaceAfter=6),
        Paragraph("<b>Evidentiary Limitations & Technical Disclaimers:</b>", body_bold),
        Paragraph(
            "1. Cryptographic SHA-256 hashes certify the exact bit-level integrity of recorded digital media artifacts from the instant of server ingestion. "
            "A verified hash confirms the file has not suffered post-upload bit rot, alteration, or tampering.<br/>"
            "2. Hash verification does not independently certify the physical authenticity of external recording conditions beyond the captured frame. "
            "Automated visual difference scores and AI observations are assistive analytical indicators and do not constitute automatic legal determination of fraud or liability. "
            "Human administrative review remains decisive.",
            disclaimer_style,
        ),
    ]))

    # Build Document with NumberedCanvas
    doc = SimpleDocTemplate(
        file_path,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54,
    )
    doc.build(story, canvasmaker=NumberedCanvas)

    # Calculate generated PDF file metrics
    file_size = os.path.getsize(file_path)
    with open(file_path, "rb") as f:
        file_hash = hashlib.sha256(f.read()).hexdigest()

    # Persist report entity
    report = Report(
        order_id=order.id,
        generated_by=current_user.id,
        report_type=report_type or "full_chain_of_custody",
        file_path=file_path,
        file_name=file_name,
        file_size=file_size,
        file_hash=file_hash,
        version="1.0",
        status="completed",
        created_at=datetime.now(timezone.utc),
    )
    db.add(report)
    db.flush()

    # Transactional audit logging for report generation
    record_audit_event(
        db=db,
        event_type=AuditEventType.REPORT_GENERATED,
        event_description=f"Evidence Report #{report.id} generated for Order #{order.id} (SHA-256: {file_hash[:16]}...)",
        user_id=current_user.id,
        order_id=order.id,
    )

    db.commit()
    db.refresh(report)
    return report


def get_report_for_user(db: Session, report_id: int, current_user: User) -> Report:
    """
    Retrieve report and enforce RBAC.
    """
    stmt = (
        select(Report)
        .options(joinedload(Report.order))
        .where(Report.id == report_id)
    )
    report = db.execute(stmt).scalar_one_or_none()

    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Report #{report_id} does not exist.",
        )

    is_admin = current_user.role == "admin"
    is_buyer = report.order and report.order.buyer_id == current_user.id
    is_seller = report.order and report.order.seller_id == current_user.id

    if not (is_admin or is_buyer or is_seller):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to access this evidence report.",
        )

    return report


def get_latest_report_for_order(db: Session, order_id: int, current_user: User) -> Optional[Report]:
    """
    Get latest generated report for an order.
    """
    # First verify user has access to order
    stmt_order = select(Order).where(Order.id == order_id)
    order = db.execute(stmt_order).scalar_one_or_none()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order #{order_id} does not exist.",
        )

    is_admin = current_user.role == "admin"
    is_buyer = order.buyer_id == current_user.id
    is_seller = order.seller_id == current_user.id

    if not (is_admin or is_buyer or is_seller):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to view reports for this order.",
        )

    stmt = (
        select(Report)
        .where(Report.order_id == order_id)
        .order_by(Report.id.desc())
    )
    return db.execute(stmt).scalars().first()


def download_report_file(db: Session, report_id: int, current_user: User) -> Tuple[str, str, str]:
    """
    Verify report authorization, audit download event, and return physical path and safe filename.
    Never exposes internal filesystem path.
    """
    report = get_report_for_user(db=db, report_id=report_id, current_user=current_user)

    if not os.path.exists(report.file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Physical report file not found on disk. Please re-generate the dossier.",
        )

    # Record download event in audit ledger
    record_audit_event(
        db=db,
        event_type=AuditEventType.REPORT_DOWNLOADED,
        event_description=f"Evidence Report #{report.id} downloaded by User #{current_user.id}",
        user_id=current_user.id,
        order_id=report.order_id,
        commit=True,
    )

    return report.file_path, "application/pdf", report.file_name
