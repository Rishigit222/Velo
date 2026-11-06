"""
Product catalog API endpoints for buyers, sellers, and administrators.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy.orm import Session

from backend.app.database.connection import get_db
from backend.app.models.product import Product
from backend.app.models.user import User
from backend.app.routes.deps import get_current_user
from backend.app.schemas.product import ProductCreate, ProductResponse, ProductUpdate
from backend.app.services.product_service import (
    create_product,
    delete_product,
    get_product_by_id,
    list_products,
    update_product,
)

router = APIRouter(prefix="/products", tags=["Products"])


@router.post(
    "",
    response_model=ProductResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a product",
    description="Create a new catalog product. Allowed for sellers and administrators.",
)
def create_new_product(
    product_in: ProductCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Product:
    """Create a new product with seller attribution."""
    return create_product(db=db, product_in=product_in, current_user=current_user)


@router.get(
    "",
    response_model=List[ProductResponse],
    summary="List products",
    description="List all catalog products. Supports filtering by category, brand, or seller ID.",
)
def get_all_products(
    category: Optional[str] = Query(None, description="Filter by product category"),
    brand: Optional[str] = Query(None, description="Filter by brand"),
    seller_id: Optional[int] = Query(None, description="Filter by seller identifier"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> List[Product]:
    """List available catalog products."""
    return list_products(db=db, category=category, brand=brand, seller_id=seller_id)


@router.get(
    "/{product_id}",
    response_model=ProductResponse,
    summary="Get product details",
    description="Retrieve details for a single catalog product.",
)
def get_single_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Product:
    """Retrieve details for a product by ID."""
    return get_product_by_id(db=db, product_id=product_id)


@router.put(
    "/{product_id}",
    response_model=ProductResponse,
    summary="Update product",
    description="Update an existing product. Only the owning seller or an administrator can modify it.",
)
def update_single_product(
    product_id: int,
    product_update: ProductUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Product:
    """Update product details with ownership verification."""
    return update_product(
        db=db,
        product_id=product_id,
        product_update=product_update,
        current_user=current_user,
    )


@router.delete(
    "/{product_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete product",
    description="Delete a product from the catalog. Allowed only if the product has no associated customer orders.",
)
def delete_single_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Response:
    """Delete a product when safe and permitted."""
    delete_product(db=db, product_id=product_id, current_user=current_user)
    return Response(status_code=status.HTTP_204_NO_CONTENT)

