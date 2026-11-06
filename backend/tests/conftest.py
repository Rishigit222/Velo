"""
Test configuration, fixtures, and separate test database isolation.
"""
import sys
from pathlib import Path

# Add project root and backend directory to sys.path
root_dir = str(Path(__file__).resolve().parent.parent.parent)
backend_dir = str(Path(__file__).resolve().parent.parent)
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from typing import Dict, Generator
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from backend.app.core.security import create_access_token, get_password_hash
from backend.app.database.base import Base
from backend.app.database.connection import get_db
from backend.app.main import app
from backend.app.models.order import Order
from backend.app.models.product import Product
from backend.app.models.user import User

# Dedicated isolated in-memory test database using StaticPool
TEST_DATABASE_URL = "sqlite:///:memory:"

test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    """Create all database tables once for the test session."""
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)


@pytest.fixture
def db_session() -> Generator[Session, None, None]:
    """Provide a transactional database session per test with automatic rollback."""
    connection = test_engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)

    yield session

    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture
def client(db_session: Session) -> Generator[TestClient, None, None]:
    """TestClient that uses the isolated test database session."""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def test_buyer(db_session: Session) -> Dict:
    """Fixture providing an authenticated buyer user."""
    user = User(
        full_name="Alice Buyer",
        email="buyer_alice@example.com",
        password_hash=get_password_hash("Password123!"),
        role="buyer",
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    token = create_access_token(
        subject=user.id,
        extra_data={"email": user.email, "role": user.role},
    )
    return {
        "user": user,
        "token": token,
        "headers": {"Authorization": f"Bearer {token}"},
    }


@pytest.fixture
def other_buyer(db_session: Session) -> Dict:
    """Fixture providing a second buyer for cross-user permission checks."""
    user = User(
        full_name="Bob OtherBuyer",
        email="buyer_bob@example.com",
        password_hash=get_password_hash("Password123!"),
        role="buyer",
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    token = create_access_token(
        subject=user.id,
        extra_data={"email": user.email, "role": user.role},
    )
    return {
        "user": user,
        "token": token,
        "headers": {"Authorization": f"Bearer {token}"},
    }


@pytest.fixture
def test_seller(db_session: Session) -> Dict:
    """Fixture providing an authenticated seller user."""
    user = User(
        full_name="Sam Seller",
        email="seller_sam@example.com",
        password_hash=get_password_hash("Password123!"),
        role="seller",
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    token = create_access_token(
        subject=user.id,
        extra_data={"email": user.email, "role": user.role},
    )
    return {
        "user": user,
        "token": token,
        "headers": {"Authorization": f"Bearer {token}"},
    }


@pytest.fixture
def other_seller(db_session: Session) -> Dict:
    """Fixture providing a second seller for cross-seller permission checks."""
    user = User(
        full_name="Steve OtherSeller",
        email="seller_steve@example.com",
        password_hash=get_password_hash("Password123!"),
        role="seller",
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    token = create_access_token(
        subject=user.id,
        extra_data={"email": user.email, "role": user.role},
    )
    return {
        "user": user,
        "token": token,
        "headers": {"Authorization": f"Bearer {token}"},
    }


@pytest.fixture
def test_admin(db_session: Session) -> Dict:
    """Fixture providing an authenticated admin user."""
    user = User(
        full_name="Adam Admin",
        email="admin_adam@example.com",
        password_hash=get_password_hash("Password123!"),
        role="admin",
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    token = create_access_token(
        subject=user.id,
        extra_data={"email": user.email, "role": user.role},
    )
    return {
        "user": user,
        "token": token,
        "headers": {"Authorization": f"Bearer {token}"},
    }


@pytest.fixture
def test_product(db_session: Session) -> Product:
    """Fixture providing a test product."""
    product = Product(
        product_name="Sony WH-1000XM5",
        brand="Sony",
        serial_number="SN-SONY-998877",
    )
    db_session.add(product)
    db_session.commit()
    db_session.refresh(product)
    return product
