from __future__ import annotations

import json
from datetime import datetime
from decimal import Decimal
from typing import Any, List, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator


def dump_tags(tags: Optional[List[str]]) -> str:
    return json.dumps(tags or [])


def load_tags(raw: Optional[str]) -> List[str]:
    if not raw:
        return []
    try:
        data = json.loads(raw)
        return data if isinstance(data, list) else []
    except json.JSONDecodeError:
        return []


class ProductBase(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    slug: str = Field(min_length=1, max_length=255)
    sku: str = Field(min_length=1, max_length=100)
    description: Optional[str] = None
    short_description: Optional[str] = None
    price: Decimal = Field(ge=0)
    compare_at_price: Optional[Decimal] = Field(default=None, ge=0)
    stock: int = Field(default=0, ge=0)
    status: str = Field(default="draft", pattern="^(draft|published|archived)$")
    product_type: str = Field(default="simple", pattern="^(simple|variable|digital)$")
    visibility: str = Field(default="public", pattern="^(public|private)$")
    brand: Optional[str] = Field(default=None, max_length=100)
    category: Optional[str] = Field(default=None, max_length=100)
    brand_id: Optional[str] = None
    category_id: Optional[str] = None
    attribute_profile_id: Optional[str] = None
    thumbnail: Optional[str] = Field(default=None, max_length=500)
    seo_title: Optional[str] = Field(default=None, max_length=255)
    seo_description: Optional[str] = None
    warranty: Optional[str] = Field(default=None, max_length=200)
    tags: List[str] = Field(default_factory=list)
    custom_specs_json: Optional[str] = None

    @field_validator("tags", mode="before")
    @classmethod
    def coerce_tags(cls, value: Any) -> List[str]:
        if value is None:
            return []
        if isinstance(value, str):
            return load_tags(value)
        return value


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=255)
    slug: Optional[str] = Field(default=None, min_length=1, max_length=255)
    sku: Optional[str] = Field(default=None, min_length=1, max_length=100)
    description: Optional[str] = None
    short_description: Optional[str] = None
    price: Optional[Decimal] = Field(default=None, ge=0)
    compare_at_price: Optional[Decimal] = Field(default=None, ge=0)
    stock: Optional[int] = Field(default=None, ge=0)
    status: Optional[str] = Field(default=None, pattern="^(draft|published|archived)$")
    product_type: Optional[str] = Field(default=None, pattern="^(simple|variable|digital)$")
    visibility: Optional[str] = Field(default=None, pattern="^(public|private)$")
    brand: Optional[str] = Field(default=None, max_length=100)
    category: Optional[str] = Field(default=None, max_length=100)
    brand_id: Optional[str] = None
    category_id: Optional[str] = None
    attribute_profile_id: Optional[str] = None
    thumbnail: Optional[str] = Field(default=None, max_length=500)
    seo_title: Optional[str] = Field(default=None, max_length=255)
    seo_description: Optional[str] = None
    warranty: Optional[str] = Field(default=None, max_length=200)
    tags: Optional[List[str]] = None
    custom_specs_json: Optional[str] = None


class ProductRead(ProductBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    company_id: str
    created_at: datetime
    updated_at: datetime


class ProductVariantBrief(BaseModel):
    id: str
    sku: str
    name: str
    price: Decimal
    stock: int
    status: str
    is_default: bool
    sort_order: int
    image_id: Optional[str] = None
    image_url: Optional[str] = None


class ProductMediaBrief(BaseModel):
    id: str
    media_id: str
    url: str
    name: str
    media_type: str
    sort_order: int
    is_primary: bool


class ProductDetailRead(ProductRead):
    variants: List[ProductVariantBrief] = Field(default_factory=list)
    media: List[ProductMediaBrief] = Field(default_factory=list)
    has_inventory: bool = False


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


class ProductDetailResponse(BaseModel):
    data: ProductDetailRead
    errors: List[str] = []


class ProductMediaReplace(BaseModel):
    media_ids: List[str] = Field(default_factory=list)


class ProductSpecValueRead(BaseModel):
    attribute_id: str
    attribute_code: str
    attribute_name: str
    value: str


class ProductSpecsRead(BaseModel):
    attribute_profile_id: Optional[str] = None
    values: List[ProductSpecValueRead] = Field(default_factory=list)


class ProductSpecValueUpsert(BaseModel):
    attribute_id: str
    value: str = ""


class ProductSpecsReplace(BaseModel):
    attribute_profile_id: Optional[str] = None
    values: List[ProductSpecValueUpsert] = Field(default_factory=list)


class ProductSpecsResponse(BaseModel):
    data: ProductSpecsRead
    errors: List[str] = []


class ProductSlugCheckResponse(BaseModel):
    slug: str
    available: bool
    message: Optional[str] = None


class ProductInventoryUpsert(BaseModel):
    warehouse_id: str = Field(min_length=1)
    on_hand: Optional[int] = Field(default=None, ge=0)
    min_qty: int = Field(default=10, ge=0)
    unit_cost: Optional[Decimal] = Field(default=None, ge=0)


class ProductInventoryRead(BaseModel):
    id: str
    warehouse_id: str
    warehouse_name: str
    variant_id: str
    on_hand: int
    min_qty: int
    unit_cost: Decimal


class ProductInventoryResponse(BaseModel):
    data: ProductInventoryRead
    errors: List[str] = []


class HealthResponse(BaseModel):
    status: str
    app: str
    env: str
    database: dict
