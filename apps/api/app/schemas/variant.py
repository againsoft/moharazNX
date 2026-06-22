from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field


class VariantRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    product_id: str
    product_name: str
    product_sku: str
    variant_label: str
    variant_sku: str
    price: Decimal
    stock: int
    status: str
    category: str
    is_default: bool
    sort_order: int
    created_at: datetime
    updated_at: datetime


class VariantListMeta(BaseModel):
    count: int


class VariantListResponse(BaseModel):
    data: List[VariantRead]
    meta: VariantListMeta
    errors: List[str] = []


class VariantResponse(BaseModel):
    data: VariantRead
    errors: List[str] = []
