"""
Pydantic schemas for health checks and system status.
"""
from datetime import datetime
from pydantic import BaseModel


class HealthResponse(BaseModel):
    status: str
    version: str
    database: str
    environment: str
    timestamp: datetime


class RootResponse(BaseModel):
    name: str
    version: str
    status: str
    docs_url: str

