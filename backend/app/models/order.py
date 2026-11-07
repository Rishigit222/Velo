"""
Order model representing purchase transactions between buyers and sellers.
"""
from datetime import datetime, timezone
from typing import TYPE_CHECKING, List, Optional
from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.app.database.base import Base

if TYPE_CHECKING:
    from backend.app.models.audit_log import AuditLog
    from backend.app.models.dispute import Dispute
    from backend.app.models.evidence_session import EvidenceSession
    from backend.app.models.product import Product
    from backend.app.models.report import Report
    from backend.app.models.user import User
    from backend.app.models.verification_result import VerificationResult


class Order(Base):
    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    order_number: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    buyer_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    seller_id: Mapped[Optional[int]] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    product_id: Mapped[Optional[int]] = mapped_column(
        Integer,
        ForeignKey("products.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    quantity: Mapped[int] = mapped_column(Integer, default=1, server_default="1", nullable=False)
    total_amount: Mapped[float] = mapped_column(Float, default=0.0, server_default="0.0", nullable=False)
    tracking_number: Mapped[Optional[str]] = mapped_column(String(100), index=True, nullable=True)
    delivery_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    order_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        server_default=func.now(),
        nullable=False,
    )
    status: Mapped[str] = mapped_column(
        String(50),
        default="pending",
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        server_default=func.now(),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    buyer: Mapped["User"] = relationship(
        "User",
        back_populates="buyer_orders",
        foreign_keys=[buyer_id],
    )
    seller: Mapped[Optional["User"]] = relationship(
        "User",
        back_populates="seller_orders",
        foreign_keys=[seller_id],
    )
    product: Mapped[Optional["Product"]] = relationship(
        "Product",
        back_populates="orders",
        foreign_keys=[product_id],
    )
    evidence_sessions: Mapped[List["EvidenceSession"]] = relationship(
        "EvidenceSession",
        back_populates="order",
        cascade="all, delete-orphan",
    )
    verification_results: Mapped[List["VerificationResult"]] = relationship(
        "VerificationResult",
        back_populates="order",
        cascade="all, delete-orphan",
    )
    disputes: Mapped[List["Dispute"]] = relationship(
        "Dispute",
        back_populates="order",
        cascade="all, delete-orphan",
    )
    reports: Mapped[List["Report"]] = relationship(
        "Report",
        back_populates="order",
        cascade="all, delete-orphan",
    )
    audit_logs: Mapped[List["AuditLog"]] = relationship(
        "AuditLog",
        back_populates="order",
    )

    def __repr__(self) -> str:
        return f"<Order id={self.id} number='{self.order_number}' status='{self.status}'>"
