"""
AuditLog model for tamper-evident digital chain-of-custody ledger records.
"""
from datetime import datetime, timezone
import hashlib
from typing import TYPE_CHECKING, Optional
from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.app.database.base import Base

if TYPE_CHECKING:
    from backend.app.models.order import Order
    from backend.app.models.user import User


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id: Mapped[Optional[int]] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    order_id: Mapped[Optional[int]] = mapped_column(
        Integer,
        ForeignKey("orders.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    event_type: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    event_description: Mapped[str] = mapped_column(Text, nullable=False)
    previous_hash: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    current_hash: Mapped[str] = mapped_column(String(64), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        server_default=func.now(),
        nullable=False,
    )

    # Relationships
    user: Mapped[Optional["User"]] = relationship(
        "User",
        back_populates="audit_logs",
        foreign_keys=[user_id],
    )
    order: Mapped[Optional["Order"]] = relationship(
        "Order",
        back_populates="audit_logs",
        foreign_keys=[order_id],
    )

    @staticmethod
    def compute_hash(
        previous_hash: Optional[str],
        event_type: str,
        event_description: str,
        timestamp_iso: str,
    ) -> str:
        """Compute SHA-256 tamper-evident chain hash."""
        data = f"{previous_hash or 'GENESIS'}|{event_type}|{event_description}|{timestamp_iso}".encode("utf-8")
        return hashlib.sha256(data).hexdigest()

    def __repr__(self) -> str:
        return f"<AuditLog id={self.id} event='{self.event_type}' hash='{self.current_hash[:8]}...'>"
