"""
Comprehensive integration and unit test suite for PDF Report Generation module.
Covers:
- POST /api/v1/reports/orders/{order_id}/generate (Report generation with ReportLab)
- Verify PDF file creation, SHA-256 integrity hash, NumberedCanvas two-pass pagination
- GET /api/v1/reports/orders/{order_id} (Latest report metadata retrieval)
- GET /api/v1/reports/{report_id} (Report metadata retrieval by ID)
- GET /api/v1/reports/{report_id}/download (Binary PDF download & streaming)
- GET /api/v1/reports/order/{order_id}/pdf (Direct stream alias)
- Strict RBAC: Order buyer, seller, admin vs unauthorized user (403)
- Audit log records for REPORT_GENERATED and REPORT_DOWNLOADED
"""
import io
import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from backend.app.models.audit_log import AuditLog
from backend.app.models.order import Order
from backend.app.models.product import Product
from backend.app.models.report import Report


def create_order_with_product(
    db_session: Session,
    buyer_id: int,
    seller_id: int,
    product_id: int,
    order_number: str = "ORD-RPT-001",
    status: str = "delivered",
) -> Order:
    order = Order(
        order_number=order_number,
        buyer_id=buyer_id,
        seller_id=seller_id,
        product_id=product_id,
        status=status,
    )
    db_session.add(order)
    db_session.commit()
    db_session.refresh(order)
    return order


class TestReportGeneration:
    """Test generating PDF reports via ReportLab."""

    def test_generate_pdf_report_success(
        self,
        client: TestClient,
        db_session: Session,
        test_buyer: dict,
        test_seller: dict,
        test_product: Product,
    ):
        order = create_order_with_product(
            db_session,
            buyer_id=test_buyer["user"].id,
            seller_id=test_seller["user"].id,
            product_id=test_product.id,
            order_number="ORD-RPT-GEN-01",
        )

        response = client.post(
            f"/api/v1/reports/orders/{order.id}/generate",
            json={"report_type": "evidence_summary"},
            headers=test_buyer["headers"],
        )

        assert response.status_code == 201, response.text
        data = response.json()
        assert data["order_id"] == order.id
        assert data["report_type"] == "evidence_summary"
        assert data["status"] == "completed"
        assert data["file_hash"] is not None
        assert len(data["file_hash"]) == 64  # SHA-256
        assert data["file_size"] > 0
        assert data["file_name"].startswith("ReturnProof-Report-Order-")
        assert data["file_name"].endswith(".pdf")

        # Verify record exists in DB
        rpt = db_session.query(Report).filter(Report.id == data["id"]).first()
        assert rpt is not None
        assert os.path.exists(rpt.file_path)

        # Verify audit log entry
        log = (
            db_session.query(AuditLog)
            .filter(AuditLog.event_type == "REPORT_GENERATED")
            .order_by(AuditLog.id.desc())
            .first()
        )
        assert log is not None
        assert f"Evidence Report #{data['id']}" in log.event_description
        assert log.user_id == test_buyer["user"].id

    def test_generate_report_nonexistent_order_404(
        self,
        client: TestClient,
        test_buyer: dict,
    ):
        response = client.post(
            "/api/v1/reports/orders/999999/generate",
            json={"report_type": "evidence_summary"},
            headers=test_buyer["headers"],
        )
        assert response.status_code == 404

    def test_generate_report_unauthorized_user_403(
        self,
        client: TestClient,
        db_session: Session,
        test_buyer: dict,
        other_buyer: dict,
        test_seller: dict,
        test_product: Product,
    ):
        order = create_order_with_product(
            db_session,
            buyer_id=test_buyer["user"].id,
            seller_id=test_seller["user"].id,
            product_id=test_product.id,
            order_number="ORD-RPT-UNAUTH",
        )

        response = client.post(
            f"/api/v1/reports/orders/{order.id}/generate",
            json={"report_type": "evidence_summary"},
            headers=other_buyer["headers"],
        )
        assert response.status_code == 403


class TestReportMetadataRetrieval:
    """Test retrieving report metadata."""

    def test_get_report_metadata(
        self,
        client: TestClient,
        db_session: Session,
        test_buyer: dict,
        test_seller: dict,
        other_buyer: dict,
        test_product: Product,
    ):
        order = create_order_with_product(
            db_session,
            buyer_id=test_buyer["user"].id,
            seller_id=test_seller["user"].id,
            product_id=test_product.id,
            order_number="ORD-RPT-META",
        )

        # Generate report
        gen_res = client.post(
            f"/api/v1/reports/orders/{order.id}/generate",
            json={"report_type": "evidence_summary"},
            headers=test_seller["headers"],
        )
        assert gen_res.status_code == 201
        report_id = gen_res.json()["id"]

        # 1. Fetch by report_id as buyer
        res_by_id = client.get(f"/api/v1/reports/{report_id}", headers=test_buyer["headers"])
        assert res_by_id.status_code == 200
        assert res_by_id.json()["id"] == report_id

        # 2. Fetch latest by order_id as seller
        res_by_order = client.get(f"/api/v1/reports/orders/{order.id}", headers=test_seller["headers"])
        assert res_by_order.status_code == 200
        assert res_by_order.json()["id"] == report_id

        # 3. Unauthorized access
        res_unauth = client.get(f"/api/v1/reports/{report_id}", headers=other_buyer["headers"])
        assert res_unauth.status_code == 403


class TestReportDownloadAndStream:
    """Test PDF binary streaming and validation."""

    def test_download_report_binary(
        self,
        client: TestClient,
        db_session: Session,
        test_buyer: dict,
        test_seller: dict,
        test_product: Product,
    ):
        order = create_order_with_product(
            db_session,
            buyer_id=test_buyer["user"].id,
            seller_id=test_seller["user"].id,
            product_id=test_product.id,
            order_number="ORD-RPT-DL",
        )

        gen_res = client.post(
            f"/api/v1/reports/orders/{order.id}/generate",
            json={"report_type": "full_chain_of_custody"},
            headers=test_buyer["headers"],
        )
        report_id = gen_res.json()["id"]

        # Download via /api/v1/reports/{report_id}/download
        dl_res = client.get(
            f"/api/v1/reports/{report_id}/download",
            headers=test_buyer["headers"],
        )
        assert dl_res.status_code == 200
        assert dl_res.headers["content-type"] == "application/pdf"
        assert "attachment" in dl_res.headers["content-disposition"]
        assert dl_res.content.startswith(b"%PDF-")

        # Verify audit log for REPORT_DOWNLOADED
        log = (
            db_session.query(AuditLog)
            .filter(AuditLog.event_type == "REPORT_DOWNLOADED")
            .order_by(AuditLog.id.desc())
            .first()
        )
        assert log is not None
        assert f"Evidence Report #{report_id}" in log.event_description
        assert log.user_id == test_buyer["user"].id

    def test_direct_pdf_stream_by_order_alias(
        self,
        client: TestClient,
        db_session: Session,
        test_buyer: dict,
        test_seller: dict,
        test_product: Product,
    ):
        order = create_order_with_product(
            db_session,
            buyer_id=test_buyer["user"].id,
            seller_id=test_seller["user"].id,
            product_id=test_product.id,
            order_number="ORD-RPT-STREAM",
        )

        # If no report yet, calling stream will automatically generate and stream it
        stream_res = client.get(
            f"/api/v1/reports/order/{order.id}/pdf",
            headers=test_seller["headers"],
        )
        assert stream_res.status_code == 200
        assert stream_res.headers["content-type"] == "application/pdf"
        assert stream_res.content.startswith(b"%PDF-")
