"""
Tests for AI-Assisted Multimodal Verification Engine.
Verifies status check, condition comparison, image difference computation, RBAC, and audit recording.
"""
import io
from fastapi.testclient import TestClient
from PIL import Image, ImageDraw


def _create_image(text: str, color: str = "blue") -> io.BytesIO:
    img = Image.new("RGB", (200, 200), color=color)
    draw = ImageDraw.Draw(img)
    draw.text((10, 80), text, fill="white")
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    buf.seek(0)
    return buf


def test_verification_status_endpoint(client: TestClient):
    """Test engine status endpoint returns operational availability."""
    res = client.get("/api/v1/verification/status")
    assert res.status_code == 200
    data = res.json()
    assert data["isAvailable"] is True
    assert "operational" in data["message"].lower()


def test_run_verification_lifecycle(
    client: TestClient,
    test_buyer: dict,
    test_seller: dict,
    other_buyer: dict,
):
    """Test full verification execution between delivery and return sessions."""
    # 0. Seller creates a product
    prod_res = client.post(
        "/api/v1/products",
        json={
            "product_name": "Verified Headphones",
            "price": 299.99,
            "sku": "SKU-VERIFY-001",
            "brand": "Sony",
        },
        headers=test_seller["headers"],
    )
    assert prod_res.status_code == 201
    prod_id = prod_res.json()["id"]

    # 1. Buyer creates order for seller's product
    order_res = client.post(
        "/api/v1/orders",
        json={"product_id": prod_id, "quantity": 1},
        headers=test_buyer["headers"],
    )
    assert order_res.status_code == 201
    order_id = order_res.json()["id"]

    # 2. Seller creates delivery session and uploads dispatch image
    deliv_sess = client.post(
        "/api/v1/evidence/sessions",
        json={"order_id": order_id, "session_type": "delivery"},
        headers=test_seller["headers"],
    ).json()
    deliv_id = deliv_sess["id"]

    img1 = _create_image("FACTORY DISPATCH SEALED", color="navy")
    client.post(
        f"/api/v1/evidence/sessions/{deliv_id}/files",
        files=[("files", ("dispatch.jpg", img1, "image/jpeg"))],
        headers=test_seller["headers"],
    )
    client.patch(
        f"/api/v1/evidence/sessions/{deliv_id}/status",
        json={"session_status": "completed"},
        headers=test_seller["headers"],
    )

    # 3. Buyer creates return session, uploads damaged image, and submits condition report
    ret_sess = client.post(
        "/api/v1/evidence/sessions",
        json={"order_id": order_id, "session_type": "return"},
        headers=test_buyer["headers"],
    ).json()
    ret_id = ret_sess["id"]

    img2 = _create_image("RETURN CRACKED DISPLAY", color="crimson")
    client.post(
        f"/api/v1/evidence/sessions/{ret_id}/files",
        files=[("files", ("return_defect.jpg", img2, "image/jpeg"))],
        headers=test_buyer["headers"],
    )
    client.post(
        f"/api/v1/evidence/sessions/{ret_id}/condition",
        json={
            "product_condition": "Damaged",
            "damage_description": "Crack on bottom display and casing dent.",
            "packaging_condition": "Torn seal",
            "accessories_status": "All Included",
        },
        headers=test_buyer["headers"],
    )
    client.patch(
        f"/api/v1/evidence/sessions/{ret_id}/status",
        json={"session_status": "completed"},
        headers=test_buyer["headers"],
    )

    # 4. Seller runs verification
    ver_res = client.post(
        "/api/v1/verification/run",
        json={
            "order_id": order_id,
            "original_session_id": deliv_id,
            "return_session_id": ret_id,
        },
        headers=test_seller["headers"],
    )
    assert ver_res.status_code == 201
    ver_data = ver_res.json()
    assert ver_data["order_id"] == order_id
    assert ver_data["damage_result"] == "detected"
    assert ver_data["overall_status"] == "flagged"
    assert ver_data["confidence_score"] > 0.0
    assert "divergence" in ver_data["findings"].lower() or "damaged" in ver_data["findings"].lower()

    # 5. Query verification history
    hist_res = client.get(
        f"/api/v1/verification/history?order_id={order_id}",
        headers=test_buyer["headers"],
    )
    assert hist_res.status_code == 200
    assert len(hist_res.json()) >= 1
    assert hist_res.json()[0]["id"] == ver_data["id"]

    # 6. Verify RBAC: Unauthorized buyer cannot query this order's verification history
    blocked_res = client.get(
        f"/api/v1/verification/history?order_id={order_id}",
        headers=other_buyer["headers"],
    )
    assert blocked_res.status_code == 403

    # 7. Unauthorized user cannot run verification on this order
    blocked_run = client.post(
        "/api/v1/verification/run",
        json={"order_id": order_id},
        headers=other_buyer["headers"],
    )
    assert blocked_run.status_code == 403


def test_verification_nonexistent_order_404(client: TestClient, test_buyer: dict):
    """Test running verification on nonexistent order returns 404."""
    res = client.post(
        "/api/v1/verification/run",
        json={"order_id": 999999},
        headers=test_buyer["headers"],
    )
    assert res.status_code == 404
