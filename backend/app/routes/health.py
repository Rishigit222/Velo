"""
Health check and diagnostics API routes.
"""
from datetime import datetime, timezone
from fastapi import APIRouter
from backend.app.core.config import settings
from backend.app.database.connection import check_db_connection
from backend.app.schemas.health import HealthResponse

router = APIRouter(prefix="/health", tags=["Health"])


@router.get(
    "",
    response_model=HealthResponse,
    summary="API v1 Health Check",
    description="Returns API service and database connectivity health status.",
)
def get_v1_health() -> HealthResponse:
    """Check API and database status."""
    db_connected = check_db_connection()
    return HealthResponse(
        status="healthy" if db_connected else "degraded",
        version=settings.VERSION,
        database="connected" if db_connected else "disconnected",
        environment=settings.ENVIRONMENT,
        timestamp=datetime.now(timezone.utc),
    )

