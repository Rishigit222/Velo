"""
FastAPI endpoints for Dispute Management and Claim Resolution.
"""
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from backend.app.database.connection import get_db
from backend.app.models.user import User
from backend.app.routes.deps import get_current_user
from backend.app.schemas.dispute import (
    DisputeCreate,
    DisputeResponse,
    DisputeStatusUpdate,
)
from backend.app.services.dispute_service import (
    create_dispute,
    get_dispute_details_for_user,
    get_dispute_for_user,
    list_disputes,
    update_dispute_status,
)

router = APIRouter(prefix="/disputes", tags=["Dispute Management"])


@router.post(
    "",
    response_model=DisputeResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Raise a dispute on an order",
    description="File a structured dispute claim against an order. Prevents duplicate active disputes and enforces RBAC.",
)
def post_dispute(
    dispute_in: DisputeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> DisputeResponse:
    dispute = create_dispute(db=db, dispute_in=dispute_in, current_user=current_user)
    return DisputeResponse.model_validate(dispute)


@router.get(
    "",
    response_model=List[DisputeResponse],
    summary="List accessible disputes",
    description="List disputes with role-based visibility. Supports filtering by order_id and status.",
)
def get_disputes(
    order_id: Optional[int] = Query(None, description="Filter by target order ID"),
    status: Optional[str] = Query(None, description="Filter by status ('submitted', 'under_review', 'resolved', 'rejected')"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> List[DisputeResponse]:
    disputes = list_disputes(
        db=db,
        current_user=current_user,
        order_id=order_id,
        status_filter=status,
    )
    return [DisputeResponse.model_validate(d) for d in disputes]


@router.get(
    "/{dispute_id}",
    summary="Get dispute details & associated evidence",
    description="Retrieve dispute parameters, related order, evidence sessions, and tamper-evident audit history.",
)
def get_single_dispute(
    dispute_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    return get_dispute_details_for_user(db=db, dispute_id=dispute_id, current_user=current_user)


@router.patch(
    "/{dispute_id}/status",
    response_model=DisputeResponse,
    summary="Update dispute status",
    description="Execute an authorized dispute lifecycle transition ('under_review', 'resolved', 'rejected'). Transactionally records audit entry.",
)
def patch_dispute_status(
    dispute_id: int,
    status_update: DisputeStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> DisputeResponse:
    updated = update_dispute_status(
        db=db,
        dispute_id=dispute_id,
        status_update=status_update,
        current_user=current_user,
    )
    return DisputeResponse.model_validate(updated)
