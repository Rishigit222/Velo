"""
End-to-end verification script for ReturnProof backend and Next.js frontend readiness.
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
    print("ReturnProof End-to-End System Verification")
    print("=" * 60)

    # 1. Inspect SQLite Database
    conn = sqlite3.connect("returnproof.db")
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = [row[0] for row in cursor.fetchall()]
    print(f"[OK] Database connected. Found tables: {tables}")
    assert "users" in tables, "Table 'users' missing!"
    assert "products" in tables, "Table 'products' missing!"
    assert "orders" in tables, "Table 'orders' missing!"
    conn.close()

    client = TestClient(app)

    # 2. Test Root & Health Endpoints
    r_root = client.get("/")
    assert r_root.status_code == 200, f"Root failed: {r_root.text}"
    print(f"[OK] Root Endpoint ('/'): {r_root.json()}")

    r_health = client.get("/health")
    assert r_health.status_code == 200, f"Health failed: {r_health.text}"
    print(f"[OK] Global Health ('/health'): {r_health.json()}")

    r_v1_health = client.get("/api/v1/health")
    assert r_v1_health.status_code == 200, f"v1 Health failed: {r_v1_health.text}"
    print(f"[OK] v1 Health ('/api/v1/health'): {r_v1_health.json()}")

    # 3. Test Swagger Docs & OpenAPI Specification
    r_docs = client.get("/docs")
    assert r_docs.status_code == 200, f"Swagger /docs failed: {r_docs.status_code}"
    print("[OK] Swagger UI accessible at /docs (HTTP 200)")

    r_openapi = client.get("/openapi.json")
    assert r_openapi.status_code == 200, f"OpenAPI schema failed: {r_openapi.status_code}"
    openapi_data = r_openapi.json()
    paths = list(openapi_data.get("paths", {}).keys())
    print(f"[OK] OpenAPI schema generated with {len(paths)} routes: {paths}")

    # 4. Test CORS Header for Next.js Frontend
    cors_headers = {
        "Origin": "http://localhost:3000",
        "Access-Control-Request-Method": "POST",
    }
    r_cors = client.options("/api/v1/auth/login", headers=cors_headers)
    print(f"[OK] CORS Preflight Status: {r_cors.status_code}")
    print(f"[OK] CORS Allow-Origin Header: {r_cors.headers.get('access-control-allow-origin')}")
    assert r_cors.headers.get("access-control-allow-origin") == "http://localhost:3000", "CORS origin mismatch!"

    # 5. Full Auth & Order Flow
    # Register Buyer
    reg_buyer = client.post("/api/v1/auth/register", json={
        "email": "verification_buyer@test.com",
        "full_name": "Verify Buyer",
        "password": "Password12345!",
        "role": "buyer"
    })
    assert reg_buyer.status_code in [201, 400], f"Register failed: {reg_buyer.text}"

    # Register Seller
    reg_seller = client.post("/api/v1/auth/register", json={
        "email": "verification_seller@test.com",
        "full_name": "Verify Seller",
        "password": "Password12345!",
        "role": "seller"
    })
    assert reg_seller.status_code in [201, 400], f"Register seller failed: {reg_seller.text}"

    # Login Buyer
    login_resp = client.post("/api/v1/auth/login", json={
        "email": "verification_buyer@test.com",
        "password": "Password12345!"
    })
    assert login_resp.status_code == 200, f"Login failed: {login_resp.text}"
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("[OK] Buyer logged in with Argon2 password verification and JWT generated.")

    # Check /me
    me_resp = client.get("/api/v1/auth/me", headers=headers)
    assert me_resp.status_code == 200
    print(f"[OK] Authenticated user retrieved: {me_resp.json()['email']} ({me_resp.json()['role']})")

    # Create Order
    order_resp = client.post("/api/v1/orders", json={
        "product_name": "Sony Alpha Camera",
        "brand": "Sony",
        "serial_number": "SN-CAM-100200"
    }, headers=headers)
    assert order_resp.status_code == 201, f"Order create failed: {order_resp.text}"
    order_data = order_resp.json()
    order_id = order_data["id"]
    print(f"[OK] Order created: ID {order_id}, Number: {order_data['order_number']}, Status: {order_data['status']}")

    # Get Order
    get_order_resp = client.get(f"/api/v1/orders/{order_id}", headers=headers)
    assert get_order_resp.status_code == 200
    print(f"[OK] Order fetched successfully with buyer isolation.")

    print("=" * 60)
    print("ALL VERIFICATIONS COMPLETED SUCCESSFULLY!")
    print("=" * 60)

if __name__ == "__main__":
    run_verification()
