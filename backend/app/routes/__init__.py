"""
Routes package.
"""
from backend.app.routes.api_v1 import api_v1_router
from backend.app.routes.auth import router as auth_router
from backend.app.routes.health import router as health_router
from backend.app.routes.orders import router as orders_router
from backend.app.routes.products import router as products_router

__all__ = ["api_v1_router", "auth_router", "products_router", "orders_router", "health_router"]
