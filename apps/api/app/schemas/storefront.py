from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field


class StorefrontProductRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    slug: str
    name: str
    price: Decimal
    compare_at_price: Optional[Decimal] = None
    stock: int
    brand: str
    category: str
    thumbnail: Optional[str] = None
    in_stock: bool


class StorefrontProductListMeta(BaseModel):
    count: int
    page: int = 1
    per_page: int = 50


class StorefrontProductListResponse(BaseModel):
    data: List[StorefrontProductRead]
    meta: StorefrontProductListMeta


class StorefrontProductResponse(BaseModel):
    data: StorefrontProductRead


class StorefrontCartItemRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    product_id: str
    slug: str
    name: str
    thumbnail: Optional[str] = None
    unit_price: Decimal
    compare_at_price: Optional[Decimal] = None
    quantity: int


class StorefrontCartRead(BaseModel):
    cart_token: str
    items: List[StorefrontCartItemRead]
    item_count: int
    subtotal: Decimal


class StorefrontCartResponse(BaseModel):
    data: StorefrontCartRead


class StorefrontCartItemCreate(BaseModel):
    product_id: str
    quantity: int = Field(default=1, ge=1, le=99)


class StorefrontCartItemUpdate(BaseModel):
    quantity: int = Field(ge=0, le=99)


class StorefrontCheckoutCreate(BaseModel):
    email: str = Field(min_length=3, max_length=255)
    first_name: str = Field(min_length=1, max_length=100)
    last_name: str = Field(min_length=1, max_length=100)
    phone: str = Field(min_length=3, max_length=50)
    address: str = Field(min_length=3, max_length=500)
    district: str = Field(default="", max_length=100)
    postal_code: str = Field(default="", max_length=20)
    notes: Optional[str] = None
    payment_method: str = Field(default="cod", max_length=50)
    shipping_method: str = Field(default="standard", max_length=50)


class StorefrontCheckoutRead(BaseModel):
    id: str
    order_number: str
    email: str
    grand_total: Decimal
    payment_method: str


class StorefrontCheckoutResponse(BaseModel):
    data: StorefrontCheckoutRead
