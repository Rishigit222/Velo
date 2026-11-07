"""
Comprehensive integration and unit test suite for the Dispute Management module.
Covers:
- POST /api/v1/disputes (Creation, Validation, Reason enums, RBAC)
- 409 Conflict on duplicate active disputes
- GET /api/v1/disputes (Listing with RBAC filtering for buyer, seller, admin)
- GET /api/v1/disputes/{dispute_id} (Detail retrieval with RBAC)
- PATCH /api/v1/disputes/{dispute_id}/status (Status transitions, RBAC, terminal checks)
- GET /api/v1/orders/{order_id}/disputes (Order disputes listing with RBAC)
- Audit log verification for dispute lifecycle events
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from backend.app.models.audit_log import AuditLog
from backend.app.models.order import Order
from backend.app.models.product import Product


def create_order_helper(
    db_session: Session,
    buyer_id: int,
    seller_id: int,
    product_id: int,
    order_number: str = "ORD-TEST-DISP-001",
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


class TestDisputeCreation:
    """Test dispute filing endpoints and RBAC constraints."""

    def test_buyer_create_dispute_success(
        self,
        client: TestClient,
        db_session: Session,
        test_buyer: dict,
        test_seller: dict,
        test_product: Product,
    ):
        order = create_order_helper(
            db_session,
            buyer_id=test_buyer["user"].id,
            seller_id=test_seller["user"].id,
            product_id=test_product.id,
            order_number="ORD-DISP-001",
        )

        payload = {
            "order_id": order.id,
            "dispute_reason": "Product returned damaged",
            "description": "The item was received with severe scratches on the front display.",
        }

        response = client.post(
            "/api/v1/disputes",
            json=payload,
            headers=test_buyer["headers"],
        )

        assert response.status_code == 201, response.text
        data = response.json()
        assert data["order_id"] == order.id
        assert data["dispute_reason"] == "Product returned damaged"
        assert data["description"] == payload["description"]
        assert data["status"] == "submitted"
        assert data["raised_by"] == test_buyer["user"].id
        assert data["id"] is not None

        # Verify audit log created
        log = (
            db_session.query(AuditLog)
            .filter(AuditLog.event_type == "DISPUTE_CREATED")
            .order_by(AuditLog.id.desc())
            .first()
        )
        assert log is not None
        assert f"Dispute #{data['id']}" in log.event_description
        assert log.user_id == test_buyer["user"].id
        assert log.order_id == order.id

    def test_dispute_invalid_reason_fails(
        self,
        client: TestClient,
        db_session: Session,
        test_buyer: dict,
        test_seller: dict,
        test_product: Product,
    ):
        order = create_order_helper(
            db_session,
            buyer_id=test_buyer["user"].id,
            seller_id=test_seller["user"].id,
            product_id=test_product.id,
            order_number="ORD-DISP-002",
        )

        payload = {
            "order_id": order.id,
            "dispute_reason": "Totally invalid reason not in enum",
            "description": "Some description",
        }

        response = client.post(
            "/api/v1/disputes",
            json=payload,
            headers=test_buyer["headers"],
        )
        assert response.status_code == 422

    def test_non_buyer_cannot_file_dispute(
        self,
        client: TestClient,
        db_session: Session,
        test_buyer: dict,
        other_buyer: dict,
        test_seller: dict,
        test_product: Product,
    ):
        order = create_order_helper(
            db_session,
            buyer_id=test_buyer["user"].id,
            seller_id=test_seller["user"].id,
            product_id=test_product.id,
            order_number="ORD-DISP-003",
        )

        payload = {
            "order_id": order.id,
            "dispute_reason": "Missing accessories",
            "description": "Missing cables and charger.",
        }

        response = client.post(
            "/api/v1/disputes",
            json=payload,
            headers=other_buyer["headers"],
        )
        assert response.status_code == 403
        assert "not authorized" in response.json()["detail"].lower()

    def test_dispute_nonexistent_order_404(
        self,
        client: TestClient,
        test_buyer: dict,
    ):
        payload = {
            "order_id": 999999,
            "dispute_reason": "Other",
            "description": "Order does not exist",
        }
        response = client.post(
            "/api/v1/disputes",
            json=payload,
            headers=test_buyer["headers"],
        )
        assert response.status_code == 404

    def test_duplicate_active_dispute_conflict_409(
        self,
        client: TestClient,
        db_session: Session,
        test_buyer: dict,
        test_seller: dict,
        test_product: Product,
    ):
        order = create_order_helper(
            db_session,
            buyer_id=test_buyer["user"].id,
            seller_id=test_seller["user"].id,
            product_id=test_product.id,
            order_number="ORD-DISP-004",
        )

        payload = {
            "order_id": order.id,
            "dispute_reason": "Packaging issue",
            "description": "The box was torn during transit.",
        }

        # First dispute should succeed
        res1 = client.post("/api/v1/disputes", json=payload, headers=test_buyer["headers"])
        assert res1.status_code == 201

        # Second dispute for the same order should fail with 409 Conflict
        res2 = client.post("/api/v1/disputes", json=payload, headers=test_buyer["headers"])
        assert res2.status_code == 409
        assert "already exists" in res2.json()["detail"].lower()


class TestDisputeListingAndDetail:
    """Test dispute listing RBAC and dispute detail retrieval."""

    def test_dispute_listing_rbac(
        self,
        client: TestClient,
        db_session: Session,
        test_buyer: dict,
        other_buyer: dict,
        test_seller: dict,
        other_seller: dict,
        test_admin: dict,
        test_product: Product,
    ):
        # Order 1: test_buyer & test_seller
        o1 = create_order_helper(
            db_session,
            buyer_id=test_buyer["user"].id,
            seller_id=test_seller["user"].id,
            product_id=test_product.id,
            order_number="ORD-DISP-L1",
        )
        # Order 2: other_buyer & other_seller
        o2 = create_order_helper(
            db_session,
            buyer_id=other_buyer["user"].id,
            seller_id=other_seller["user"].id,
            product_id=test_product.id,
            order_number="ORD-DISP-L2",
        )

        # Buyer 1 files dispute on o1
        r1 = client.post(
            "/api/v1/disputes",
            json={"order_id": o1.id, "dispute_reason": "Incorrect return", "description": "Wrong item"},
            headers=test_buyer["headers"],
        )
        assert r1.status_code == 201
        d1_id = r1.json()["id"]

        # Buyer 2 files dispute on o2
        r2 = client.post(
            "/api/v1/disputes",
            json={"order_id": o2.id, "dispute_reason": "Product identity mismatch", "description": "Serial mismatch"},
            headers=other_buyer["headers"],
        )
        assert r2.status_code == 201
        d2_id = r2.json()["id"]

        # 1. Buyer 1 listing: should only see d1
        buyer_list = client.get("/api/v1/disputes", headers=test_buyer["headers"]).json()
        assert len(buyer_list) == 1
        assert buyer_list[0]["id"] == d1_id

        # 2. Seller 1 listing: should only see d1
        seller_list = client.get("/api/v1/disputes", headers=test_seller["headers"]).json()
        assert len(seller_list) == 1
        assert seller_list[0]["id"] == d1_id

        # 3. Seller 2 listing: should only see d2
        seller2_list = client.get("/api/v1/disputes", headers=other_seller["headers"]).json()
        assert len(seller2_list) == 1
        assert seller2_list[0]["id"] == d2_id

        # 4. Admin listing: should see both d1 and d2
        admin_list = client.get("/api/v1/disputes", headers=test_admin["headers"]).json()
        assert len(admin_list) >= 2
        admin_ids = [d["id"] for d in admin_list]
        assert d1_id in admin_ids
        assert d2_id in admin_ids

    def test_dispute_detail_endpoint(
        self,
        client: TestClient,
        db_session: Session,
        test_buyer: dict,
        other_buyer: dict,
        test_seller: dict,
        test_product: Product,
    ):
        order = create_order_helper(
            db_session,
            buyer_id=test_buyer["user"].id,
            seller_id=test_seller["user"].id,
            product_id=test_product.id,
            order_number="ORD-DISP-DTL",
        )

        r = client.post(
            "/api/v1/disputes",
            json={"order_id": order.id, "dispute_reason": "Other", "description": "Detailed inquiry"},
            headers=test_buyer["headers"],
        )
        dispute_id = r.json()["id"]

        # Buyer can retrieve details
        buyer_detail = client.get(f"/api/v1/disputes/{dispute_id}", headers=test_buyer["headers"])
        assert buyer_detail.status_code == 200
        data = buyer_detail.json()
        assert data["id"] == dispute_id
        assert data["order"] is not None
        assert data["order"]["order_number"] == "ORD-DISP-DTL"

        # Seller can retrieve details
        seller_detail = client.get(f"/api/v1/disputes/{dispute_id}", headers=test_seller["headers"])
        assert seller_detail.status_code == 200

        # Unrelated buyer cannot retrieve details (403)
        unauth_detail = client.get(f"/api/v1/disputes/{dispute_id}", headers=other_buyer["headers"])
        assert unauth_detail.status_code == 403


class TestDisputeStatusTransitions:
    """Test state machine transitions and permissions for disputes."""

    def test_full_resolution_workflow(
        self,
        client: TestClient,
        db_session: Session,
        test_buyer: dict,
        test_seller: dict,
        test_admin: dict,
        test_product: Product,
    ):
        order = create_order_helper(
            db_session,
            buyer_id=test_buyer["user"].id,
            seller_id=test_seller["user"].id,
            product_id=test_product.id,
            order_number="ORD-DISP-WF",
        )

        # Buyer files dispute -> status: submitted
        r = client.post(
            "/api/v1/disputes",
            json={"order_id": order.id, "dispute_reason": "Product returned damaged", "description": "Damaged frame."},
            headers=test_buyer["headers"],
        )
        dispute_id = r.json()["id"]
        assert r.json()["status"] == "submitted"

        # Buyer cannot transition dispute to under_review or resolved (403)
        buyer_patch = client.patch(
            f"/api/v1/disputes/{dispute_id}/status",
            json={"status": "under_review"},
            headers=test_buyer["headers"],
        )
        assert buyer_patch.status_code == 403

        # Seller moves to under_review -> 200
        seller_patch = client.patch(
            f"/api/v1/disputes/{dispute_id}/status",
            json={"status": "under_review"},
            headers=test_seller["headers"],
        )
        assert seller_patch.status_code == 200
        assert seller_patch.json()["status"] == "under_review"

        # Verify audit log for DISPUTE_MOVED_TO_REVIEW
        review_log = (
            db_session.query(AuditLog)
            .filter(AuditLog.event_type == "DISPUTE_MOVED_TO_REVIEW")
            .order_by(AuditLog.id.desc())
            .first()
        )
        assert review_log is not None
        assert f"Dispute #{dispute_id}" in review_log.event_description

        # Admin resolves the dispute with resolution details
        admin_resolve = client.patch(
            f"/api/v1/disputes/{dispute_id}/status",
            json={
                "status": "resolved",
                "resolution_details": "Refund approved and seller compensated under buyer guarantee.",
            },
            headers=test_admin["headers"],
        )
        assert admin_resolve.status_code == 200
        res_data = admin_resolve.json()
        assert res_data["status"] == "resolved"
        assert res_data["resolution_details"] is not None

        # Verify audit log for DISPUTE_RESOLVED
        resolved_log = (
            db_session.query(AuditLog)
            .filter(AuditLog.event_type == "DISPUTE_RESOLVED")
            .order_by(AuditLog.id.desc())
            .first()
        )
        assert resolved_log is not None
        assert f"Dispute #{dispute_id}" in resolved_log.event_description

        # Terminal state test: Cannot transition an already resolved dispute
        terminal_patch = client.patch(
            f"/api/v1/disputes/{dispute_id}/status",
            json={"status": "rejected"},
            headers=test_admin["headers"],
        )
        assert terminal_patch.status_code == 400
        assert "cannot be modified" in terminal_patch.json()["detail"].lower()

    def test_invalid_transition_fails(
        self,
        client: TestClient,
        db_session: Session,
        test_buyer: dict,
        test_admin: dict,
        test_product: Product,
        test_seller: dict,
    ):
        order = create_order_helper(
            db_session,
            buyer_id=test_buyer["user"].id,
            seller_id=test_seller["user"].id,
            product_id=test_product.id,
            order_number="ORD-DISP-INV",
        )

        r = client.post(
            "/api/v1/disputes",
            json={"order_id": order.id, "dispute_reason": "Other", "description": "Needs review"},
            headers=test_buyer["headers"],
        )
        dispute_id = r.json()["id"]

        # Attempting direct transition from submitted to resolved without under_review should fail (400)
        invalid_patch = client.patch(
            f"/api/v1/disputes/{dispute_id}/status",
            json={"status": "resolved"},
            headers=test_admin["headers"],
        )
        assert invalid_patch.status_code == 400
        assert "invalid status transition" in invalid_patch.json()["detail"].lower()


class TestOrderDisputesEndpoint:
    """Test GET /api/v1/orders/{order_id}/disputes endpoint."""

    def test_get_order_disputes(
        self,
        client: TestClient,
        db_session: Session,
        test_buyer: dict,
        other_buyer: dict,
        test_seller: dict,
        test_product: Product,
    ):
        order = create_order_helper(
            db_session,
            buyer_id=test_buyer["user"].id,
            seller_id=test_seller["user"].id,
            product_id=test_product.id,
            order_number="ORD-DISP-ORD-EP",
        )

        # File dispute
        client.post(
            "/api/v1/disputes",
            json={"order_id": order.id, "dispute_reason": "Missing accessories", "description": "No charger"},
            headers=test_buyer["headers"],
        )

        # Order buyer can query order disputes
        res = client.get(f"/api/v1/orders/{order.id}/disputes", headers=test_buyer["headers"])
        assert res.status_code == 200
        disputes = res.json()
        assert len(disputes) == 1
        assert disputes[0]["order_id"] == order.id

        # Order seller can query order disputes
        res_seller = client.get(f"/api/v1/orders/{order.id}/disputes", headers=test_seller["headers"])
        assert res_seller.status_code == 200
        assert len(res_seller.json()) == 1

        # Unrelated buyer cannot query order disputes (403)
        res_unauth = client.get(f"/api/v1/orders/{order.id}/disputes", headers=other_buyer["headers"])
        assert res_unauth.status_code == 403
