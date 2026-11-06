"""
Automated tests for Product APIs (POST, GET, PUT, DELETE), RBAC, and inventory controls.
"""
from fastapi.testclient import TestClient


def test_create_product_by_seller_success(client: TestClient, test_seller: dict):
    """Test authenticated seller creates a new product with full details."""
    payload = {
        "product_name": "Logitech MX Master 3S",
        "description": "Ergonomic wireless mouse with 8K DPI sensor.",
        "sku": "LOGI-MX-3S-BLK",
        "category": "Peripherals",
        "brand": "Logitech",
        "price": 99.99,
        "serial_number": "SN-LOGI-889900",
    }
    response = client.post("/api/v1/products", json=payload, headers=test_seller["headers"])
    assert response.status_code == 201
    data = response.json()
    assert data["product_name"] == "Logitech MX Master 3S"
    assert data["price"] == 99.99
    assert data["sku"] == "LOGI-MX-3S-BLK"
    assert data["seller_id"] == test_seller["user"].id
    assert "id" in data
    assert "created_at" in data


def test_create_product_by_buyer_forbidden(client: TestClient, test_buyer: dict):
    """Test buyers cannot create products (403 Forbidden)."""
    payload = {
        "product_name": "Unauthorized Item",
        "price": 49.99,
    }
    response = client.post("/api/v1/products", json=payload, headers=test_buyer["headers"])
    assert response.status_code == 403
    assert "only registered sellers" in response.json()["detail"].lower()


def test_create_product_duplicate_sku_rejected(client: TestClient, test_seller: dict):
    """Test creating a product with an existing SKU returns 400 Bad Request."""
    payload = {
        "product_name": "Mouse Pad",
        "sku": "PAD-UNIQUE-01",
        "price": 19.99,
    }
    r1 = client.post("/api/v1/products", json=payload, headers=test_seller["headers"])
    assert r1.status_code == 201

    r2 = client.post("/api/v1/products", json=payload, headers=test_seller["headers"])
    assert r2.status_code == 400
    assert "sku" in r2.json()["detail"].lower()


def test_create_product_negative_price_validation(client: TestClient, test_seller: dict):
    """Test validation failure on negative price (422 Unprocessable Entity)."""
    payload = {
        "product_name": "Negative Price Item",
        "price": -10.50,
    }
    response = client.post("/api/v1/products", json=payload, headers=test_seller["headers"])
    assert response.status_code == 422


def test_list_and_filter_products(client: TestClient, test_seller: dict, other_seller: dict, test_buyer: dict):
    """Test product listing and filtering by category, brand, and seller."""
    # Seller 1 creates audio product
    client.post(
        "/api/v1/products",
        json={"product_name": "Bose Headphones", "category": "Audio", "brand": "Bose", "price": 299.00},
        headers=test_seller["headers"],
    )
    # Seller 2 creates computer product
    client.post(
        "/api/v1/products",
        json={"product_name": "Dell Monitor", "category": "Displays", "brand": "Dell", "price": 450.00},
        headers=other_seller["headers"],
    )

    # Buyer lists all products
    all_resp = client.get("/api/v1/products", headers=test_buyer["headers"])
    assert all_resp.status_code == 200
    all_prods = all_resp.json()
    assert len(all_prods) >= 2

    # Filter by category Audio
    audio_resp = client.get("/api/v1/products?category=Audio", headers=test_buyer["headers"])
    assert audio_resp.status_code == 200
    for p in audio_resp.json():
        assert p["category"] == "Audio"

    # Filter by seller_id
    seller1_resp = client.get(f"/api/v1/products?seller_id={test_seller['user'].id}", headers=test_buyer["headers"])
    assert seller1_resp.status_code == 200
    for p in seller1_resp.json():
        assert p["seller_id"] == test_seller["user"].id


def test_get_product_by_id_success_and_not_found(client: TestClient, test_seller: dict, test_buyer: dict):
    """Test retrieving single product details and 404 handling."""
    create_resp = client.post(
        "/api/v1/products",
        json={"product_name": "Keychron Q1 Pro", "price": 199.00},
        headers=test_seller["headers"],
    )
    product_id = create_resp.json()["id"]

    # Success
    get_resp = client.get(f"/api/v1/products/{product_id}", headers=test_buyer["headers"])
    assert get_resp.status_code == 200
    assert get_resp.json()["product_name"] == "Keychron Q1 Pro"

    # 404 Not Found
    nf_resp = client.get("/api/v1/products/99999", headers=test_buyer["headers"])
    assert nf_resp.status_code == 404


def test_update_product_permissions(client: TestClient, test_seller: dict, other_seller: dict, test_buyer: dict):
    """Test product update authorization (only owner or admin can update)."""
    create_resp = client.post(
        "/api/v1/products",
        json={"product_name": "Initial Name", "price": 50.00},
        headers=test_seller["headers"],
    )
    product_id = create_resp.json()["id"]

    # Other seller cannot update (403 Forbidden)
    forbidden_resp = client.put(
        f"/api/v1/products/{product_id}",
        json={"product_name": "Hacked Name"},
        headers=other_seller["headers"],
    )
    assert forbidden_resp.status_code == 403

    # Buyer cannot update (403 Forbidden)
    buyer_resp = client.put(
        f"/api/v1/products/{product_id}",
        json={"product_name": "Buyer Name"},
        headers=test_buyer["headers"],
    )
    assert buyer_resp.status_code == 403

    # Owner seller updates successfully (200 OK)
    update_resp = client.put(
        f"/api/v1/products/{product_id}",
        json={"product_name": "Updated Title", "price": 65.00},
        headers=test_seller["headers"],
    )
    assert update_resp.status_code == 200
    assert update_resp.json()["product_name"] == "Updated Title"
    assert update_resp.json()["price"] == 65.00


def test_delete_product_permissions_and_safety(client: TestClient, test_seller: dict, other_seller: dict, test_buyer: dict):
    """Test product deletion ownership checks and prevention of deleting ordered items."""
    # Create product
    create_resp = client.post(
        "/api/v1/products",
        json={"product_name": "Disposable Item", "price": 10.00},
        headers=test_seller["headers"],
    )
    product_id = create_resp.json()["id"]

    # Other seller cannot delete (403)
    assert client.delete(f"/api/v1/products/{product_id}", headers=other_seller["headers"]).status_code == 403

    # Buyer places an order on this product
    client.post(
        "/api/v1/orders",
        json={"product_id": product_id, "seller_id": test_seller["user"].id},
        headers=test_buyer["headers"],
    )

    # Owner tries to delete product with orders (400 Bad Request safety block)
    del_order_resp = client.delete(f"/api/v1/products/{product_id}", headers=test_seller["headers"])
    assert del_order_resp.status_code == 400
    assert "associated orders" in del_order_resp.json()["detail"].lower()

    # Create standalone product with no orders and delete it successfully (204 No Content)
    p2_resp = client.post(
        "/api/v1/products",
        json={"product_name": "No Orders Item", "price": 25.00},
        headers=test_seller["headers"],
    )
    p2_id = p2_resp.json()["id"]
    del_resp = client.delete(f"/api/v1/products/{p2_id}", headers=test_seller["headers"])
    assert del_resp.status_code == 204

    # Verify 404 on subsequent get
    assert client.get(f"/api/v1/products/{p2_id}", headers=test_buyer["headers"]).status_code == 404
