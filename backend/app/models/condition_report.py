"""
ConditionReport model for capturing physical condition and packaging integrity during a session.
"""
from datetime import datetime, timezone
from typing import TYPE_CHECKING, Optional
from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.app.database.base import Base

if TYPE_CHECKING:
    from backend.app.models.evidence_session import EvidenceSession


class ConditionReport(Base):
    __tablename__ = "condition_reports"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    session_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("evidence_sessions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    product_condition: Mapped[str] = mapped_column(String(100), nullable=False)
    damage_description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    accessories_status: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    packaging_condition: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        server_default=func.now(),
        nullable=False,
    )

    # Relationships
    session: Mapped["EvidenceSession"] = relationship(
        "EvidenceSession",
        back_populates="condition_reports",
        foreign_keys=[session_id],
    )

    def __repr__(self) -> str:
        return f"<ConditionReport id={self.id} session_id={self.session_id} condition='{self.product_condition}'>"

