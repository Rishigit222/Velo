"""
Pydantic schemas for Order management and status updates.
"""
from datetime import datetime
from enum import Enum
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field

from backend.app.schemas.product import ProductResponse
from backend.app.schemas.user import UserResponse


class OrderStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    RETURN_REQUESTED = "return_requested"
    RETURNED = "returned"
    CANCELLED = "cancelled"


class OrderCreate(BaseModel):
    order_number: Optional[str] = Field(None, description="Optional custom order number. Auto-generated if omitted.")
    product_id: Optional[int] = Field(None, description="ID of existing product to order")
    seller_id: Optional[int] = Field(None, description="Seller identifier assigned to this order")
    quantity: int = Field(default=1, gt=0, description="Quantity must be a positive integer (> 0)")
    total_amount: Optional[float] = Field(None, ge=0.0, description="Optional total amount. Auto-calculated from product price if omitted.")
    tracking_number: Optional[str] = Field(None, max_length=100, description="Carrier tracking code")
    delivery_date: Optional[datetime] = Field(None, description="Estimated or confirmed delivery date")
    # Inline product creation support (from Prompt 1)
    product_name: Optional[str] = Field(None, min_length=1, max_length=255, description="Product name if creating new product")
    brand: Optional[str] = Field(None, max_length=255)
    serial_number: Optional[str] = Field(None, max_length=255)
    buyer_id: Optional[int] = Field(None, description="Only admins can specify a different buyer ID")


class OrderUpdate(BaseModel):
    status: Optional[OrderStatus] = None
    seller_id: Optional[int] = None
    product_id: Optional[int] = None
    quantity: Optional[int] = Field(None, gt=0)
    total_amount: Optional[float] = Field(None, ge=0.0)
    tracking_number: Optional[str] = Field(None, max_length=100)
    delivery_date: Optional[datetime] = None


class OrderStatusUpdate(BaseModel):
    status: OrderStatus = Field(..., description="Target status transition for the order")


class OrderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    order_number: str
    buyer_id: int
    seller_id: Optional[int] = None
    product_id: Optional[int] = None
    quantity: int = 1
    total_amount: float = 0.0
    tracking_number: Optional[str] = None
    delivery_date: Optional[datetime] = None
    order_date: datetime
    status: OrderStatus
    created_at: datetime
    updated_at: Optional[datetime] = None
    buyer: Optional[UserResponse] = None
    seller: Optional[UserResponse] = None
    product: Optional[ProductResponse] = None
