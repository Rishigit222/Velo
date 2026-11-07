"""
Comprehensive integration tests for Evidence Capture and Chain-of-Custody Engine.
Tests cover:
- Session management (delivery, return, RBAC, invalid orders)
- File uploads (JPEG, PNG, WebP, MP4, WebM, magic byte validation, oversize detection)
- SHA-256 computation and integrity checks
- Condition assessment reports
- Secure authorized downloads and unauthorized blocking
- Tamper-evident audit chain generation, verification, and tampering detection
- Concurrent audit event creation
"""
import concurrent.futures
from datetime import datetime, timezone
import hashlib
import io
import os
import tempfile
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from backend.app.core.config import settings
from backend.app.models.audit_log import AuditLog
from backend.app.models.evidence_file import EvidenceFile
from backend.app.models.evidence_session import EvidenceSession, SessionStatus, SessionType
from backend.app.models.order import Order
from backend.app.models.product import Product
from backend.app.services.audit_service import (
    AuditEventType,
    compute_deterministic_audit_hash,
    record_audit_event,
    verify_audit_chain,
)


@pytest.fixture
def sample_test_order(db_session: Session, test_buyer: dict, test_seller: dict, test_product: Product) -> Order:
    """Fixture providing a standard order linked to test_buyer and test_seller."""
    order = Order(
        order_number="ORD-TEST-EVID-001",
        buyer_id=test_buyer["user"].id,
        seller_id=test_seller["user"].id,
        product_id=test_product.id,
        quantity=1,
        total_amount=399.99,
        status="delivered",
        order_date=datetime.now(timezone.utc),
    )
    db_session.add(order)
    db_session.commit()
    db_session.refresh(order)
    return order


# Sample binary media payloads with valid magic signatures
VALID_JPEG_BYTES = b"\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x01\x00`\x00`\x00\x00\xff\xdb\x00C\x00" + b"TESTJPEGDATA"
VALID_PNG_BYTES = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15c4"
VALID_WEBP_BYTES = b"RIFF\x18\x00\x00\x00WEBPVP8 \x0c\x00\x00\x00\x00\x00\x00\x9d\x01*\x01\x00\x01\x00"
VALID_MP4_BYTES = b"\x00\x00\x00 ftypisom\x00\x00\x02\x00isomiso2mp41\x00\x00\x00\x08free"
VALID_WEBM_BYTES = b"\x1a\x45\xdf\xa3\x9f\x42\x86\x81\x01\x42\xf7\x81\x01\x42\xf2\x81\x04"


# ─────────────────────────────────────────────────────────────────────────────
# 1. EVIDENCE SESSION CREATION & ACCESS CONTROL
# ─────────────────────────────────────────────────────────────────────────────

def test_create_delivery_session_buyer(client: TestClient, sample_test_order: Order, test_buyer: dict):
    """A buyer can create a delivery unboxing session for their own order."""
    response = client.post(
        "/api/v1/evidence/sessions",
        headers=test_buyer["headers"],
        json={"order_id": sample_test_order.id, "session_type": "delivery"},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["order_id"] == sample_test_order.id
    assert data["session_type"] == "delivery"
    assert data["session_status"] == "active"
    assert data["status"] == "active"
    assert data["created_by"] == test_buyer["user"].id
    assert "created_at" in data
    assert "updated_at" in data


def test_create_return_session_seller(client: TestClient, sample_test_order: Order, test_seller: dict):
    """An assigned seller can create a return inspection session for the order."""
    response = client.post(
        "/api/v1/evidence/sessions",
        headers=test_seller["headers"],
        json={"order_id": sample_test_order.id, "session_type": "return"},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["session_type"] == "return"
    assert data["created_by"] == test_seller["user"].id


def test_unauthorized_session_creation(client: TestClient, sample_test_order: Order, other_buyer: dict):
    """Another buyer not associated with the order cannot create an evidence session."""
    response = client.post(
        "/api/v1/evidence/sessions",
        headers=other_buyer["headers"],
        json={"order_id": sample_test_order.id, "session_type": "delivery"},
    )
    assert response.status_code == 403
    assert "permission" in response.json()["detail"].lower()


def test_session_creation_invalid_order(client: TestClient, test_buyer: dict):
    """Attempting to create a session for a nonexistent order returns 404."""
    response = client.post(
        "/api/v1/evidence/sessions",
        headers=test_buyer["headers"],
        json={"order_id": 999999, "session_type": "delivery"},
    )
    assert response.status_code == 404


def test_list_and_get_session_details(client: TestClient, sample_test_order: Order, test_buyer: dict, other_seller: dict):
    """Retrieve session details and verify cross-user isolation."""
    # Create session as buyer
    create_resp = client.post(
        "/api/v1/evidence/sessions",
        headers=test_buyer["headers"],
        json={"order_id": sample_test_order.id, "session_type": "delivery"},
    )
    session_id = create_resp.json()["id"]

    # Buyer can fetch details
    get_resp = client.post if False else client.get(
        f"/api/v1/evidence/sessions/{session_id}",
        headers=test_buyer["headers"],
    )
    assert get_resp.status_code == 200
    assert get_resp.json()["id"] == session_id

    # Unrelated seller cannot access
    forbidden_resp = client.get(
        f"/api/v1/evidence/sessions/{session_id}",
        headers=other_seller["headers"],
    )
    assert forbidden_resp.status_code == 403


def test_update_session_status(client: TestClient, sample_test_order: Order, test_buyer: dict):
    """Lifecycle status updates (active -> completed) set completed_at timestamp."""
    create_resp = client.post(
        "/api/v1/evidence/sessions",
        headers=test_buyer["headers"],
        json={"order_id": sample_test_order.id, "session_type": "delivery"},
    )
    session_id = create_resp.json()["id"]

    patch_resp = client.patch(
        f"/api/v1/evidence/sessions/{session_id}/status",
        headers=test_buyer["headers"],
        json={"session_status": "completed"},
    )
    assert patch_resp.status_code == 200
    data = patch_resp.json()
    assert data["session_status"] == "completed"
    assert data["completed_at"] is not None


# ─────────────────────────────────────────────────────────────────────────────
# 2. EVIDENCE FILE UPLOAD & VALIDATION
# ─────────────────────────────────────────────────────────────────────────────

def test_image_uploads(client: TestClient, sample_test_order: Order, test_buyer: dict):
    """Test valid image uploads (JPEG, PNG, WebP) and verify SHA-256 calculation."""
    # 1. Create session
    sess_res = client.post(
        "/api/v1/evidence/sessions",
        headers=test_buyer["headers"],
        json={"order_id": sample_test_order.id, "session_type": "delivery"},
    )
    session_id = sess_res.json()["id"]

    # 2. Upload JPEG & PNG together
    files = [
        ("files", ("unboxing_label.jpg", io.BytesIO(VALID_JPEG_BYTES), "image/jpeg")),
        ("files", ("seal_intact.png", io.BytesIO(VALID_PNG_BYTES), "image/png")),
    ]
    upload_res = client.post(
        f"/api/v1/evidence/sessions/{session_id}/files",
        headers=test_buyer["headers"],
        files=files,
    )
    assert upload_res.status_code == 201
    file_records = upload_res.json()
    assert len(file_records) == 2

    # Verify backend computed SHA-256
    expected_jpeg_hash = hashlib.sha256(VALID_JPEG_BYTES).hexdigest()
    expected_png_hash = hashlib.sha256(VALID_PNG_BYTES).hexdigest()

    assert file_records[0]["file_hash"] == expected_jpeg_hash
    assert file_records[0]["file_size"] == len(VALID_JPEG_BYTES)
    assert file_records[1]["file_hash"] == expected_png_hash
    # Ensure physical server path is not exposed
    assert not file_records[0]["file_path"].startswith("C:\\")
    assert "/download" in file_records[0]["download_url"]


def test_video_uploads(client: TestClient, sample_test_order: Order, test_buyer: dict):
    """Test valid video uploads (MP4, WebM) with correct hashes."""
    sess_res = client.post(
        "/api/v1/evidence/sessions",
        headers=test_buyer["headers"],
        json={"order_id": sample_test_order.id, "session_type": "delivery"},
    )
    session_id = sess_res.json()["id"]

    files = [
        ("files", ("unboxing_footage.mp4", io.BytesIO(VALID_MP4_BYTES), "video/mp4")),
        ("files", ("package_inspection.webm", io.BytesIO(VALID_WEBM_BYTES), "video/webm")),
    ]
    upload_res = client.post(
        f"/api/v1/evidence/sessions/{session_id}/files",
        headers=test_buyer["headers"],
        files=files,
    )
    assert upload_res.status_code == 201
    records = upload_res.json()
    assert len(records) == 2
    assert records[0]["file_hash"] == hashlib.sha256(VALID_MP4_BYTES).hexdigest()
    assert records[1]["file_hash"] == hashlib.sha256(VALID_WEBM_BYTES).hexdigest()


def test_invalid_file_format_and_magic_mismatch(client: TestClient, sample_test_order: Order, test_buyer: dict):
    """Disallow unauthorized formats (.txt, .exe) and spoofed extensions with mismatched magic bytes."""
    sess_res = client.post(
        "/api/v1/evidence/sessions",
        headers=test_buyer["headers"],
        json={"order_id": sample_test_order.id, "session_type": "delivery"},
    )
    session_id = sess_res.json()["id"]

    # Case 1: Plain text file
    txt_files = [("files", ("notes.txt", io.BytesIO(b"Hello world plaintext"), "text/plain"))]
    res1 = client.post(
        f"/api/v1/evidence/sessions/{session_id}/files",
        headers=test_buyer["headers"],
        files=txt_files,
    )
    assert res1.status_code == 400

    # Case 2: Spoofed extension (named .jpg but contains arbitrary text bytes)
    spoofed_files = [("files", ("fake.jpg", io.BytesIO(b"This is not a real jpeg file"), "image/jpeg"))]
    res2 = client.post(
        f"/api/v1/evidence/sessions/{session_id}/files",
        headers=test_buyer["headers"],
        files=spoofed_files,
    )
    assert res2.status_code == 400


def test_oversized_file_rejected(client: TestClient, sample_test_order: Order, test_buyer: dict, monkeypatch):
    """File exceeding MAX_UPLOAD_SIZE_BYTES is rejected with HTTP 413."""
    sess_res = client.post(
        "/api/v1/evidence/sessions",
        headers=test_buyer["headers"],
        json={"order_id": sample_test_order.id, "session_type": "delivery"},
    )
    session_id = sess_res.json()["id"]

    # Temporarily set max size to 50 bytes
    monkeypatch.setattr(settings, "MAX_UPLOAD_SIZE_BYTES", 50)

    files = [("files", ("oversize.jpg", io.BytesIO(VALID_JPEG_BYTES * 5), "image/jpeg"))]
    res = client.post(
        f"/api/v1/evidence/sessions/{session_id}/files",
        headers=test_buyer["headers"],
        files=files,
    )
    assert res.status_code == 413


# ─────────────────────────────────────────────────────────────────────────────
# 3. SECURE FILE DOWNLOAD & AUTHORIZATION
# ─────────────────────────────────────────────────────────────────────────────

def test_file_download_and_unauthorized_blocking(
    client: TestClient,
    sample_test_order: Order,
    test_buyer: dict,
    test_seller: dict,
    other_buyer: dict,
):
    """Authorized parties can stream the media payload; unauthorized callers receive 403."""
    # 1. Buyer creates session and uploads file
    sess_res = client.post(
        "/api/v1/evidence/sessions",
        headers=test_buyer["headers"],
        json={"order_id": sample_test_order.id, "session_type": "delivery"},
    )
    session_id = sess_res.json()["id"]

    upload_res = client.post(
        f"/api/v1/evidence/sessions/{session_id}/files",
        headers=test_buyer["headers"],
        files=[("files", ("box_condition.png", io.BytesIO(VALID_PNG_BYTES), "image/png"))],
    )
    file_id = upload_res.json()[0]["id"]

    # 2. Buyer can download
    dl_buyer = client.get(f"/api/v1/evidence/files/{file_id}/download", headers=test_buyer["headers"])
    assert dl_buyer.status_code == 200
    assert dl_buyer.content == VALID_PNG_BYTES

    # 3. Assigned seller can also download (shared custody inspection)
    dl_seller = client.get(f"/api/v1/evidence/files/{file_id}/download", headers=test_seller["headers"])
    assert dl_seller.status_code == 200
    assert dl_seller.content == VALID_PNG_BYTES

    # 4. Third-party buyer is blocked
    dl_other = client.get(f"/api/v1/evidence/files/{file_id}/download", headers=other_buyer["headers"])
    assert dl_other.status_code == 403


# ─────────────────────────────────────────────────────────────────────────────
# 4. CONDITION ASSESSMENT REPORTS
# ─────────────────────────────────────────────────────────────────────────────

def test_condition_report_submission(client: TestClient, sample_test_order: Order, test_buyer: dict):
    """Submit and retrieve condition reports for an active evidence session."""
    sess_res = client.post(
        "/api/v1/evidence/sessions",
        headers=test_buyer["headers"],
        json={"order_id": sample_test_order.id, "session_type": "delivery"},
    )
    session_id = sess_res.json()["id"]

    report_payload = {
        "product_condition": "damaged",
        "damage_description": "Crack on bottom edge near charging port.",
        "accessories_status": "missing_cable",
        "packaging_condition": "box_crushed",
        "additional_notes": "Carrier delivered in damaged exterior sleeve.",
    }

    report_res = client.post(
        f"/api/v1/evidence/sessions/{session_id}/condition",
        headers=test_buyer["headers"],
        json=report_payload,
    )
    assert report_res.status_code == 201
    data = report_res.json()
    assert data["session_id"] == session_id
    assert data["product_condition"] == "damaged"
    assert "charging port" in data["damage_description"]
    assert "Carrier delivered" in data["damage_description"]

    # Verify retrieval
    get_res = client.get(
        f"/api/v1/evidence/sessions/{session_id}/condition",
        headers=test_buyer["headers"],
    )
    assert get_res.status_code == 200
    assert len(get_res.json()) == 1


# ─────────────────────────────────────────────────────────────────────────────
# 5. TAMPER-EVIDENT AUDIT CHAIN & TAMPERING DETECTION
# ─────────────────────────────────────────────────────────────────────────────

def test_audit_event_creation_and_chain_verification(db_session: Session):
    """Verify hash chain links and verification utility on legitimate records."""
    log1 = record_audit_event(
        db=db_session,
        event_type=AuditEventType.EVIDENCE_SESSION_CREATED,
        event_description="Session #1 created",
        user_id=1,
        order_id=10,
        commit=True,
    )
    log2 = record_audit_event(
        db=db_session,
        event_type=AuditEventType.FILE_UPLOADED,
        event_description="Photo uploaded with hash ABC",
        user_id=1,
        order_id=10,
        commit=True,
    )
    log3 = record_audit_event(
        db=db_session,
        event_type=AuditEventType.CONDITION_REPORT_SUBMITTED,
        event_description="Condition report submitted",
        user_id=1,
        order_id=10,
        commit=True,
    )

    # Verify sequential links
    assert log1.previous_hash is None
    assert log2.previous_hash == log1.current_hash
    assert log3.previous_hash == log2.current_hash

    # Run verification utility
    result = verify_audit_chain(db_session)
    assert result.is_valid is True
    assert result.total_records >= 3
    assert len(result.errors) == 0


def test_audit_tampering_detection(db_session: Session):
    """Detection of modified record content or broken hash chain links."""
    log1 = record_audit_event(
        db=db_session,
        event_type="EVENT_ALPHA",
        event_description="Original pristine event description",
        user_id=1,
        order_id=10,
        commit=True,
    )
    log2 = record_audit_event(
        db=db_session,
        event_type="EVENT_BETA",
        event_description="Second event",
        user_id=1,
        order_id=10,
        commit=True,
    )

    # 1. Modify the description of log1 directly in the database (simulating malicious database tampering)
    log1.event_description = "TAMPERED FRAUDULENT DESCRIPTION"
    db_session.commit()

    # 2. Run verification utility
    tampered_result = verify_audit_chain(db_session)
    assert tampered_result.is_valid is False
    assert log1.id in tampered_result.tampered_records
    assert any("Cryptographic tampering detected" in err for err in tampered_result.errors)


def test_concurrent_audit_event_creation(db_session: Session):
    """Multi-threaded concurrent audit creation preserves unbroken chain continuity."""
    def create_event(index: int):
        # Dedicated session per thread
        from backend.tests.conftest import TestingSessionLocal
        thread_db = TestingSessionLocal()
        try:
            record_audit_event(
                db=thread_db,
                event_type="CONCURRENT_ACTION",
                event_description=f"Thread action iteration {index}",
                user_id=1,
                order_id=99,
                commit=True,
            )
        finally:
            thread_db.close()

    # Launch 10 parallel threads simultaneously
    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
        futures = [executor.submit(create_event, i) for i in range(10)]
        concurrent.futures.wait(futures)

    # Verify unbroken global chain
    verification = verify_audit_chain(db_session)
    assert verification.is_valid is True
    assert len(verification.tampered_records) == 0
