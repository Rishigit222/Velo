"""
API version 1 consolidated router.
"""
from fastapi import APIRouter

from backend.app.routes import auth, health, orders

api_v1_router = APIRouter()

api_v1_router.include_router(auth.router)
api_v1_router.include_router(orders.router)
api_v1_router.include_router(health.router)

