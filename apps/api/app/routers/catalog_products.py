from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.deps.auth import require_write_access
from app.database import get_db
from app.models.catalog_product import CatalogProduct
from app.schemas.product import (
    ProductCreate,
    ProductListMeta,
    ProductListResponse,
    ProductRead,
    ProductResponse,
    ProductUpdate,
)

router = APIRouter(prefix="/products", tags=["catalog-products"])


@router.get("", response_model=ProductListResponse)
def list_products(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=200),
    status: Optional[str] = Query(None),
) -> ProductListResponse:
    query = db.query(CatalogProduct)
    if status:
        query = query.filter(CatalogProduct.status == status)

    total = query.count()
    rows = (
        query.order_by(CatalogProduct.updated_at.desc())
        .offset((page - 1) * per_page)
        .limit(per_page)
        .all()
    )

    return ProductListResponse(
        data=[ProductRead.model_validate(r) for r in rows],
        meta=ProductListMeta(count=total, page=page, per_page=per_page),
    )


@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: str, db: Session = Depends(get_db)) -> ProductResponse:
    row = db.get(CatalogProduct, product_id)
    if not row:
        raise HTTPException(status_code=404, detail="Product not found")
    return ProductResponse(data=ProductRead.model_validate(row))


@router.post("", response_model=ProductResponse, status_code=201)
def create_product(
    payload: ProductCreate,
    db: Session = Depends(get_db),
    _: object = Depends(require_write_access),
) -> ProductResponse:
    existing = (
        db.query(CatalogProduct)
        .filter(
            (CatalogProduct.slug == payload.slug) | (CatalogProduct.sku == payload.sku),
        )
        .first()
    )
    if existing:
        raise HTTPException(status_code=409, detail="Product slug or SKU already exists")

    row = CatalogProduct(**payload.model_dump())
    db.add(row)
    db.commit()
    db.refresh(row)
    return ProductResponse(data=ProductRead.model_validate(row))


@router.patch("/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: str,
    payload: ProductUpdate,
    db: Session = Depends(get_db),
    _: object = Depends(require_write_access),
) -> ProductResponse:
    row = db.get(CatalogProduct, product_id)
    if not row:
        raise HTTPException(status_code=404, detail="Product not found")

    changes = payload.model_dump(exclude_unset=True)
    if not changes:
        return ProductResponse(data=ProductRead.model_validate(row))

    slug = changes.get("slug", row.slug)
    sku = changes.get("sku", row.sku)
    conflict = (
        db.query(CatalogProduct)
        .filter(
            CatalogProduct.id != product_id,
            (CatalogProduct.slug == slug) | (CatalogProduct.sku == sku),
        )
        .first()
    )
    if conflict:
        raise HTTPException(status_code=409, detail="Product slug or SKU already exists")

    for key, value in changes.items():
        setattr(row, key, value)

    db.commit()
    db.refresh(row)
    return ProductResponse(data=ProductRead.model_validate(row))


@router.delete("/{product_id}", status_code=204)
def delete_product(
    product_id: str,
    db: Session = Depends(get_db),
    _: object = Depends(require_write_access),
) -> None:
    row = db.get(CatalogProduct, product_id)
    if not row:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(row)
    db.commit()
