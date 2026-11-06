"""
Tests for health check endpoints.
"""
from fastapi.testclient import TestClient


def test_root_endpoint(client: TestClient):
    """Test the root '/' endpoint returns 200 and API metadata."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "ReturnProof API"
    assert data["status"] == "online"
    assert data["docs_url"] == "/docs"


def test_health_endpoint(client: TestClient):
    """Test the global '/health' endpoint returns 200 and healthy status."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ["healthy", "degraded"]
    assert "timestamp" in data
    assert "version" in data


def test_v1_health_endpoint(client: TestClient):
    """Test the '/api/v1/health' endpoint returns 200 and database connectivity status."""
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ["healthy", "degraded"]
    assert data["database"] in ["connected", "disconnected"]
    assert "version" in data

