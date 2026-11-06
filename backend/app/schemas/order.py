"""
Pydantic schemas for Order models.
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
    seller_id: Optional[int] = Field(None, description="Seller identifier assigned to this order")
    product_id: Optional[int] = Field(None, description="ID of existing product")
    # Inline product details if creating a product on the fly
    product_name: Optional[str] = Field(None, min_length=1, max_length=255, description="Product name if creating new product")
    brand: Optional[str] = Field(None, max_length=255)
    serial_number: Optional[str] = Field(None, max_length=255)
    buyer_id: Optional[int] = Field(None, description="Only admins can specify a different buyer ID")


class OrderUpdate(BaseModel):
    status: Optional[OrderStatus] = None
    seller_id: Optional[int] = None
    product_id: Optional[int] = None


class OrderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    order_number: str
    buyer_id: int
    seller_id: Optional[int] = None
    product_id: Optional[int] = None
    order_date: datetime
    status: OrderStatus
    created_at: datetime
    buyer: Optional[UserResponse] = None
    seller: Optional[UserResponse] = None
    product: Optional[ProductResponse] = None

