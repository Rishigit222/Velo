"""
Automated tests for Day 1 Prompt 2: Complete Relational Database Architecture.
Verifies all 6 new models, relationships, foreign keys, cascades, and hash-chain audit logging.
"""
from datetime import datetime, timezone
import pytest
from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.app.models.audit_log import AuditLog
from backend.app.models.condition_report import ConditionReport
from backend.app.models.dispute import Dispute
from backend.app.models.evidence_file import EvidenceFile
from backend.app.models.evidence_session import EvidenceSession, SessionStatus, SessionType
from backend.app.models.order import Order
from backend.app.models.product import Product
from backend.app.models.user import User
from backend.app.models.verification_result import VerificationResult


@pytest.fixture
def sample_order(db_session: Session) -> Order:
    """Fixture providing a complete order with buyer, seller, and product."""
    buyer = User(
        full_name="Relational Buyer",
        email="relational_buyer@example.com",
        password_hash="hash123",
        role="buyer",
    )
    seller = User(
        full_name="Relational Seller",
        email="relational_seller@example.com",
        password_hash="hash123",
        role="seller",
    )
    product = Product(
        product_name="Sony Alpha A7 IV",
        brand="Sony",
        serial_number="SN-A7IV-991122",
    )
    db_session.add_all([buyer, seller, product])
    db_session.commit()

    order = Order(
        order_number="ORD-REL-0001",
        buyer_id=buyer.id,
        seller_id=seller.id,
        product_id=product.id,
        status="pending",
    )
    db_session.add(order)
    db_session.commit()
    db_session.refresh(order)
    return order


def test_evidence_session_creation_and_types(db_session: Session, sample_order: Order):
    """Test creating evidence sessions for both delivery and return phases."""
    # 1. Delivery unboxing session
    delivery_session = EvidenceSession(
        order_id=sample_order.id,
        session_type=SessionType.DELIVERY.value,
        created_by=sample_order.buyer_id,
        session_status=SessionStatus.ACTIVE.value,
    )
    # 2. Return inspection session
    return_session = EvidenceSession(
        order_id=sample_order.id,
        session_type=SessionType.RETURN.value,
        created_by=sample_order.seller_id,
        session_status=SessionStatus.COMPLETED.value,
        completed_at=datetime.now(timezone.utc),
    )
    db_session.add_all([delivery_session, return_session])
    db_session.commit()
    db_session.refresh(delivery_session)
    db_session.refresh(return_session)

    # Verify attributes and relationships
    assert delivery_session.id is not None
    assert delivery_session.session_type == "delivery"
    assert delivery_session.session_status == "active"
    assert delivery_session.order.order_number == "ORD-REL-0001"
    assert delivery_session.creator.email == "relational_buyer@example.com"

    assert return_session.session_type == "return"
    assert return_session.completed_at is not None

    # Verify Order -> EvidenceSessions relationship
    db_session.refresh(sample_order)
    assert len(sample_order.evidence_sessions) == 2
    session_types = {s.session_type for s in sample_order.evidence_sessions}
    assert "delivery" in session_types
    assert "return" in session_types


def test_evidence_file_relationships(db_session: Session, sample_order: Order):
    """Test attaching immutable evidence media files with SHA-256 hashes to a session."""
    session = EvidenceSession(
        order_id=sample_order.id,
        session_type=SessionType.DELIVERY.value,
        created_by=sample_order.buyer_id,
    )
    db_session.add(session)
    db_session.commit()
    db_session.refresh(session)

    # Attach label photo and unboxing video
    file1 = EvidenceFile(
        session_id=session.id,
        file_name="tamper_seal_close_up.jpg",
        file_type="image/jpeg",
        file_path="uploads/sessions/1/tamper_seal.jpg",
        file_hash="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        file_size=2048500,
        uploaded_by=sample_order.buyer_id,
    )
    file2 = EvidenceFile(
        session_id=session.id,
        file_name="continuous_unboxing.mp4",
        file_type="video/mp4",
        file_path="uploads/sessions/1/unboxing.mp4",
        file_hash="5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8",
        file_size=45000000,
        uploaded_by=sample_order.buyer_id,
    )
    db_session.add_all([file1, file2])
    db_session.commit()

    db_session.refresh(session)
    assert len(session.files) == 2
    file_hashes = [f.file_hash for f in session.files]
    assert file1.file_hash in file_hashes
    assert file2.file_hash in file_hashes
    assert file1.session.id == session.id


def test_condition_report_creation(db_session: Session, sample_order: Order):
    """Test creating structured condition assessment reports for an evidence session."""
    session = EvidenceSession(
        order_id=sample_order.id,
        session_type=SessionType.DELIVERY.value,
        created_by=sample_order.buyer_id,
    )
    db_session.add(session)
    db_session.commit()

    report = ConditionReport(
        session_id=session.id,
        product_condition="damaged",
        damage_description="Deep hairline crack across the primary camera lens element.",
        accessories_status="missing_charger_cable",
        packaging_condition="seal_broken_and_box_crushed",
    )
    db_session.add(report)
    db_session.commit()
    db_session.refresh(session)

    assert len(session.condition_reports) == 1
    stored_report = session.condition_reports[0]
    assert stored_report.product_condition == "damaged"
    assert "crack" in stored_report.damage_description
    assert stored_report.session.order_id == sample_order.id


def test_verification_result_relationships(db_session: Session, sample_order: Order):
    """Test creating verification results linking original delivery and return sessions."""
    # 1. Create delivery session
    delivery = EvidenceSession(
        order_id=sample_order.id,
        session_type=SessionType.DELIVERY.value,
        created_by=sample_order.buyer_id,
        session_status=SessionStatus.COMPLETED.value,
    )
    # 2. Create return session
    return_sess = EvidenceSession(
        order_id=sample_order.id,
        session_type=SessionType.RETURN.value,
        created_by=sample_order.seller_id,
        session_status=SessionStatus.COMPLETED.value,
    )
    db_session.add_all([delivery, return_sess])
    db_session.commit()

    # 3. Create verification comparing both sessions
    verification = VerificationResult(
        order_id=sample_order.id,
        original_session_id=delivery.id,
        return_session_id=return_sess.id,
        identity_result="match",
        damage_result="customer_induced_scratch",
        accessories_result="missing_power_adapter",
        overall_status="rejected",
        confidence_score=0.96,
        findings="Serial number matches original delivery; new scratch detected on bottom bezel.",
    )
    db_session.add(verification)
    db_session.commit()
    db_session.refresh(verification)

    assert verification.id is not None
    assert verification.order.order_number == sample_order.order_number
    assert verification.original_session.session_type == "delivery"
    assert verification.return_session.session_type == "return"
    assert verification.confidence_score == 0.96

    # Verify reverse relationship on order
    db_session.refresh(sample_order)
    assert len(sample_order.verification_results) == 1
    assert sample_order.verification_results[0].overall_status == "rejected"


def test_dispute_creation_and_lifecycle(db_session: Session, sample_order: Order):
    """Test filing a dispute on an order by buyer or seller."""
    dispute = Dispute(
        order_id=sample_order.id,
        raised_by=sample_order.buyer_id,
        dispute_reason="Item received in damaged state",
        description="Parcel was delivered with crushed exterior box and damaged lens glass.",
        status="open",
    )
    db_session.add(dispute)
    db_session.commit()
    db_session.refresh(dispute)

    assert dispute.id is not None
    assert dispute.status == "open"
    assert dispute.claimant.email == "relational_buyer@example.com"
    assert dispute.order.id == sample_order.id

    # Update dispute status
    dispute.status = "under_review"
    db_session.commit()
    db_session.refresh(dispute)
    assert dispute.status == "under_review"

    # Verify reverse relationship
    db_session.refresh(sample_order)
    assert len(sample_order.disputes) == 1
    assert sample_order.disputes[0].dispute_reason == "Item received in damaged state"


def test_audit_log_hash_chain(db_session: Session, sample_order: Order):
    """Test tamper-evident hash chaining across audit log events."""
    ts1 = datetime.now(timezone.utc).isoformat()
    h1 = AuditLog.compute_hash(
        previous_hash=None,
        event_type="ORDER_PLACED",
        event_description="Order ORD-REL-0001 placed by buyer",
        timestamp_iso=ts1,
    )
    log1 = AuditLog(
        user_id=sample_order.buyer_id,
        order_id=sample_order.id,
        event_type="ORDER_PLACED",
        event_description="Order ORD-REL-0001 placed by buyer",
        previous_hash=None,
        current_hash=h1,
    )
    db_session.add(log1)
    db_session.commit()

    ts2 = datetime.now(timezone.utc).isoformat()
    h2 = AuditLog.compute_hash(
        previous_hash=h1,
        event_type="EVIDENCE_UPLOADED",
        event_description="Delivery unboxing video uploaded",
        timestamp_iso=ts2,
    )
    log2 = AuditLog(
        user_id=sample_order.buyer_id,
        order_id=sample_order.id,
        event_type="EVIDENCE_UPLOADED",
        event_description="Delivery unboxing video uploaded",
        previous_hash=h1,
        current_hash=h2,
    )
    db_session.add(log2)
    db_session.commit()

    # Verify hash chain continuity
    logs = list(
        db_session.execute(
            select(AuditLog).where(AuditLog.order_id == sample_order.id).order_by(AuditLog.id.asc())
        ).scalars().all()
    )
    assert len(logs) == 2
    assert logs[0].previous_hash is None
    assert logs[1].previous_hash == logs[0].current_hash
    assert logs[0].user.email == "relational_buyer@example.com"


def test_cascade_delete_integrity(db_session: Session, sample_order: Order):
    """Test that deleting an order cascades to its dependent evidence sessions, disputes, and verifications."""
    session = EvidenceSession(
        order_id=sample_order.id,
        session_type=SessionType.DELIVERY.value,
        created_by=sample_order.buyer_id,
    )
    db_session.add(session)
    db_session.commit()

    file_item = EvidenceFile(
        session_id=session.id,
        file_name="package.jpg",
        file_type="image/jpeg",
        file_path="uploads/pkg.jpg",
        file_hash="a" * 64,
        file_size=1024,
    )
    report = ConditionReport(
        session_id=session.id,
        product_condition="good",
    )
    dispute = Dispute(
        order_id=sample_order.id,
        raised_by=sample_order.buyer_id,
        dispute_reason="Late shipment",
        description="Shipment arrived 10 days late",
    )
    db_session.add_all([file_item, report, dispute])
    db_session.commit()

    session_id = session.id
    order_id = sample_order.id

    # Delete order
    db_session.delete(sample_order)
    db_session.commit()

    # Verify dependent sessions, files, reports, and disputes are removed
    assert db_session.execute(select(EvidenceSession).where(EvidenceSession.id == session_id)).scalar_one_or_none() is None
    assert db_session.execute(select(EvidenceFile).where(EvidenceFile.session_id == session_id)).scalar_one_or_none() is None
    assert db_session.execute(select(ConditionReport).where(ConditionReport.session_id == session_id)).scalar_one_or_none() is None
    assert db_session.execute(select(Dispute).where(Dispute.order_id == order_id)).scalar_one_or_none() is None

