"""
Pydantic schemas for Dispute Management and Arbitration Lifecycles.
"""
from datetime import datetime
from enum import Enum
from typing import Any, List, Optional
from pydantic import BaseModel, ConfigDict, Field


class DisputeReasonEnum(str, Enum):
    PRODUCT_RETURNED_DAMAGED = "Product returned damaged"
    MISSING_ACCESSORIES = "Missing accessories"
    PRODUCT_IDENTITY_MISMATCH = "Product identity mismatch"
    PACKAGING_ISSUE = "Packaging issue"
    INCORRECT_RETURN = "Incorrect return"
    OTHER = "Other"


class DisputeStatusEnum(str, Enum):
    SUBMITTED = "submitted"
    UNDER_REVIEW = "under_review"
    RESOLVED = "resolved"
    REJECTED = "rejected"


class DisputeBase(BaseModel):
    order_id: int = Field(..., description="ID of the order in dispute")
    dispute_reason: DisputeReasonEnum = Field(..., description="Primary classification reason")
    description: str = Field(..., min_length=10, description="Detailed explanation of the discrepancy")


class DisputeCreate(DisputeBase):
    pass


class DisputeStatusUpdate(BaseModel):
    status: str = Field(..., description="New dispute status: 'submitted', 'under_review', 'resolved', 'rejected'")
    resolution_details: Optional[str] = Field(None, description="Explanation or arbitration decision notes")


class DisputeUpdate(BaseModel):
    status: Optional[str] = Field(None, max_length=50)
    description: Optional[str] = None
    resolution_details: Optional[str] = None


class DisputeResponse(DisputeBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    raised_by: int
    status: str
    resolution_details: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class DisputeDetailResponse(DisputeResponse):
    order: Optional[Any] = None
    evidence_sessions: Optional[List[Any]] = None
    verification_results: Optional[List[Any]] = None
    audit_events: Optional[List[Any]] = None
