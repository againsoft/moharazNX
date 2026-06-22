from __future__ import annotations

import uuid
from datetime import datetime
from decimal import Decimal
from typing import Optional

from sqlalchemy import DateTime, ForeignKey, Integer, Numeric, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class CatalogProduct(Base):
    """Catalog product master — AgainERP catalog_products subset."""

    __tablename__ = "catalog_products"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    company_id: Mapped[str] = mapped_column(String(36), nullable=False, default="default")
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(255), nullable=False, unique=True, index=True)
    sku: Mapped[str] = mapped_column(String(100), nullable=False, unique=True, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    price: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False, default=0)
    compare_at_price: Mapped[Optional[Decimal]] = mapped_column(Numeric(12, 2), nullable=True)
    stock: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="draft")
    product_type: Mapped[str] = mapped_column(String(20), nullable=False, default="simple")
    visibility: Mapped[str] = mapped_column(String(20), nullable=False, default="public")
    brand: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    category: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    brand_id: Mapped[Optional[str]] = mapped_column(
        String(36),
        ForeignKey("catalog_brands.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    category_id: Mapped[Optional[str]] = mapped_column(
        String(36),
        ForeignKey("catalog_categories.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    attribute_profile_id: Mapped[Optional[str]] = mapped_column(
        String(36),
        ForeignKey("catalog_attribute_profiles.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    short_description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    tags_json: Mapped[str] = mapped_column(Text, nullable=False, default="[]")
    seo_title: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    seo_description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    thumbnail: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=func.now(),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )
