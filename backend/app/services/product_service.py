"""
Product management business logic, catalog services, and inventory RBAC.
"""
from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.app.models.order import Order
from backend.app.models.product import Product
from backend.app.models.user import User
from backend.app.schemas.product import ProductCreate, ProductUpdate
from backend.app.schemas.user import UserRole


def create_product(db: Session, product_in: ProductCreate, current_user: User) -> Product:
    """
    Create a new catalog product.
    - Sellers can create products for their own store.
    - Admins can create products and assign them to any seller.
    - Buyers are forbidden from creating products (403 Forbidden).
    """
    if current_user.role not in [UserRole.SELLER.value, UserRole.ADMIN.value]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only registered sellers and administrators can create products.",
        )

    # Determine seller assignment
    if current_user.role == UserRole.ADMIN.value and product_in.seller_id:
        target_seller = db.execute(
            select(User).where(User.id == product_in.seller_id)
        ).scalar_one_or_none()
        if not target_seller:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Target seller with ID {product_in.seller_id} not found.",
            )
        seller_id = target_seller.id
    else:
        seller_id = current_user.id

    # Check for duplicate SKU
    if product_in.sku:
        existing_sku = db.execute(
            select(Product).where(Product.sku == product_in.sku.strip())
        ).scalar_one_or_none()
        if existing_sku:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"A product with SKU '{product_in.sku.strip()}' already exists.",
            )

    new_product = Product(
        product_name=product_in.product_name.strip(),
        description=product_in.description.strip() if product_in.description else None,
        sku=product_in.sku.strip() if product_in.sku else None,
        category=product_in.category.strip() if product_in.category else None,
        brand=product_in.brand.strip() if product_in.brand else None,
        price=product_in.price,
        serial_number=product_in.serial_number.strip() if product_in.serial_number else None,
        seller_id=seller_id,
    )

    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return new_product


def list_products(
    db: Session,
    category: Optional[str] = None,
    brand: Optional[str] = None,
    seller_id: Optional[int] = None,
) -> List[Product]:
    """
    List catalog products with optional category, brand, or seller filters.
    Available to all authenticated buyers, sellers, and administrators.
    """
    stmt = select(Product)

    if category:
        stmt = stmt.where(Product.category == category)
    if brand:
        stmt = stmt.where(Product.brand == brand)
    if seller_id is not None:
        stmt = stmt.where(Product.seller_id == seller_id)

    stmt = stmt.order_by(Product.created_at.desc())
    return list(db.execute(stmt).scalars().all())


def get_product_by_id(db: Session, product_id: int) -> Product:
    """Retrieve details for a single product by ID."""
    stmt = select(Product).where(Product.id == product_id)
    product = db.execute(stmt).scalar_one_or_none()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID {product_id} not found.",
        )
    return product


def update_product(
    db: Session,
    product_id: int,
    product_update: ProductUpdate,
    current_user: User,
) -> Product:
    """
    Update a product record.
    - Admins can update any product.
    - Sellers can only update their own products.
    - Buyers cannot update products (403 Forbidden).
    """
    product = get_product_by_id(db, product_id)

    # Authorization
    if current_user.role == UserRole.ADMIN.value:
        pass
    elif current_user.role == UserRole.SELLER.value:
        if product.seller_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to modify another seller's product.",
            )
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Buyers do not have permission to modify products.",
        )

    # Check SKU uniqueness if changed
    if product_update.sku and product_update.sku.strip() != product.sku:
        existing_sku = db.execute(
            select(Product).where(
                Product.sku == product_update.sku.strip(),
                Product.id != product_id,
            )
        ).scalar_one_or_none()
        if existing_sku:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"A product with SKU '{product_update.sku.strip()}' already exists.",
            )

    # Apply updates
    if product_update.product_name is not None:
        product.product_name = product_update.product_name.strip()
    if product_update.description is not None:
        product.description = product_update.description.strip()
    if product_update.sku is not None:
        product.sku = product_update.sku.strip()
    if product_update.category is not None:
        product.category = product_update.category.strip()
    if product_update.brand is not None:
        product.brand = product_update.brand.strip()
    if product_update.price is not None:
        product.price = product_update.price
    if product_update.serial_number is not None:
        product.serial_number = product_update.serial_number.strip()
    if product_update.seller_id is not None and current_user.role == UserRole.ADMIN.value:
        product.seller_id = product_update.seller_id

    db.commit()
    db.refresh(product)
    return product


def delete_product(db: Session, product_id: int, current_user: User) -> None:
    """
    Delete a product from the catalog.
    - Admins can delete any product without active orders.
    - Sellers can only delete their own products.
    - If the product is linked to existing customer orders, deletion is prevented (400 Bad Request).
    """
    product = get_product_by_id(db, product_id)

    # Authorization
    if current_user.role == UserRole.ADMIN.value:
        pass
    elif current_user.role == UserRole.SELLER.value:
        if product.seller_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to delete another seller's product.",
            )
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Buyers do not have permission to delete products.",
        )

    # Check for order reference constraint
    order_count = db.execute(
        select(Order).where(Order.product_id == product_id)
    ).scalars().all()
    if order_count:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete product '{product.product_name}' because it has {len(order_count)} associated orders.",
        )

    db.delete(product)
    db.commit()
