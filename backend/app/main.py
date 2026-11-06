"""
ReturnProof Backend - Main FastAPI Application.
"""
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from typing import AsyncGenerator
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.core.config import settings
from backend.app.database.connection import check_db_connection, init_db
from backend.app.routes.api_v1 import api_v1_router
from backend.app.schemas.health import HealthResponse, RootResponse
from backend.app.utils.logger import get_logger, setup_logging

logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Lifespan context manager for startup and shutdown events."""
    # Startup actions
    setup_logging()
    logger.info(f"Starting {settings.PROJECT_NAME} v{settings.VERSION} [{settings.ENVIRONMENT}]")
    logger.info("Initializing database schema...")
    init_db()
    logger.info("Database schema initialized and ready.")
    logger.info(f"Interactive API Docs available at /docs")
    yield
    # Shutdown actions
    logger.info(f"Shutting down {settings.PROJECT_NAME}...")


def create_application() -> FastAPI:
    """FastAPI application factory."""
    application = FastAPI(
        title=settings.PROJECT_NAME,
        version=settings.VERSION,
        description="Digital chain-of-custody platform for e-commerce delivery, unboxing and returns verification.",
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
        lifespan=lifespan,
    )

    # CORS configuration for Next.js frontend
    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.BACKEND_CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Mount API v1 router
    application.include_router(api_v1_router, prefix=settings.API_V1_STR)

    # Root endpoint
    @application.get(
        "/",
        response_model=RootResponse,
        tags=["General"],
        summary="API Root Information",
    )
    def root() -> RootResponse:
        return RootResponse(
            name=settings.PROJECT_NAME,
            version=settings.VERSION,
            status="online",
            docs_url="/docs",
        )

    # Global health check endpoint
    @application.get(
        "/health",
        response_model=HealthResponse,
        tags=["Health"],
        summary="System Health Check",
    )
    def health_check() -> HealthResponse:
        db_connected = check_db_connection()
        return HealthResponse(
            status="healthy" if db_connected else "degraded",
            version=settings.VERSION,
            database="connected" if db_connected else "disconnected",
            environment=settings.ENVIRONMENT,
            timestamp=datetime.now(timezone.utc),
        )

    return application


app = create_application()

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "backend.app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
    )

