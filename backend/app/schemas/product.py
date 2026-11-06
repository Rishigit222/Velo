"""
Pydantic schemas for Product catalog and seller inventory.
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class ProductBase(BaseModel):
    product_name: str = Field(..., min_length=1, max_length=255, description="Product title or model name")
    description: Optional[str] = Field(None, max_length=5000, description="Product description")
    sku: Optional[str] = Field(None, max_length=100, description="Stock Keeping Unit identifier")
    category: Optional[str] = Field(None, max_length=100, description="Product category")
    brand: Optional[str] = Field(None, max_length=255, description="Manufacturer or brand")
    price: float = Field(default=0.0, ge=0.0, description="Unit price (must be non-negative)")
    serial_number: Optional[str] = Field(None, max_length=255, description="Hardware serial number or IMEI")


class ProductCreate(ProductBase):
    seller_id: Optional[int] = Field(None, description="Optional seller ID; admins may assign, sellers default to themselves")


class ProductUpdate(BaseModel):
    product_name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=5000)
    sku: Optional[str] = Field(None, max_length=100)
    category: Optional[str] = Field(None, max_length=100)
    brand: Optional[str] = Field(None, max_length=255)
    price: Optional[float] = Field(None, ge=0.0, description="Unit price (must be non-negative)")
    serial_number: Optional[str] = Field(None, max_length=255)
    seller_id: Optional[int] = None


class ProductResponse(ProductBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    seller_id: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
