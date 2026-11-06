"""
Order management and chain-of-custody transaction business logic.
"""
from datetime import datetime, timezone
from typing import List, Optional
import uuid
from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from backend.app.models.order import Order
from backend.app.models.product import Product
from backend.app.models.user import User
from backend.app.schemas.order import OrderCreate, OrderStatus, OrderUpdate
from backend.app.schemas.user import UserRole


def generate_order_number() -> str:
    """Generate a unique order tracking number."""
    now_str = datetime.now(timezone.utc).strftime("%Y%m%d")
    short_uuid = uuid.uuid4().hex[:6].upper()
    return f"ORD-{now_str}-{short_uuid}"


def create_order(db: Session, order_in: OrderCreate, current_user: User) -> Order:
    """
    Create a new order.
    Buyers create orders for themselves.
    Admins can specify a different buyer_id.
    Validates seller existence, product existence/creation, and order number uniqueness.
    """
    # Determine buyer_id
    if current_user.role == UserRole.ADMIN.value and order_in.buyer_id:
        buyer = db.execute(select(User).where(User.id == order_in.buyer_id)).scalar_one_or_none()
        if not buyer:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Buyer with ID {order_in.buyer_id} not found.",
            )
        buyer_id = buyer.id
    else:
        buyer_id = current_user.id

    # Validate seller if provided
    if order_in.seller_id:
        seller = db.execute(select(User).where(User.id == order_in.seller_id)).scalar_one_or_none()
        if not seller:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Seller with ID {order_in.seller_id} not found.",
            )
        if seller.role not in [UserRole.SELLER.value, UserRole.ADMIN.value]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"User with ID {order_in.seller_id} is not a registered seller.",
            )

    # Handle Product: either reference existing or create from inline payload
    product_id = order_in.product_id
    if product_id:
        product = db.execute(select(Product).where(Product.id == product_id)).scalar_one_or_none()
        if not product:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Product with ID {product_id} not found.",
            )
    elif order_in.product_name:
        # Check if product with serial_number already exists
        if order_in.serial_number:
            existing_product = db.execute(
                select(Product).where(Product.serial_number == order_in.serial_number)
            ).scalar_one_or_none()
            if existing_product:
                product_id = existing_product.id
            else:
                new_product = Product(
                    product_name=order_in.product_name.strip(),
                    brand=order_in.brand.strip() if order_in.brand else None,
                    serial_number=order_in.serial_number.strip() if order_in.serial_number else None,
                )
                db.add(new_product)
                db.flush()
                product_id = new_product.id
        else:
            new_product = Product(
                product_name=order_in.product_name.strip(),
                brand=order_in.brand.strip() if order_in.brand else None,
                serial_number=None,
            )
            db.add(new_product)
            db.flush()
            product_id = new_product.id

    # Handle order number
    order_number = order_in.order_number or generate_order_number()
    existing_order = db.execute(
        select(Order).where(Order.order_number == order_number)
    ).scalar_one_or_none()
    if existing_order:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Order number '{order_number}' is already in use.",
        )

    db_order = Order(
        order_number=order_number,
        buyer_id=buyer_id,
        seller_id=order_in.seller_id,
        product_id=product_id,
        status=OrderStatus.PENDING.value,
        order_date=datetime.now(timezone.utc),
    )

    db.add(db_order)
    db.commit()
    db.refresh(db_order)

    # Eager load relationships for complete response representation
    return get_order_by_id_internal(db, db_order.id)


def get_order_by_id_internal(db: Session, order_id: int) -> Optional[Order]:
    """Helper to retrieve an order with eager loaded relationships."""
    stmt = (
        select(Order)
        .options(
            joinedload(Order.buyer),
            joinedload(Order.seller),
            joinedload(Order.product),
        )
        .where(Order.id == order_id)
    )
    return db.execute(stmt).scalar_one_or_none()


def list_orders(db: Session, current_user: User) -> List[Order]:
    """
    List orders accessible to the current user based on RBAC rules:
    - Admin: can access all orders.
    - Buyer: can access their own purchases (buyer_id == user.id).
    - Seller: can access orders assigned to them (seller_id == user.id).
    """
    stmt = select(Order).options(
        joinedload(Order.buyer),
        joinedload(Order.seller),
        joinedload(Order.product),
    )

    if current_user.role == UserRole.ADMIN.value:
        # Admins see all records
        pass
    elif current_user.role == UserRole.BUYER.value:
        stmt = stmt.where(Order.buyer_id == current_user.id)
    elif current_user.role == UserRole.SELLER.value:
        stmt = stmt.where(Order.seller_id == current_user.id)
    else:
        # Fallback security check
        stmt = stmt.where(Order.buyer_id == current_user.id)

    stmt = stmt.order_by(Order.created_at.desc())
    return list(db.execute(stmt).scalars().all())


def get_order_for_user(db: Session, order_id: int, current_user: User) -> Order:
    """
    Retrieve a specific order, enforcing ownership and access boundaries.
    """
    order = get_order_by_id_internal(db, order_id)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order with ID {order_id} not found.",
        )

    # RBAC Access Control
    if current_user.role == UserRole.ADMIN.value:
        return order
    elif current_user.role == UserRole.BUYER.value and order.buyer_id == current_user.id:
        return order
    elif current_user.role == UserRole.SELLER.value and order.seller_id == current_user.id:
        return order

    # Access denied
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="You do not have permission to access this order.",
    )


def update_order_for_user(
    db: Session,
    order_id: int,
    order_update: OrderUpdate,
    current_user: User,
) -> Order:
    """
    Update an order with role-specific authorization:
    - Admins: update status, seller_id, product_id freely.
    - Sellers: update status on orders assigned to them.
    - Buyers: can request return or cancel a pending order.
    """
    order = get_order_by_id_internal(db, order_id)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order with ID {order_id} not found.",
        )

    # Role checks
    if current_user.role == UserRole.ADMIN.value:
        if order_update.status is not None:
            order.status = order_update.status.value
        if order_update.seller_id is not None:
            order.seller_id = order_update.seller_id
        if order_update.product_id is not None:
            order.product_id = order_update.product_id

    elif current_user.role == UserRole.SELLER.value:
        if order.seller_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only update orders assigned to you.",
            )
        if order_update.status is not None:
            order.status = order_update.status.value
        if order_update.seller_id is not None or order_update.product_id is not None:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Sellers cannot reassign order participants or products.",
            )

    elif current_user.role == UserRole.BUYER.value:
        if order.buyer_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only update your own orders.",
            )
        if order_update.seller_id is not None or order_update.product_id is not None:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Buyers cannot modify seller or product assignments.",
            )
        if order_update.status is not None:
            allowed_transitions = [
                OrderStatus.CANCELLED.value,
                OrderStatus.RETURN_REQUESTED.value,
            ]
            if order_update.status.value not in allowed_transitions:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Buyers may only update status to 'cancelled' or 'return_requested'.",
                )
            order.status = order_update.status.value

    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Unauthorized to update order.",
        )

    db.commit()
    db.refresh(order)
    return get_order_by_id_internal(db, order.id)

