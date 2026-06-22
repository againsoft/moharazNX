from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.deps.auth import require_write_access
from app.database import get_db
from app.models.catalog_product_review import CatalogProductReview
from app.schemas.catalog_product_review import (
    ProductReviewListMeta,
    ProductReviewListResponse,
    ProductReviewRead,
    ProductReviewResponse,
    ProductReviewUpdate,
)

router = APIRouter(prefix="/reviews", tags=["catalog-reviews"])


def _to_read(row: CatalogProductReview) -> ProductReviewRead:
    return ProductReviewRead.model_validate(row)


@router.get("", response_model=ProductReviewListResponse)
def list_reviews(
    db: Session = Depends(get_db),
    search: Optional[str] = Query(default=None),
    status: Optional[str] = Query(default=None),
) -> ProductReviewListResponse:
    query = db.query(CatalogProductReview).order_by(CatalogProductReview.created_at.desc())

    if status:
        query = query.filter(CatalogProductReview.status == status)
    if search:
        term = f"%{search.strip().lower()}%"
        query = query.filter(
            (CatalogProductReview.review_number.ilike(term))
            | (CatalogProductReview.product_name.ilike(term))
            | (CatalogProductReview.customer_name.ilike(term))
            | (CatalogProductReview.title.ilike(term)),
        )

    rows = query.all()
    data = [_to_read(row) for row in rows]
    pending = sum(1 for row in rows if row.status == "pending")
    return ProductReviewListResponse(
        data=data,
        meta=ProductReviewListMeta(count=len(data), pending_count=pending),
    )


@router.get("/{review_id}", response_model=ProductReviewResponse)
def get_review(review_id: str, db: Session = Depends(get_db)) -> ProductReviewResponse:
    row = db.get(CatalogProductReview, review_id)
    if not row:
        raise HTTPException(status_code=404, detail="Review not found")
    return ProductReviewResponse(data=_to_read(row))


@router.patch("/{review_id}", response_model=ProductReviewResponse)
def update_review(
    review_id: str,
    payload: ProductReviewUpdate,
    db: Session = Depends(get_db),
    _: object = Depends(require_write_access),
) -> ProductReviewResponse:
    row = db.get(CatalogProductReview, review_id)
    if not row:
        raise HTTPException(status_code=404, detail="Review not found")

    updates = payload.model_dump(exclude_unset=True)
    for key, value in updates.items():
        setattr(row, key, value)

    db.commit()
    db.refresh(row)
    return ProductReviewResponse(data=_to_read(row))
