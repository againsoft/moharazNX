from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, ConfigDict, Field


class OrderItemRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    product_id: str
    variant_id: Optional[str] = None
    sku: str
    name: str
    image_url: Optional[str] = None
    variant_label: Optional[str] = None
    quantity: int
    unit_price: Decimal
    discount_amount: Decimal
    tax_amount: Decimal
    line_total: Decimal
    sort_order: int


class OrderRead(BaseModel):
    id: str
    company_id: str
    order_number: str
    order_date: datetime
    status: str
    payment_status: str
    shipment_status: str
    source: str
    branch: str
    assigned_staff: Optional[str] = None
    priority: str
    tags: List[str] = Field(default_factory=list)
    customer_id: Optional[str] = None
    customer_name: str
    customer_phone: str
    customer_email: str
    customer_group: Optional[str] = None
    customer_lifetime_value: Decimal
    customer_order_count: int
    customer_risk_score: int
    billing_address: Optional[str] = None
    billing_city: Optional[str] = None
    billing_region: Optional[str] = None
    billing_country: Optional[str] = None
    shipping_address: Optional[str] = None
    shipping_city: Optional[str] = None
    shipping_region: Optional[str] = None
    shipping_country: Optional[str] = None
    payment_method: str
    payment_transaction_id: Optional[str] = None
    paid_amount: Decimal
    due_amount: Decimal
    refund_amount: Decimal
    courier: Optional[str] = None
    tracking_number: Optional[str] = None
    tracking_url: Optional[str] = None
    shipping_cost: Decimal
    shipped_at: Optional[datetime] = None
    delivered_at: Optional[datetime] = None
    subtotal: Decimal
    discount_amount: Decimal
    tax_amount: Decimal
    shipping_amount: Decimal
    grand_total: Decimal
    notes: Optional[str] = None
    ai_risk: str
    ai_summary: Optional[str] = None
    timeline: List[Dict[str, Any]] = Field(default_factory=list)
    activities: List[Dict[str, Any]] = Field(default_factory=list)
    comments: List[Dict[str, Any]] = Field(default_factory=list)
    attachments: List[Dict[str, Any]] = Field(default_factory=list)
    payment_timeline: List[Dict[str, Any]] = Field(default_factory=list)
    ai_insights: Dict[str, Any] = Field(default_factory=dict)
    followers: List[str] = Field(default_factory=list)
    items: List[OrderItemRead] = Field(default_factory=list)
    item_count: int = 0
    created_at: datetime
    updated_at: datetime


class OrderListMeta(BaseModel):
    count: int
    total_revenue: Decimal


class OrderListResponse(BaseModel):
    data: List[OrderRead]
    meta: OrderListMeta


class OrderResponse(BaseModel):
    data: OrderRead


class OrderUpdate(BaseModel):
    status: Optional[str] = None
    payment_status: Optional[str] = None
    shipment_status: Optional[str] = None
    assigned_staff: Optional[str] = None
    priority: Optional[str] = None
    notes: Optional[str] = None
    courier: Optional[str] = None
    tracking_number: Optional[str] = None
    tracking_url: Optional[str] = None
