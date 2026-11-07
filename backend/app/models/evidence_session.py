"""
EvidenceSession model for tracking delivery unboxing and return inspection sessions.
"""
from datetime import datetime, timezone
from enum import Enum
from typing import TYPE_CHECKING, List, Optional
from sqlalchemy import DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.app.database.base import Base

if TYPE_CHECKING:
    from backend.app.models.condition_report import ConditionReport
    from backend.app.models.evidence_file import EvidenceFile
    from backend.app.models.order import Order
    from backend.app.models.user import User
    from backend.app.models.verification_result import VerificationResult


class SessionType(str, Enum):
    DELIVERY = "delivery"
    RETURN = "return"


class SessionStatus(str, Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class EvidenceSession(Base):
    __tablename__ = "evidence_sessions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    order_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("orders.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    session_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default=SessionType.DELIVERY.value,
        index=True,
    )
    created_by: Mapped[Optional[int]] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    session_status: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default=SessionStatus.ACTIVE.value,
        index=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        server_default=func.now(),
        nullable=False,
    )
    completed_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    # Relationships
    order: Mapped["Order"] = relationship(
        "Order",
        back_populates="evidence_sessions",
        foreign_keys=[order_id],
    )
    creator: Mapped[Optional["User"]] = relationship(
        "User",
        back_populates="evidence_sessions",
        foreign_keys=[created_by],
    )
    files: Mapped[List["EvidenceFile"]] = relationship(
        "EvidenceFile",
        back_populates="session",
        cascade="all, delete-orphan",
    )
    condition_reports: Mapped[List["ConditionReport"]] = relationship(
        "ConditionReport",
        back_populates="session",
        cascade="all, delete-orphan",
    )
    original_verifications: Mapped[List["VerificationResult"]] = relationship(
        "VerificationResult",
        back_populates="original_session",
        foreign_keys="VerificationResult.original_session_id",
    )
    return_verifications: Mapped[List["VerificationResult"]] = relationship(
        "VerificationResult",
        back_populates="return_session",
        foreign_keys="VerificationResult.return_session_id",
    )

    @property
    def status(self) -> str:
        """Alias for session_status for standard client schema compatibility."""
        return self.session_status

    @property
    def updated_at(self) -> datetime:
        """Completed or created timestamp."""
        return self.completed_at or self.created_at

    def __repr__(self) -> str:
        return f"<EvidenceSession id={self.id} order_id={self.order_id} type='{self.session_type}' status='{self.session_status}'>"

