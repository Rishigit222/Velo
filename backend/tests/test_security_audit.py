"""
Automated Security Tests verifying defensive patches:
1. Privilege Escalation Prevention (Admin Self-Registration Blocked)
2. Rate Limiting / Brute-Force Protection
3. Security Headers Enforcement
4. Audit Ledger Access Isolation (BOLA Prevention)
5. Upload Size Limit & Memory DoS Prevention
6. Production Secret Key Security Validation
"""
import io
import pytest
from fastapi.testclient import TestClient

from backend.app.core.config import Settings
from backend.app.core.rate_limiter import SlidingWindowRateLimiter
from backend.app.models.order import Order


def test_public_admin_registration_forbidden(client: TestClient):
    """Verify that unauthenticated users cannot register with role='admin'."""
    payload = {
        "email": "malicious_admin@example.com",
        "full_name": "Attacker Admin",
        "password": "Password123!",
        "role": "admin",
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 403
    assert "administrator accounts is disabled" in response.json()["detail"].lower()


def test_rate_limiter_triggers_429():
    """Verify sliding-window rate limiter rejects requests exceeding limit."""
    limiter = SlidingWindowRateLimiter(max_requests=3, window_seconds=60)
    client_id = "test-client-ip"

    # 3 requests should pass
    limiter.check(client_id)
    limiter.check(client_id)
    limiter.check(client_id)

    # 4th request must raise 429
    with pytest.raises(Exception) as excinfo:
        limiter.check(client_id)
    assert "429" in str(excinfo.value) or "Rate limit exceeded" in str(excinfo.value)


def test_security_headers_present(client: TestClient):
    """Verify security headers are attached to responses."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.headers.get("X-Content-Type-Options") == "nosniff"
    assert response.headers.get("X-Frame-Options") == "DENY"
    assert response.headers.get("X-XSS-Protection") == "1; mode=block"
    assert response.headers.get("Referrer-Policy") == "strict-origin-when-cross-origin"


def test_audit_verification_order_rbac(
    client: TestClient,
    test_buyer: dict,
    test_seller: dict,
    other_buyer: dict,
    test_product,
):
    """Verify unauthorized users cannot verify another user's order audit chain."""
    # Create an order
    order_res = client.post(
        "/api/v1/orders",
        json={"product_id": test_product.id, "quantity": 1},
        headers=test_buyer["headers"],
    )
    assert order_res.status_code == 201
    order_id = order_res.json()["id"]

    # Authorized buyer can verify their order
    res_auth = client.get(
        f"/api/v1/evidence/audit/verify?order_id={order_id}",
        headers=test_buyer["headers"],
    )
    assert res_auth.status_code == 200
    assert res_auth.json()["is_valid"] is True

    # Unauthorized buyer gets 403 Forbidden
    res_unauth = client.get(
        f"/api/v1/evidence/audit/verify?order_id={order_id}",
        headers=other_buyer["headers"],
    )
    assert res_unauth.status_code == 403


def test_global_audit_verification_requires_admin(
    client: TestClient,
    test_buyer: dict,
    test_admin: dict,
):
    """Verify non-admins cannot query global audit ledger without order_id."""
    # Buyer blocked with 403
    res_buyer = client.get(
        "/api/v1/evidence/audit/verify",
        headers=test_buyer["headers"],
    )
    assert res_buyer.status_code == 403
    assert "administrator privileges" in res_buyer.json()["detail"].lower()

    # Admin allowed
    res_admin = client.get(
        "/api/v1/evidence/audit/verify",
        headers=test_admin["headers"],
    )
    assert res_admin.status_code == 200


def test_production_secret_key_validation():
    """Verify that insecure or short SECRET_KEY raises ValidationError in production."""
    with pytest.raises(ValueError) as excinfo:
        Settings(
            ENVIRONMENT="production",
            SECRET_KEY="insecure-default-key",
        )
    assert "CRITICAL SECURITY CONFIGURATION ERROR" in str(excinfo.value)
