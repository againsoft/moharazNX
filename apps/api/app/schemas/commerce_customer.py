from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class CustomerRead(BaseModel):
    id: str
    company_id: str
    customer_code: str
    name: str
    phone: str
    email: str
    profile_image: Optional[str] = None
    group: str
    status: str
    loyalty_tier: str
    city: str
    region: str
    country: str
    customer_since: date
    last_order_date: Optional[date] = None
    assigned_staff: Optional[str] = None
    tags: List[str] = Field(default_factory=list)
    total_orders: int
    total_spend: Decimal
    avg_order_value: Decimal
    return_rate: Decimal
    reward_points: int
    wallet_balance: Decimal
    risk_score: int
    risk_level: str
    notes: Optional[str] = None
    addresses: List[Dict[str, Any]] = Field(default_factory=list)
    recent_orders: List[Dict[str, Any]] = Field(default_factory=list)
    wallet_transactions: List[Dict[str, Any]] = Field(default_factory=list)
    reward_events: List[Dict[str, Any]] = Field(default_factory=list)
    timeline: List[Dict[str, Any]] = Field(default_factory=list)
    comments: List[Dict[str, Any]] = Field(default_factory=list)
    activities: List[Dict[str, Any]] = Field(default_factory=list)
    attachments: List[Dict[str, Any]] = Field(default_factory=list)
    ai_insights: Dict[str, Any] = Field(default_factory=dict)
    created_at: datetime
    updated_at: datetime


class CustomerListMeta(BaseModel):
    count: int
    total_spend: Decimal


class CustomerListResponse(BaseModel):
    data: List[CustomerRead]
    meta: CustomerListMeta


class CustomerResponse(BaseModel):
    data: CustomerRead


class CustomerUpdate(BaseModel):
    status: Optional[str] = None
    group: Optional[str] = None
    loyalty_tier: Optional[str] = None
    assigned_staff: Optional[str] = None
    notes: Optional[str] = None
    tags: Optional[List[str]] = None
