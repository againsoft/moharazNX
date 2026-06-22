from __future__ import annotations

import json
import uuid
from datetime import date, datetime
from decimal import Decimal
from typing import Any, List, Optional

from sqlalchemy import Date, DateTime, Integer, Numeric, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


def dump_json(value: Any) -> str:
    return json.dumps(value if value is not None else [])


def load_json(value: Optional[str], default: Any = None) -> Any:
    if not value:
        return default if default is not None else []
    try:
        return json.loads(value)
    except json.JSONDecodeError:
        return default if default is not None else []


class CommerceCustomer(Base):
    __tablename__ = "commerce_customers"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    company_id: Mapped[str] = mapped_column(String(36), nullable=False, default="default")
    customer_code: Mapped[str] = mapped_column(String(50), nullable=False, unique=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[str] = mapped_column(String(50), nullable=False, default="")
    email: Mapped[str] = mapped_column(String(255), nullable=False, default="", index=True)
    profile_image: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    group: Mapped[str] = mapped_column(String(30), nullable=False, default="retail")
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="active", index=True)
    loyalty_tier: Mapped[str] = mapped_column(String(20), nullable=False, default="silver")
    city: Mapped[str] = mapped_column(String(100), nullable=False, default="")
    region: Mapped[str] = mapped_column(String(100), nullable=False, default="")
    country: Mapped[str] = mapped_column(String(100), nullable=False, default="Bangladesh")
    customer_since: Mapped[date] = mapped_column(Date, nullable=False)
    last_order_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    assigned_staff: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    tags_json: Mapped[str] = mapped_column(Text, nullable=False, default="[]")
    total_orders: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    total_spend: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False, default=0)
    avg_order_value: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False, default=0)
    return_rate: Mapped[Decimal] = mapped_column(Numeric(6, 2), nullable=False, default=0)
    reward_points: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    wallet_balance: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False, default=0)
    risk_score: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    risk_level: Mapped[str] = mapped_column(String(20), nullable=False, default="low")
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    addresses_json: Mapped[str] = mapped_column(Text, nullable=False, default="[]")
    wallet_transactions_json: Mapped[str] = mapped_column(Text, nullable=False, default="[]")
    reward_events_json: Mapped[str] = mapped_column(Text, nullable=False, default="[]")
    timeline_json: Mapped[str] = mapped_column(Text, nullable=False, default="[]")
    comments_json: Mapped[str] = mapped_column(Text, nullable=False, default="[]")
    activities_json: Mapped[str] = mapped_column(Text, nullable=False, default="[]")
    attachments_json: Mapped[str] = mapped_column(Text, nullable=False, default="[]")
    ai_insights_json: Mapped[str] = mapped_column(Text, nullable=False, default="{}")
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

    @property
    def tags(self) -> List[str]:
        return load_json(self.tags_json, [])
