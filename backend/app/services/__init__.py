"""
Services package containing business logic.
"""
from backend.app.services.auth_service import authenticate_user, get_user_by_email, get_user_by_id, register_user
from backend.app.services.order_service import (
    create_order,
    get_order_for_user,
    list_orders,
    update_order_for_user,
    update_order_status_for_user,
)
from backend.app.services.product_service import (
    create_product,
    delete_product,
    get_product_by_id,
    list_products,
    update_product,
)

__all__ = [
    "get_user_by_email",
    "get_user_by_id",
    "register_user",
    "authenticate_user",
    "create_order",
    "list_orders",
    "get_order_for_user",
    "update_order_for_user",
    "update_order_status_for_user",
    "create_product",
    "list_products",
    "get_product_by_id",
    "update_product",
    "delete_product",
]
