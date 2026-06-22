from __future__ import annotations

from decimal import Decimal
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.catalog_product import CatalogProduct
from app.schemas.storefront import (
    StorefrontProductListMeta,
    StorefrontProductListResponse,
    StorefrontProductRead,
    StorefrontProductResponse,
)

router = APIRouter(prefix="/products", tags=["storefront-products"])


def _to_storefront_product(row: CatalogProduct) -> StorefrontProductRead:
    return StorefrontProductRead(
        id=row.id,
        slug=row.slug,
        name=row.name,
        price=row.price,
        compare_at_price=row.compare_at_price,
        stock=row.stock,
        brand=row.brand or "Unknown",
        category=row.category or "Uncategorized",
        thumbnail=row.thumbnail,
        in_stock=row.stock > 0,
    )


@router.get("", response_model=StorefrontProductListResponse)
def list_storefront_products(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=200),
    search: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
) -> StorefrontProductListResponse:
    query = db.query(CatalogProduct).filter(CatalogProduct.status == "published")
    if search:
        term = f"%{search.strip()}%"
        query = query.filter(
            (CatalogProduct.name.ilike(term))
            | (CatalogProduct.slug.ilike(term))
            | (CatalogProduct.brand.ilike(term))
        )
    if category:
        query = query.filter(CatalogProduct.category.ilike(category))

    total = query.count()
    rows = (
        query.order_by(CatalogProduct.updated_at.desc())
        .offset((page - 1) * per_page)
        .limit(per_page)
        .all()
    )

    return StorefrontProductListResponse(
        data=[_to_storefront_product(r) for r in rows],
        meta=StorefrontProductListMeta(count=total, page=page, per_page=per_page),
    )


@router.get("/by-slug/{slug}", response_model=StorefrontProductResponse)
def get_storefront_product_by_slug(slug: str, db: Session = Depends(get_db)) -> StorefrontProductResponse:
    row = (
        db.query(CatalogProduct)
        .filter(CatalogProduct.slug == slug, CatalogProduct.status == "published")
        .first()
    )
    if not row:
        raise HTTPException(status_code=404, detail="Product not found")
    return StorefrontProductResponse(data=_to_storefront_product(row))
