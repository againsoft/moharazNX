from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field


class ProductBase(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    slug: str = Field(min_length=1, max_length=255)
    sku: str = Field(min_length=1, max_length=100)
    description: Optional[str] = None
    price: Decimal = Field(ge=0)
    compare_at_price: Optional[Decimal] = Field(default=None, ge=0)
    stock: int = Field(default=0, ge=0)
    status: str = Field(default="draft", pattern="^(draft|published|archived)$")
    brand: Optional[str] = None
    category: Optional[str] = None
    thumbnail: Optional[str] = None


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=255)
    slug: Optional[str] = Field(default=None, min_length=1, max_length=255)
    sku: Optional[str] = Field(default=None, min_length=1, max_length=100)
    description: Optional[str] = None
    price: Optional[Decimal] = Field(default=None, ge=0)
    compare_at_price: Optional[Decimal] = Field(default=None, ge=0)
    stock: Optional[int] = Field(default=None, ge=0)
    status: Optional[str] = Field(default=None, pattern="^(draft|published|archived)$")
    brand: Optional[str] = None
    category: Optional[str] = None
    thumbnail: Optional[str] = None


class ProductRead(ProductBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    company_id: str
    created_at: datetime
    updated_at: datetime


class ProductListMeta(BaseModel):
    count: int
    page: int = 1
    per_page: int = 50


class ProductListResponse(BaseModel):
    data: List[ProductRead]
    meta: ProductListMeta
    errors: List[str] = []


class ProductResponse(BaseModel):
    data: ProductRead
    errors: List[str] = []


class HealthResponse(BaseModel):
    status: str
    app: str
    env: str
    database: dict
