from __future__ import annotations

import uuid
from datetime import datetime
from decimal import Decimal
from typing import Optional

from sqlalchemy import DateTime, ForeignKey, Integer, Numeric, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class StorefrontCart(Base):
    __tablename__ = "storefront_carts"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    cart_token: Mapped[str] = mapped_column(String(64), nullable=False, unique=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())

    items: Mapped[list["StorefrontCartItem"]] = relationship(
        "StorefrontCartItem",
        back_populates="cart",
        cascade="all, delete-orphan",
    )


class StorefrontCartItem(Base):
    __tablename__ = "storefront_cart_items"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    cart_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("storefront_carts.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    product_id: Mapped[str] = mapped_column(String(36), nullable=False, index=True)
    slug: Mapped[str] = mapped_column(String(255), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    thumbnail: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    unit_price: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    compare_at_price: Mapped[Optional[Decimal]] = mapped_column(Numeric(12, 2), nullable=True)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False, default=1)

    cart: Mapped["StorefrontCart"] = relationship("StorefrontCart", back_populates="items")
