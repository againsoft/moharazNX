from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field


class CouponRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    company_id: str
    code: str
    name: str
    discount_type: str
    discount_value: Decimal
    discount_label: str
    status: str
    redemptions: int
    redemption_limit: Optional[int] = None
    starts_at: date
    ends_at: date
    min_order_amount: Optional[Decimal] = None
    created_at: datetime
    updated_at: datetime


class CouponListMeta(BaseModel):
    count: int
    active_count: int


class CouponListResponse(BaseModel):
    data: List[CouponRead]
    meta: CouponListMeta


class CouponResponse(BaseModel):
    data: CouponRead


class CouponUpdate(BaseModel):
    status: Optional[str] = None
    name: Optional[str] = Field(default=None, max_length=255)
    redemption_limit: Optional[int] = Field(default=None, ge=0)
