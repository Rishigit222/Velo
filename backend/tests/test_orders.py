"""
Tests for order creation, listing, retrieval, updates, and role-based access control.
"""
from fastapi.testclient import TestClient


def test_order_creation_success(client: TestClient, test_buyer: dict, test_seller: dict, test_product):
    """Test authenticated buyer creates an order successfully."""
    payload = {
        "seller_id": test_seller["user"].id,
        "product_id": test_product.id,
    }
    response = client.post("/api/v1/orders", json=payload, headers=test_buyer["headers"])
    assert response.status_code == 201
    data = response.json()
    assert data["buyer_id"] == test_buyer["user"].id
    assert data["seller_id"] == test_seller["user"].id
    assert data["product_id"] == test_product.id
    assert data["status"] == "pending"
    assert "ORD-" in data["order_number"]
    assert data["buyer"]["email"] == test_buyer["user"].email
    assert data["product"]["product_name"] == test_product.product_name


def test_order_creation_with_inline_product(client: TestClient, test_buyer: dict, test_seller: dict):
    """Test order creation where product is provisioned inline."""
    payload = {
        "seller_id": test_seller["user"].id,
        "product_name": "Apple iPad Pro",
        "brand": "Apple",
        "serial_number": "IPAD-SER-888999",
    }
    response = client.post("/api/v1/orders", json=payload, headers=test_buyer["headers"])
    assert response.status_code == 201
    data = response.json()
    assert data["product"]["product_name"] == "Apple iPad Pro"
    assert data["product"]["serial_number"] == "IPAD-SER-888999"


def test_order_creation_invalid_seller(client: TestClient, test_buyer: dict, test_product):
    """Test order creation fails if seller does not exist."""
    payload = {
        "seller_id": 99999,
        "product_id": test_product.id,
    }
    response = client.post("/api/v1/orders", json=payload, headers=test_buyer["headers"])
    assert response.status_code == 400
    assert "not found" in response.json()["detail"].lower()


def test_order_creation_unauthenticated(client: TestClient, test_seller: dict, test_product):
    """Test unauthenticated order creation returns 401 Unauthorized."""
    payload = {
        "seller_id": test_seller["user"].id,
        "product_id": test_product.id,
    }
    response = client.post("/api/v1/orders", json=payload)
    assert response.status_code == 401


def test_order_listing_role_isolation(
    client: TestClient,
    test_buyer: dict,
    other_buyer: dict,
    test_seller: dict,
    other_seller: dict,
    test_admin: dict,
    test_product,
):
    """
    Test order listing isolation:
    - Buyer 1 sees only Buyer 1 orders
    - Seller 1 sees only Seller 1 orders
    - Admin sees all orders
    """
    # Create Order 1: Buyer 1 -> Seller 1
    resp1 = client.post(
        "/api/v1/orders",
        json={"seller_id": test_seller["user"].id, "product_id": test_product.id},
        headers=test_buyer["headers"],
    )
    assert resp1.status_code == 201
    order1_id = resp1.json()["id"]

    # Create Order 2: Other Buyer -> Other Seller
    resp2 = client.post(
        "/api/v1/orders",
        json={"seller_id": other_seller["user"].id, "product_id": test_product.id},
        headers=other_buyer["headers"],
    )
    assert resp2.status_code == 201
    order2_id = resp2.json()["id"]

    # Buyer 1 lists orders: should only see Order 1
    buyer1_orders = client.get("/api/v1/orders", headers=test_buyer["headers"]).json()
    buyer1_ids = [o["id"] for o in buyer1_orders]
    assert order1_id in buyer1_ids
    assert order2_id not in buyer1_ids

    # Seller 1 lists orders: should only see Order 1
    seller1_orders = client.get("/api/v1/orders", headers=test_seller["headers"]).json()
    seller1_ids = [o["id"] for o in seller1_orders]
    assert order1_id in seller1_ids
    assert order2_id not in seller1_ids

    # Admin lists orders: should see both Order 1 and Order 2
    admin_orders = client.get("/api/v1/orders", headers=test_admin["headers"]).json()
    admin_ids = [o["id"] for o in admin_orders]
    assert order1_id in admin_ids
    assert order2_id in admin_ids


def test_order_detail_access_restrictions(
    client: TestClient,
    test_buyer: dict,
    other_buyer: dict,
    test_seller: dict,
    other_seller: dict,
    test_admin: dict,
    test_product,
):
    """Test detailed permission boundaries on GET /api/v1/orders/{order_id}."""
    # Create Order for test_buyer with test_seller
    resp = client.post(
        "/api/v1/orders",
        json={"seller_id": test_seller["user"].id, "product_id": test_product.id},
        headers=test_buyer["headers"],
    )
    order_id = resp.json()["id"]

    # test_buyer can view
    assert client.get(f"/api/v1/orders/{order_id}", headers=test_buyer["headers"]).status_code == 200

    # other_buyer cannot view (403 Forbidden)
    assert client.get(f"/api/v1/orders/{order_id}", headers=other_buyer["headers"]).status_code == 403

    # test_seller can view
    assert client.get(f"/api/v1/orders/{order_id}", headers=test_seller["headers"]).status_code == 200

    # other_seller cannot view (403 Forbidden)
    assert client.get(f"/api/v1/orders/{order_id}", headers=other_seller["headers"]).status_code == 403

    # admin can view
    assert client.get(f"/api/v1/orders/{order_id}", headers=test_admin["headers"]).status_code == 200

    # Non-existent order (404 Not Found)
    assert client.get("/api/v1/orders/99999", headers=test_admin["headers"]).status_code == 404


def test_order_update_seller_permissions(
    client: TestClient,
    test_buyer: dict,
    test_seller: dict,
    other_seller: dict,
    test_product,
):
    """Test seller can update status of assigned order, but cannot update unassigned order."""
    # Create order
    resp = client.post(
        "/api/v1/orders",
        json={"seller_id": test_seller["user"].id, "product_id": test_product.id},
        headers=test_buyer["headers"],
    )
    order_id = resp.json()["id"]

    # Assigned seller updates status to shipped
    update_resp = client.put(
        f"/api/v1/orders/{order_id}",
        json={"status": "shipped"},
        headers=test_seller["headers"],
    )
    assert update_resp.status_code == 200
    assert update_resp.json()["status"] == "shipped"

    # Other seller tries to update -> 403 Forbidden
    forbidden_resp = client.put(
        f"/api/v1/orders/{order_id}",
        json={"status": "delivered"},
        headers=other_seller["headers"],
    )
    assert forbidden_resp.status_code == 403


def test_order_update_buyer_permissions(
    client: TestClient,
    test_buyer: dict,
    other_buyer: dict,
    test_seller: dict,
    test_product,
):
    """Test buyer can cancel their pending order, but cannot mark it shipped/delivered."""
    # Create order
    resp = client.post(
        "/api/v1/orders",
        json={"seller_id": test_seller["user"].id, "product_id": test_product.id},
        headers=test_buyer["headers"],
    )
    order_id = resp.json()["id"]

    # Buyer tries unauthorized status change to shipped -> 400 Bad Request
    invalid_resp = client.put(
        f"/api/v1/orders/{order_id}",
        json={"status": "shipped"},
        headers=test_buyer["headers"],
    )
    assert invalid_resp.status_code == 400

    # Other buyer tries to cancel -> 403 Forbidden
    forbidden_resp = client.put(
        f"/api/v1/orders/{order_id}",
        json={"status": "cancelled"},
        headers=other_buyer["headers"],
    )
    assert forbidden_resp.status_code == 403

    # Own buyer cancels order -> 200 OK
    cancel_resp = client.put(
        f"/api/v1/orders/{order_id}",
        json={"status": "cancelled"},
        headers=test_buyer["headers"],
    )
    assert cancel_resp.status_code == 200
    assert cancel_resp.json()["status"] == "cancelled"

