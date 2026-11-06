"""
Tests for database connection, models, and integrity.
"""
from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.app.database.connection import check_db_connection
from backend.app.models.order import Order
from backend.app.models.product import Product
from backend.app.models.user import User


def test_database_connection():
    """Verify that the database connectivity ping succeeds."""
    connected = check_db_connection()
    assert connected is True


def test_models_relationships(db_session: Session):
    """Verify that User, Product, and Order models create and relate properly."""
    # Create buyer & seller
    buyer = User(
        full_name="Buyer One",
        email="buyer1@test.com",
        password_hash="testhash",
        role="buyer",
    )
    seller = User(
        full_name="Seller One",
        email="seller1@test.com",
        password_hash="testhash",
        role="seller",
    )
    product = Product(
        product_name="Test Phone",
        brand="BrandX",
        serial_number="SN-TEST-1234",
    )
    db_session.add_all([buyer, seller, product])
    db_session.commit()
    db_session.refresh(buyer)
    db_session.refresh(seller)
    db_session.refresh(product)

    # Create Order
    order = Order(
        order_number="ORD-TEST-0001",
        buyer_id=buyer.id,
        seller_id=seller.id,
        product_id=product.id,
        status="pending",
    )
    db_session.add(order)
    db_session.commit()
    db_session.refresh(order)

    # Validate relationships
    assert order.buyer.email == "buyer1@test.com"
    assert order.seller.email == "seller1@test.com"
    assert order.product.product_name == "Test Phone"
    assert len(buyer.buyer_orders) == 1
    assert len(seller.seller_orders) == 1

