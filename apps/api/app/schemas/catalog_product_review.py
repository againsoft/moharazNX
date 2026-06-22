from __future__ import annotations

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel


class ProductReviewRead(BaseModel):
    id: str
    company_id: str
    review_number: str
    product_id: str
    product_name: str
    product_sku: str
    product_brand: Optional[str] = None
    product_category: Optional[str] = None
    product_image_url: Optional[str] = None
    customer_id: Optional[str] = None
    customer_name: str
    review_type: str
    status: str
    rating: int
    title: str
    body: str
    sentiment: str
    is_verified_purchase: bool
    helpful_votes: int
    moderated_by: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class ProductReviewListMeta(BaseModel):
    count: int
    pending_count: int


class ProductReviewListResponse(BaseModel):
    data: List[ProductReviewRead]
    meta: ProductReviewListMeta


class ProductReviewResponse(BaseModel):
    data: ProductReviewRead


class ProductReviewUpdate(BaseModel):
    status: Optional[str] = None
    moderated_by: Optional[str] = None
    notes: Optional[str] = None
