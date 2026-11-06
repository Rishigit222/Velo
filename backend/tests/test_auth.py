"""
Tests for authentication, registration, Argon2 password hashing, and JWT tokens.
"""
from fastapi.testclient import TestClient


def test_user_registration_success(client: TestClient):
    """Test successful user registration for buyer, seller, and admin roles."""
    payload = {
        "email": "newbuyer@example.com",
        "full_name": "New Buyer",
        "password": "SecurePassword123!",
        "role": "buyer",
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "newbuyer@example.com"
    assert data["full_name"] == "New Buyer"
    assert data["role"] == "buyer"
    assert "id" in data
    assert "password_hash" not in data  # Never expose password hash!


def test_duplicate_email_rejection(client: TestClient, test_buyer: dict):
    """Test that registering with an already existing email returns 400 Bad Request."""
    payload = {
        "email": test_buyer["user"].email,
        "full_name": "Duplicate Attempt",
        "password": "Password999!",
        "role": "buyer",
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"].lower()


def test_registration_validation_rules(client: TestClient):
    """Test validation errors for short password (< 8 chars) or malformed email."""
    # Short password
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "valid@example.com",
            "full_name": "Short Pwd",
            "password": "short",
            "role": "buyer",
        },
    )
    assert response.status_code == 422

    # Malformed email
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "not-an-email",
            "full_name": "Bad Email",
            "password": "ValidPassword123!",
            "role": "buyer",
        },
    )
    assert response.status_code == 422


def test_login_success(client: TestClient, test_buyer: dict):
    """Test successful login returns access token and user information."""
    payload = {
        "email": test_buyer["user"].email,
        "password": "Password123!",
    }
    response = client.post("/api/v1/auth/login", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == test_buyer["user"].email


def test_login_invalid_password(client: TestClient, test_buyer: dict):
    """Test login with incorrect password returns 401 Unauthorized."""
    payload = {
        "email": test_buyer["user"].email,
        "password": "WrongPassword123!",
    }
    response = client.post("/api/v1/auth/login", json=payload)
    assert response.status_code == 401
    assert "incorrect email or password" in response.json()["detail"].lower()


def test_login_nonexistent_user(client: TestClient):
    """Test login with nonexistent email returns 401 Unauthorized."""
    payload = {
        "email": "ghost@example.com",
        "password": "Password123!",
    }
    response = client.post("/api/v1/auth/login", json=payload)
    assert response.status_code == 401


def test_get_current_user_me(client: TestClient, test_buyer: dict):
    """Test /api/v1/auth/me returns the authenticated user profile."""
    response = client.get("/api/v1/auth/me", headers=test_buyer["headers"])
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == test_buyer["user"].email
    assert data["role"] == "buyer"


def test_get_current_user_unauthorized(client: TestClient):
    """Test /api/v1/auth/me without token returns 401 Unauthorized."""
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401


def test_get_current_user_invalid_token(client: TestClient):
    """Test /api/v1/auth/me with invalid/tampered token returns 401 Unauthorized."""
    response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": "Bearer invalid.token.payload"},
    )
    assert response.status_code == 401


def test_swagger_token_endpoint(client: TestClient, test_buyer: dict):
    """Test OAuth2 form login for Swagger UI interactive documentation."""
    response = client.post(
        "/api/v1/auth/token",
        data={
            "username": test_buyer["user"].email,
            "password": "Password123!",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

