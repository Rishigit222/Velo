"""
VerificationResult model comparing delivery and return evidence sessions.
"""
from datetime import datetime, timezone
from typing import TYPE_CHECKING, Optional
from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.app.database.base import Base

if TYPE_CHECKING:
    from backend.app.models.evidence_session import EvidenceSession
    from backend.app.models.order import Order


class VerificationResult(Base):
    __tablename__ = "verification_results"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    order_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("orders.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    original_session_id: Mapped[Optional[int]] = mapped_column(
        Integer,
        ForeignKey("evidence_sessions.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    return_session_id: Mapped[Optional[int]] = mapped_column(
        Integer,
        ForeignKey("evidence_sessions.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    identity_result: Mapped[str] = mapped_column(String(50), nullable=False)
    damage_result: Mapped[str] = mapped_column(String(50), nullable=False)
    accessories_result: Mapped[str] = mapped_column(String(50), nullable=False)
    overall_status: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    confidence_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    findings: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        server_default=func.now(),
        nullable=False,
    )

    # Relationships
    order: Mapped["Order"] = relationship(
        "Order",
        back_populates="verification_results",
        foreign_keys=[order_id],
    )
    original_session: Mapped[Optional["EvidenceSession"]] = relationship(
        "EvidenceSession",
        back_populates="original_verifications",
        foreign_keys=[original_session_id],
    )
    return_session: Mapped[Optional["EvidenceSession"]] = relationship(
        "EvidenceSession",
        back_populates="return_verifications",
        foreign_keys=[return_session_id],
    )

    def __repr__(self) -> str:
        return f"<VerificationResult id={self.id} order_id={self.order_id} status='{self.overall_status}' confidence={self.confidence_score}>"

