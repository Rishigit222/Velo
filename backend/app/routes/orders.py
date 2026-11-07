"""
Order management endpoints for buyers, sellers, and administrators.
"""
from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from backend.app.database.connection import get_db
from backend.app.models.order import Order
from backend.app.models.user import User
from backend.app.routes.deps import get_current_user
from backend.app.schemas.dispute import DisputeResponse
from backend.app.schemas.order import OrderCreate, OrderResponse, OrderStatusUpdate, OrderUpdate
from backend.app.services.dispute_service import list_disputes
from backend.app.services.order_service import (
    create_order,
    get_order_for_user,
    list_orders,
    update_order_for_user,
    update_order_status_for_user,
)

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.post(
    "",
    response_model=OrderResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new order",
    description="Creates a new order record. Buyers create orders for themselves; admins can specify buyer_id.",
)
def create_new_order(
    order_in: OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Order:
    """Create a new order with role-aware logic."""
    return create_order(db=db, order_in=order_in, current_user=current_user)


@router.get(
    "",
    response_model=List[OrderResponse],
    summary="List orders",
    description="List orders. Buyers see their own purchases; sellers see orders assigned to them; admins see all orders.",
)
def get_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> List[Order]:
    """Retrieve orders accessible to the current user."""
    return list_orders(db=db, current_user=current_user)


@router.get(
    "/{order_id}",
    response_model=OrderResponse,
    summary="Get order details",
    description="Retrieve details of a single order. Enforces ownership and RBAC restrictions.",
)
def get_order_details(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Order:
    """Retrieve a specific order by ID with ownership check."""
    return get_order_for_user(db=db, order_id=order_id, current_user=current_user)


@router.put(
    "/{order_id}",
    response_model=OrderResponse,
    summary="Update order",
    description="Update an order's status or assignments based on user role authorization.",
)
def update_order(
    order_id: int,
    order_update: OrderUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Order:
    """Update order details or status with role-specific permissions."""
    return update_order_for_user(
        db=db,
        order_id=order_id,
        order_update=order_update,
        current_user=current_user,
    )


@router.patch(
    "/{order_id}/status",
    response_model=OrderResponse,
    summary="Update order status",
    description="Dedicated endpoint to update the lifecycle status of an order. Role restrictions apply.",
)
def update_order_status(
    order_id: int,
    status_update: OrderStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Order:
    """Update order status with RBAC transition validation."""
    return update_order_status_for_user(
        db=db,
        order_id=order_id,
        new_status=status_update.status,
        current_user=current_user,
    )


@router.get(
    "/{order_id}/disputes",
    response_model=List[DisputeResponse],
    summary="List disputes for an order",
    description="List all disputes filed against a specific order. Enforces order party access control.",
)
def get_order_disputes(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> List[DisputeResponse]:
    """Get all disputes for the specified order."""
    get_order_for_user(db=db, order_id=order_id, current_user=current_user)
    return list_disputes(db=db, current_user=current_user, order_id=order_id)

