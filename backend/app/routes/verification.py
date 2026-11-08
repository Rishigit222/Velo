"""
FastAPI endpoints for AI-Assisted Multimodal Verification and Comparison Engine.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from backend.app.database.connection import get_db
from backend.app.models.user import User
from backend.app.routes.deps import get_current_user
from backend.app.schemas.verification import (
    RunVerificationRequest,
    VerificationResultResponse,
    VerificationStatusResponse,
)
from backend.app.services.verification_service import (
    execute_verification,
    list_verification_results,
)

router = APIRouter(prefix="/verification", tags=["Verification Engine"])


@router.get(
    "/status",
    response_model=VerificationStatusResponse,
    summary="Check verification engine availability",
    description="Check whether the visual comparison and verification engine is operational.",
)
def get_verification_status() -> VerificationStatusResponse:
    """Return status of verification engine service."""
    return VerificationStatusResponse(
        isAvailable=True,
        message="Velo Automated Verification Engine is operational.",
        engine_version="1.0.0",
    )


@router.post(
    "/run",
    response_model=VerificationResultResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Execute product condition verification",
    description="Run automated visual comparison between outbound delivery and inbound return evidence sessions.",
)
def post_run_verification(
    payload: RunVerificationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> VerificationResultResponse:
    """Execute condition verification and return structured findings."""
    result = execute_verification(db=db, request_in=payload, current_user=current_user)
    return VerificationResultResponse.model_validate(result)


@router.get(
    "/history",
    response_model=List[VerificationResultResponse],
    summary="List verification history",
    description="Retrieve past verification results for an order, filtered by role-based access controls.",
)
def get_verification_history(
    order_id: Optional[int] = Query(None, description="Optional order ID to filter results"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> List[VerificationResultResponse]:
    """Retrieve verification records accessible to current user."""
    results = list_verification_results(db=db, current_user=current_user, order_id=order_id)
    return [VerificationResultResponse.model_validate(r) for r in results]

