"""
End-to-end verification script for ReturnProof backend, Products, and Orders.
"""
import sys
from pathlib import Path

# Add project root to sys.path
root_dir = str(Path(__file__).resolve().parent.parent)
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

import sqlite3
from fastapi.testclient import TestClient
from backend.app.main import app

def run_verification():
    print("=" * 60)
    print("ReturnProof End-to-End System Verification (Step 3)")
    print("=" * 60)

    # 1. Inspect SQLite Database
    conn = sqlite3.connect("backend/returnproof.db")
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = [row[0] for row in cursor.fetchall()]
    print(f"[OK] Database connected. Found {len(tables)} tables: {tables}")
    assert "users" in tables
    assert "products" in tables
    assert "orders" in tables
    conn.close()

    client = TestClient(app)

    # 2. Test Root & Health Endpoints
    r_root = client.get("/")
    assert r_root.status_code == 200, f"Root failed: {r_root.text}"
    print(f"[OK] Root Endpoint ('/'): {r_root.json()}")

    r_health = client.get("/health")
    assert r_health.status_code == 200
    print(f"[OK] Global Health ('/health'): {r_health.json()['status']}")

    r_v1_health = client.get("/api/v1/health")
    assert r_v1_health.status_code == 200
    print(f"[OK] v1 Health ('/api/v1/health'): {r_v1_health.json()['status']}")

    # 3. Test Swagger Docs & OpenAPI Specification
    r_docs = client.get("/docs")
    assert r_docs.status_code == 200
    print("[OK] Swagger UI accessible at /docs (HTTP 200)")

    r_openapi = client.get("/openapi.json")
    assert r_openapi.status_code == 200
    openapi_data = r_openapi.json()
    paths = list(openapi_data.get("paths", {}).keys())
    print(f"[OK] OpenAPI schema generated with {len(paths)} routes: {paths}")
    assert "/api/v1/products" in paths
    assert "/api/v1/products/{product_id}" in paths
    assert "/api/v1/orders/{order_id}/status" in paths

    # 4. Authentication flow
    # Register Buyer
    client.post("/api/v1/auth/register", json={
        "email": "step3_buyer@test.com",
        "full_name": "Step3 Buyer",
        "password": "Password123!",
        "role": "buyer"
    })
    # Register Seller
    client.post("/api/v1/auth/register", json={
        "email": "step3_seller@test.com",
        "full_name": "Step3 Seller",
        "password": "Password123!",
        "role": "seller"
    })

    # Login Seller
    s_login = client.post("/api/v1/auth/login", json={"email": "step3_seller@test.com", "password": "Password123!"})
    seller_token = s_login.json()["access_token"]
    seller_headers = {"Authorization": f"Bearer {seller_token}"}
    seller_id = s_login.json()["user"]["id"]
    print(f"[OK] Seller logged in: ID {seller_id}")

    # Login Buyer
    b_login = client.post("/api/v1/auth/login", json={"email": "step3_buyer@test.com", "password": "Password123!"})
    buyer_token = b_login.json()["access_token"]
    buyer_headers = {"Authorization": f"Bearer {buyer_token}"}
    buyer_id = b_login.json()["user"]["id"]
    print(f"[OK] Buyer logged in: ID {buyer_id}")

    # 5. Product APIs
    # Create product
    prod_resp = client.post("/api/v1/products", json={
        "product_name": "Apple iPhone 15 Pro",
        "description": "256GB Natural Titanium",
        "sku": f"IPHONE-15P-256-{buyer_id}",
        "category": "Smartphones",
        "brand": "Apple",
        "price": 1099.00
    }, headers=seller_headers)
    assert prod_resp.status_code == 201, f"Product create failed: {prod_resp.text}"
    product_id = prod_resp.json()["id"]
    print(f"[OK] Product created: ID {product_id}, Name: {prod_resp.json()['product_name']}, Price: {prod_resp.json()['price']}")

    # List products
    list_resp = client.get("/api/v1/products?category=Smartphones", headers=buyer_headers)
    assert list_resp.status_code == 200
    assert len(list_resp.json()) >= 1
    print(f"[OK] Product list returned {len(list_resp.json())} item(s) for category 'Smartphones'")

    # Get single product
    get_p = client.get(f"/api/v1/products/{product_id}", headers=buyer_headers)
    assert get_p.status_code == 200
    print(f"[OK] Retrieved product details for ID {product_id}")

    # Update product
    put_p = client.post if False else client.put
    put_resp = put_p(f"/api/v1/products/{product_id}", json={
        "price": 1049.00
    }, headers=seller_headers)
    assert put_resp.status_code == 200
    assert put_resp.json()["price"] == 1049.00
    print(f"[OK] Product updated: new price {put_resp.json()['price']}")

    # 6. Order APIs
    # Create order
    order_resp = client.post("/api/v1/orders", json={
        "product_id": product_id,
        "quantity": 2,
        "tracking_number": "TRK-STEP3-12345"
    }, headers=buyer_headers)
    assert order_resp.status_code == 201, f"Order create failed: {order_resp.text}"
    order_id = order_resp.json()["id"]
    order_data = order_resp.json()
    print(f"[OK] Order created: ID {order_id}, Qty: {order_data['quantity']}, Total: {order_data['total_amount']}, Status: {order_data['status']}")
    assert order_data["total_amount"] == 2098.00  # 1049.00 * 2

    # Patch order status
    patch_resp = client.patch(f"/api/v1/orders/{order_id}/status", json={
        "status": "confirmed"
    }, headers=seller_headers)
    assert patch_resp.status_code == 200
    assert patch_resp.json()["status"] == "confirmed"
    print(f"[OK] Order status patched to: {patch_resp.json()['status']}")

    print("=" * 60)
    print("ALL STEP 3 VERIFICATIONS COMPLETED SUCCESSFULLY!")
    print("=" * 60)

if __name__ == "__main__":
    run_verification()
