"""
API version 1 consolidated router.
"""
from fastapi import APIRouter

from backend.app.routes import auth, disputes, evidence, health, orders, products, reports

api_v1_router = APIRouter()

api_v1_router.include_router(auth.router)
api_v1_router.include_router(products.router)
api_v1_router.include_router(orders.router)
api_v1_router.include_router(evidence.router)
api_v1_router.include_router(disputes.router)
api_v1_router.include_router(reports.router)
api_v1_router.include_router(health.router)
