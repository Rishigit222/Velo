"""
Pydantic schemas for Evidence Sessions, Files, Condition Reports, Verifications, Disputes, and Audits.
"""
from datetime import datetime
from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


class SessionTypeEnum(str, Enum):
    DELIVERY = "delivery"
    RETURN = "return"


class SessionStatusEnum(str, Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


# Evidence File Schemas
class EvidenceFileBase(BaseModel):
    file_name: str = Field(..., max_length=255)
    file_type: str = Field(..., max_length=100)
    file_path: Optional[str] = Field(None, max_length=500, description="Virtual or relative storage path")
    file_hash: str = Field(..., min_length=64, max_length=64, description="SHA-256 hash")
    file_size: int = Field(..., gt=0)
    download_url: Optional[str] = None


class EvidenceFileCreate(EvidenceFileBase):
    session_id: int
    uploaded_by: Optional[int] = None


class EvidenceFileResponse(EvidenceFileBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    session_id: int
    uploaded_by: Optional[int] = None
    uploaded_at: datetime


# Condition Report Schemas
class ConditionReportBase(BaseModel):
    product_condition: str = Field(..., max_length=100)
    damage_description: Optional[str] = None
    accessories_status: Optional[str] = Field(None, max_length=100)
    packaging_condition: Optional[str] = Field(None, max_length=100)
    additional_notes: Optional[str] = None


class ConditionReportCreate(ConditionReportBase):
    session_id: Optional[int] = None


class ConditionReportResponse(ConditionReportBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    session_id: int
    created_at: datetime


# Evidence Session Schemas
class EvidenceSessionBase(BaseModel):
    order_id: int
    session_type: SessionTypeEnum = SessionTypeEnum.DELIVERY
    session_status: SessionStatusEnum = SessionStatusEnum.ACTIVE


class EvidenceSessionCreate(BaseModel):
    order_id: int
    session_type: SessionTypeEnum = SessionTypeEnum.DELIVERY


class EvidenceSessionStatusUpdate(BaseModel):
    status: Optional[SessionStatusEnum] = None
    session_status: Optional[SessionStatusEnum] = None


class EvidenceSessionResponse(EvidenceSessionBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    status: Optional[str] = None
    created_by: Optional[int] = None
    created_at: datetime
    completed_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    files: List[EvidenceFileResponse] = []
    condition_reports: List[ConditionReportResponse] = []


# Verification Result Schemas
class VerificationResultBase(BaseModel):
    order_id: int
    original_session_id: Optional[int] = None
    return_session_id: Optional[int] = None
    identity_result: str = Field(..., max_length=50)
    damage_result: str = Field(..., max_length=50)
    accessories_result: str = Field(..., max_length=50)
    overall_status: str = Field(..., max_length=50)
    confidence_score: Optional[float] = Field(None, ge=0.0, le=1.0)
    findings: Optional[str] = None


class VerificationResultCreate(VerificationResultBase):
    pass


class VerificationResultResponse(VerificationResultBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime


# Dispute Schemas
from backend.app.schemas.dispute import (
    DisputeBase,
    DisputeCreate,
    DisputeDetailResponse,
    DisputeReasonEnum,
    DisputeResponse,
    DisputeStatusEnum,
    DisputeStatusUpdate,
    DisputeUpdate,
)


# Audit Log Schemas
class AuditLogBase(BaseModel):
    user_id: Optional[int] = None
    order_id: Optional[int] = None
    event_type: str = Field(..., max_length=100)
    event_description: str
    previous_hash: Optional[str] = Field(None, max_length=64)
    current_hash: str = Field(..., max_length=64)


class AuditLogCreate(AuditLogBase):
    pass


class AuditLogResponse(AuditLogBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime


class AuditVerificationResponse(BaseModel):
    is_valid: bool
    total_records: int
    verified_records: int
    tampered_records: List[int] = []
    errors: List[str] = []

