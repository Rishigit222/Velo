"""
SQLAlchemy engine, session factory, connection dependency, and migration-ready Azure SQL compatibility.
"""
from typing import Generator
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session, sessionmaker

from backend.app.core.config import settings
from backend.app.database.base import Base
from backend.app.utils.logger import get_logger

logger = get_logger(__name__)

# Engine configuration: adapts based on database backend (SQLite vs Azure SQL / MSSQL / PostgreSQL)
connect_args = {}
engine_kwargs = {
    "pool_pre_ping": True,  # Critical for Azure SQL to test and reconnect dead/idle connections
}

if settings.DATABASE_URL.startswith("sqlite"):
    connect_args["check_same_thread"] = False
else:
    # Recommended production connection pool settings for Azure SQL Database
    engine_kwargs.update({
        "pool_size": 10,
        "max_overflow": 20,
        "pool_recycle": 1800,
        "pool_timeout": 30,
    })

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    **engine_kwargs,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    """
    Reusable FastAPI database session dependency.
    Yields a session and guarantees it is closed after the request is finished.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    """
    Initialize all database tables.
    Imports all models to register them on Base.metadata before creation.
    """
    logger.info("Initializing database schema...")
    # Ensure all models are loaded
    import backend.app.models  # noqa: F401

    Base.metadata.create_all(bind=engine)
    logger.info("Database schema initialized successfully.")


def check_db_connection() -> bool:
    """
    Execute a lightweight ping query ('SELECT 1') to verify database connectivity.
    Used for health check endpoints.
    """
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return True
    except Exception as exc:
        logger.error(f"Database connectivity check failed: {exc}")
        return False

