"""
Pydantic schemas for PDF Evidence Reports and Custody Dossiers.
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class ReportBase(BaseModel):
    order_id: int = Field(..., description="Target order ID for report generation")
    report_type: str = Field("evidence_dossier", max_length=50)


class ReportGenerateRequest(BaseModel):
    report_type: str = Field("full_chain_of_custody", max_length=50, description="Report type: 'evidence_summary', 'full_chain_of_custody', 'dispute_arbitration'")
    include_audit_trail: bool = Field(True, description="Include tamper-evident audit history in PDF")
    include_disputes: bool = Field(True, description="Include dispute and claim details in PDF")


class ReportResponse(ReportBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    generated_by: Optional[int] = None
    file_name: str
    file_size: int
    file_hash: str
    version: str
    status: str
    download_url: str = Field(..., description="Secure authenticated API endpoint to download PDF")
    created_at: datetime
