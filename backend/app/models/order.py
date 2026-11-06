"""
Order model representing purchase transactions between buyers and sellers.
"""
from datetime import datetime, timezone
from typing import TYPE_CHECKING, Optional
from sqlalchemy import DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.app.database.base import Base

if TYPE_CHECKING:
    from backend.app.models.product import Product
    from backend.app.models.user import User


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

    def __repr__(self) -> str:
        return f"<Order id={self.id} number='{self.order_number}' status='{self.status}'>"

