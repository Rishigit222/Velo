"""
Pydantic schemas for AI-Assisted Verification and Image Comparison.
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class RunVerificationRequest(BaseModel):
    order_id: int = Field(..., description="Target order ID for verification")
    original_session_id: Optional[int] = Field(None, description="Optional outbound delivery session ID")
    return_session_id: Optional[int] = Field(None, description="Optional inbound return session ID")


class VerificationStatusResponse(BaseModel):
    isAvailable: bool = Field(True, description="Whether the verification engine is operational")
    message: str = Field(..., description="Service status message")
    engine_version: str = Field("1.0.0", description="Verification engine version")


class VerificationResultResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    order_id: int
    original_session_id: Optional[int] = None
    return_session_id: Optional[int] = None
    identity_result: str
    damage_result: str
    accessories_result: str
    overall_status: str
    confidence_score: Optional[float] = None
    findings: Optional[str] = None
    created_at: datetime

