from __future__ import annotations

from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.deps.auth import require_write_access
from app.database import get_db
from app.models.catalog_brand import CatalogBrand
from app.models.catalog_category import CatalogCategory
from app.models.catalog_product import CatalogProduct
from app.models.catalog_product_attribute_value import CatalogProductAttributeValue
from app.models.catalog_product_media import CatalogProductMedia
from app.models.catalog_product_variant import CatalogProductVariant
from app.models.catalog_attribute import CatalogAttribute
from app.models.media import Media
from app.schemas.product import (
    ProductCreate,
    ProductDetailRead,
    ProductDetailResponse,
    ProductListMeta,
    ProductListResponse,
    ProductMediaBrief,
    ProductMediaReplace,
    ProductRead,
    ProductResponse,
    ProductSpecsRead,
    ProductSpecsReplace,
    ProductSpecsResponse,
    ProductSpecValueRead,
    ProductUpdate,
    ProductVariantBrief,
    dump_tags,
    load_tags,
)
from app.schemas.variant import VariantBulkReplace, VariantUpsert

router = APIRouter(prefix="/products", tags=["catalog-products"])


def _resolve_brand_category(db: Session, data: dict) -> dict:
    """Resolve brand_id/category_id from names when IDs omitted (AgainERP denorm pattern)."""
    out = dict(data)
    category_id = out.get("category_id")
    category_name = out.get("category")
    if category_id:
        cat = db.get(CatalogCategory, category_id)
        if cat:
            out["category"] = cat.name
    elif category_name:
        cat = db.query(CatalogCategory).filter(CatalogCategory.name == category_name).first()
        if cat:
            out["category_id"] = cat.id

    brand_id = out.get("brand_id")
    brand_name = out.get("brand")
    if brand_id:
        brand = db.get(CatalogBrand, brand_id)
        if brand:
            out["brand"] = brand.name
    elif brand_name:
        brand = db.query(CatalogBrand).filter(CatalogBrand.name == brand_name).first()
        if brand:
            out["brand_id"] = brand.id
    return out


def _product_read(row: CatalogProduct) -> ProductRead:
    return ProductRead(
        id=row.id,
        company_id=row.company_id,
        name=row.name,
        slug=row.slug,
        sku=row.sku,
        description=row.description,
        short_description=row.short_description,
        price=row.price,
        compare_at_price=row.compare_at_price,
        stock=row.stock,
        status=row.status,
        product_type=row.product_type,
        visibility=row.visibility,
        brand=row.brand,
        category=row.category,
        brand_id=row.brand_id,
        category_id=row.category_id,
        attribute_profile_id=row.attribute_profile_id,
        thumbnail=row.thumbnail,
        seo_title=row.seo_title,
        seo_description=row.seo_description,
        tags=load_tags(row.tags_json),
        created_at=row.created_at,
        updated_at=row.updated_at,
    )


def _variant_brief(variant: CatalogProductVariant) -> ProductVariantBrief:
    return ProductVariantBrief(
        id=variant.id,
        sku=variant.sku,
        name=variant.name,
        price=variant.price,
        stock=variant.stock,
        status=variant.status,
        is_default=variant.is_default,
        sort_order=variant.sort_order,
    )


def _media_brief(link: CatalogProductMedia, media: Media) -> ProductMediaBrief:
    return ProductMediaBrief(
        id=link.id,
        media_id=media.id,
        url=media.url,
        name=media.name,
        media_type=media.media_type,
        sort_order=link.sort_order,
        is_primary=link.is_primary,
    )


def _product_detail(db: Session, row: CatalogProduct) -> ProductDetailRead:
    base = _product_read(row).model_dump()
    variants = (
        db.query(CatalogProductVariant)
        .filter(CatalogProductVariant.product_id == row.id)
        .order_by(CatalogProductVariant.sort_order, CatalogProductVariant.created_at)
        .all()
    )
    media_rows = (
        db.query(CatalogProductMedia, Media)
        .join(Media, Media.id == CatalogProductMedia.media_id)
        .filter(CatalogProductMedia.product_id == row.id)
        .order_by(CatalogProductMedia.sort_order, CatalogProductMedia.created_at)
        .all()
    )
    return ProductDetailRead(
        **base,
        variants=[_variant_brief(v) for v in variants],
        media=[_media_brief(link, media) for link, media in media_rows],
    )


def _apply_create_payload(payload: ProductCreate) -> dict:
    data = payload.model_dump()
    tags = data.pop("tags", [])
    data["tags_json"] = dump_tags(tags)
    return data


def _apply_update_payload(payload: ProductUpdate) -> dict:
    data = payload.model_dump(exclude_unset=True)
    if "tags" in data:
        data["tags_json"] = dump_tags(data.pop("tags"))
    return data


def _ensure_default_variant(db: Session, product: CatalogProduct) -> None:
    existing = (
        db.query(CatalogProductVariant)
        .filter(CatalogProductVariant.product_id == product.id)
        .first()
    )
    if existing:
        return
    db.add(
        CatalogProductVariant(
            product_id=product.id,
            sku=product.sku,
            name="Default",
            price=product.price,
            stock=product.stock,
            status=product.status,
            is_default=True,
            sort_order=0,
        ),
    )


def _replace_variants(
    db: Session,
    product: CatalogProduct,
    variants: List[VariantUpsert],
) -> None:
    existing = {
        v.id: v
        for v in db.query(CatalogProductVariant)
        .filter(CatalogProductVariant.product_id == product.id)
        .all()
    }
    keep_ids: set[str] = set()

    if not variants and product.product_type == "simple":
        _ensure_default_variant(db, product)
        return

    for idx, item in enumerate(variants):
        if item.id and item.id in existing:
            row = existing[item.id]
            keep_ids.add(row.id)
        else:
            row = CatalogProductVariant(product_id=product.id)
            db.add(row)
            db.flush()
            keep_ids.add(row.id)

        row.sku = item.sku
        row.name = item.name
        row.price = item.price
        row.stock = item.stock
        row.status = item.status
        row.is_default = item.is_default
        row.sort_order = item.sort_order if item.sort_order else idx

    for vid, row in existing.items():
        if vid not in keep_ids:
            db.delete(row)

    if variants and not any(v.is_default for v in variants):
        first = (
            db.query(CatalogProductVariant)
            .filter(CatalogProductVariant.product_id == product.id)
            .order_by(CatalogProductVariant.sort_order)
            .first()
        )
        if first:
            first.is_default = True


def _replace_media(db: Session, product: CatalogProduct, media_ids: List[str]) -> None:
    db.query(CatalogProductMedia).filter(CatalogProductMedia.product_id == product.id).delete()
    primary_url: Optional[str] = None
    for idx, media_id in enumerate(media_ids):
        media = db.get(Media, media_id)
        if not media:
            continue
        db.add(
            CatalogProductMedia(
                product_id=product.id,
                media_id=media_id,
                sort_order=idx,
                is_primary=idx == 0,
            ),
        )
        if idx == 0 and media.media_type == "image":
            primary_url = media.url
    if primary_url:
        product.thumbnail = primary_url


def _load_product_specs(db: Session, product: CatalogProduct) -> ProductSpecsRead:
    rows = (
        db.query(CatalogProductAttributeValue, CatalogAttribute)
        .join(CatalogAttribute, CatalogAttribute.id == CatalogProductAttributeValue.attribute_id)
        .filter(CatalogProductAttributeValue.product_id == product.id)
        .order_by(CatalogAttribute.sort_order)
        .all()
    )
    return ProductSpecsRead(
        attribute_profile_id=product.attribute_profile_id,
        values=[
            ProductSpecValueRead(
                attribute_id=attr.id,
                attribute_code=attr.code,
                attribute_name=attr.name,
                value=val.value,
            )
            for val, attr in rows
        ],
    )


def _replace_product_specs(db: Session, product: CatalogProduct, payload: ProductSpecsReplace) -> None:
    if payload.attribute_profile_id is not None:
        product.attribute_profile_id = payload.attribute_profile_id or None

    db.query(CatalogProductAttributeValue).filter(
        CatalogProductAttributeValue.product_id == product.id,
    ).delete()

    for item in payload.values:
        if not item.attribute_id:
            continue
        attr = db.get(CatalogAttribute, item.attribute_id)
        if not attr:
            continue
        db.add(
            CatalogProductAttributeValue(
                product_id=product.id,
                attribute_id=item.attribute_id,
                value=item.value or "",
            ),
        )


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
        data=[_product_read(r) for r in rows],
        meta=ProductListMeta(count=total, page=page, per_page=per_page),
    )


@router.get("/{product_id}", response_model=ProductDetailResponse)
def get_product(product_id: str, db: Session = Depends(get_db)) -> ProductDetailResponse:
    row = db.get(CatalogProduct, product_id)
    if not row:
        raise HTTPException(status_code=404, detail="Product not found")
    return ProductDetailResponse(data=_product_detail(db, row))


@router.post("", response_model=ProductDetailResponse, status_code=201)
def create_product(
    payload: ProductCreate,
    db: Session = Depends(get_db),
    _: object = Depends(require_write_access),
) -> ProductDetailResponse:
    existing = (
        db.query(CatalogProduct)
        .filter(
            (CatalogProduct.slug == payload.slug) | (CatalogProduct.sku == payload.sku),
        )
        .first()
    )
    if existing:
        raise HTTPException(status_code=409, detail="Product slug or SKU already exists")

    data = _resolve_brand_category(db, _apply_create_payload(payload))
    row = CatalogProduct(**data)
    db.add(row)
    db.flush()
    _ensure_default_variant(db, row)
    db.commit()
    db.refresh(row)
    return ProductDetailResponse(data=_product_detail(db, row))


@router.patch("/{product_id}", response_model=ProductDetailResponse)
def update_product(
    product_id: str,
    payload: ProductUpdate,
    db: Session = Depends(get_db),
    _: object = Depends(require_write_access),
) -> ProductDetailResponse:
    row = db.get(CatalogProduct, product_id)
    if not row:
        raise HTTPException(status_code=404, detail="Product not found")

    changes = _resolve_brand_category(db, _apply_update_payload(payload))
    if not changes:
        return ProductDetailResponse(data=_product_detail(db, row))

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

    if row.product_type == "simple":
        default = (
            db.query(CatalogProductVariant)
            .filter(
                CatalogProductVariant.product_id == row.id,
                CatalogProductVariant.is_default.is_(True),
            )
            .first()
        )
        if default:
            if "sku" in changes:
                default.sku = row.sku
            if "price" in changes:
                default.price = row.price
            if "stock" in changes:
                default.stock = row.stock
            if "status" in changes:
                default.status = row.status

    db.commit()
    db.refresh(row)
    return ProductDetailResponse(data=_product_detail(db, row))


@router.put("/{product_id}/variants", response_model=ProductDetailResponse)
def replace_product_variants(
    product_id: str,
    payload: VariantBulkReplace,
    db: Session = Depends(get_db),
    _: object = Depends(require_write_access),
) -> ProductDetailResponse:
    row = db.get(CatalogProduct, product_id)
    if not row:
        raise HTTPException(status_code=404, detail="Product not found")

    skus = [v.sku for v in payload.variants]
    if len(skus) != len(set(skus)):
        raise HTTPException(status_code=400, detail="Duplicate variant SKUs in payload")

    for item in payload.variants:
        taken = (
            db.query(CatalogProductVariant)
            .filter(
                CatalogProductVariant.sku == item.sku,
                CatalogProductVariant.product_id != product_id,
                CatalogProductVariant.id != (item.id or ""),
            )
            .first()
        )
        if taken:
            raise HTTPException(status_code=409, detail=f"Variant SKU already in use: {item.sku}")

    _replace_variants(db, row, payload.variants)
    db.commit()
    db.refresh(row)
    return ProductDetailResponse(data=_product_detail(db, row))


@router.put("/{product_id}/media", response_model=ProductDetailResponse)
def replace_product_media(
    product_id: str,
    payload: ProductMediaReplace,
    db: Session = Depends(get_db),
    _: object = Depends(require_write_access),
) -> ProductDetailResponse:
    row = db.get(CatalogProduct, product_id)
    if not row:
        raise HTTPException(status_code=404, detail="Product not found")

    _replace_media(db, row, payload.media_ids)
    db.commit()
    db.refresh(row)
    return ProductDetailResponse(data=_product_detail(db, row))


@router.get("/{product_id}/specs", response_model=ProductSpecsResponse)
def get_product_specs(product_id: str, db: Session = Depends(get_db)) -> ProductSpecsResponse:
    row = db.get(CatalogProduct, product_id)
    if not row:
        raise HTTPException(status_code=404, detail="Product not found")
    return ProductSpecsResponse(data=_load_product_specs(db, row))


@router.put("/{product_id}/specs", response_model=ProductSpecsResponse)
def replace_product_specs(
    product_id: str,
    payload: ProductSpecsReplace,
    db: Session = Depends(get_db),
    _: object = Depends(require_write_access),
) -> ProductSpecsResponse:
    row = db.get(CatalogProduct, product_id)
    if not row:
        raise HTTPException(status_code=404, detail="Product not found")
    _replace_product_specs(db, row, payload)
    db.commit()
    db.refresh(row)
    return ProductSpecsResponse(data=_load_product_specs(db, row))


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
