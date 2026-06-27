from __future__ import annotations

from decimal import Decimal
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
from app.models.inventory_stock_level import InventoryStockLevel
from app.models.inventory_warehouse import InventoryWarehouse
from app.models.media import Media
from app.schemas.product import (
    ProductCreate,
    ProductDetailRead,
    ProductDetailResponse,
    ProductInventoryRead,
    ProductInventoryResponse,
    ProductInventoryUpsert,
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
    ProductSlugCheckResponse,
    ProductUpdate,
    ProductVariantBrief,
    dump_tags,
    load_tags,
)
from app.schemas.variant import VariantBulkReplace, VariantUpsert

router = APIRouter(prefix="/products", tags=["catalog-products"])


def _compute_stock_status(on_hand: int, min_qty: int, max_qty: int = 0) -> str:
    if on_hand <= 0:
        return "out_of_stock"
    if on_hand < min_qty:
        return "low_stock"
    if max_qty > 0 and on_hand > max_qty:
        return "overstock"
    return "in_stock"


def _default_variant(db: Session, product_id: str) -> Optional[CatalogProductVariant]:
    return (
        db.query(CatalogProductVariant)
        .filter(CatalogProductVariant.product_id == product_id)
        .order_by(CatalogProductVariant.is_default.desc(), CatalogProductVariant.sort_order)
        .first()
    )


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
        warranty=row.warranty,
        tags=load_tags(row.tags_json),
        custom_specs_json=row.custom_specs_json,
        created_at=row.created_at,
        updated_at=row.updated_at,
    )


def _variant_brief(variant: CatalogProductVariant, db: Optional[Session] = None) -> ProductVariantBrief:
    image_url = None
    if variant.image_id and db:
        media = db.get(Media, variant.image_id)
        image_url = media.url if media else None
    return ProductVariantBrief(
        id=variant.id,
        sku=variant.sku,
        name=variant.name,
        price=variant.price,
        stock=variant.stock,
        status=variant.status,
        is_default=variant.is_default,
        sort_order=variant.sort_order,
        image_id=variant.image_id,
        image_url=image_url,
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
    has_inventory = db.query(InventoryStockLevel).filter(
        InventoryStockLevel.product_id == row.id
    ).first() is not None
    return ProductDetailRead(
        **base,
        variants=[_variant_brief(v, db) for v in variants],
        media=[_media_brief(link, media) for link, media in media_rows],
        has_inventory=has_inventory,
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
            row = CatalogProductVariant(
                product_id=product.id,
                sku=item.sku,
                name=item.name,
                price=item.price,
                stock=item.stock,
                status=item.status,
                is_default=item.is_default,
                sort_order=item.sort_order if item.sort_order else idx,
                image_id=item.image_id,
            )
            db.add(row)
            db.flush()
            keep_ids.add(row.id)
            continue

        row.sku = item.sku
        row.name = item.name
        row.price = item.price
        row.stock = item.stock
        row.image_id = item.image_id
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
        if primary_url is None and media.media_type == "image":
            primary_url = media.url
    if primary_url is not None:
        product.thumbnail = primary_url


def _upsert_product_inventory(
    db: Session,
    product: CatalogProduct,
    variant: CatalogProductVariant,
    payload: ProductInventoryUpsert,
) -> ProductInventoryRead:
    warehouse = db.get(InventoryWarehouse, payload.warehouse_id)
    if not warehouse:
        raise HTTPException(status_code=404, detail="Warehouse not found")

    on_hand = payload.on_hand if payload.on_hand is not None else product.stock
    unit_cost = payload.unit_cost if payload.unit_cost is not None else Decimal("0")
    min_qty = payload.min_qty
    max_qty = max(on_hand * 3, 50) if on_hand > 0 else 50

    display_name = product.name
    if variant.name and variant.name != "Default":
        display_name = f"{product.name} — {variant.name}"

    row = (
        db.query(InventoryStockLevel)
        .filter(
            InventoryStockLevel.variant_id == variant.id,
            InventoryStockLevel.warehouse_id == payload.warehouse_id,
        )
        .first()
    )
    if not row:
        row = InventoryStockLevel(
            warehouse_id=payload.warehouse_id,
            variant_id=variant.id,
            product_id=product.id,
            sku=variant.sku,
            name=display_name,
        )
        db.add(row)

    row.sku = variant.sku
    row.name = display_name
    row.on_hand = on_hand
    row.min_qty = min_qty
    row.max_qty = max_qty
    row.unit_cost = unit_cost
    row.thumbnail = product.thumbnail
    row.status = _compute_stock_status(on_hand, min_qty, max_qty)
    db.flush()

    return ProductInventoryRead(
        id=row.id,
        warehouse_id=row.warehouse_id,
        warehouse_name=warehouse.name,
        variant_id=row.variant_id,
        on_hand=row.on_hand,
        min_qty=row.min_qty,
        unit_cost=row.unit_cost,
    )


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


@router.get("/slug/check", response_model=ProductSlugCheckResponse)
def check_product_slug(
    slug: str = Query(..., min_length=1),
    exclude_id: Optional[str] = Query(default=None),
    db: Session = Depends(get_db),
) -> ProductSlugCheckResponse:
    normalized = slug.strip().lower()
    if not normalized:
        return ProductSlugCheckResponse(slug=normalized, available=False, message="Slug is required")

    query = db.query(CatalogProduct).filter(CatalogProduct.slug == normalized)
    if exclude_id:
        query = query.filter(CatalogProduct.id != exclude_id)
    taken = query.first()
    if taken:
        return ProductSlugCheckResponse(
            slug=normalized,
            available=False,
            message="This URL is already in use",
        )
    return ProductSlugCheckResponse(slug=normalized, available=True)


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


@router.get("/{product_id}/inventory", response_model=ProductInventoryResponse)
def get_product_inventory(product_id: str, db: Session = Depends(get_db)) -> ProductInventoryResponse:
    row = db.get(CatalogProduct, product_id)
    if not row:
        raise HTTPException(status_code=404, detail="Product not found")

    stock_row = (
        db.query(InventoryStockLevel, InventoryWarehouse.name)
        .join(InventoryWarehouse, InventoryStockLevel.warehouse_id == InventoryWarehouse.id)
        .filter(InventoryStockLevel.product_id == product_id)
        .order_by(InventoryStockLevel.updated_at.desc())
        .first()
    )
    if not stock_row:
        raise HTTPException(status_code=404, detail="Inventory record not found for product")

    stock, warehouse_name = stock_row
    return ProductInventoryResponse(
        data=ProductInventoryRead(
            id=stock.id,
            warehouse_id=stock.warehouse_id,
            warehouse_name=warehouse_name,
            variant_id=stock.variant_id,
            on_hand=stock.on_hand,
            min_qty=stock.min_qty,
            unit_cost=stock.unit_cost,
        ),
    )


@router.put("/{product_id}/inventory", response_model=ProductInventoryResponse)
def upsert_product_inventory(
    product_id: str,
    payload: ProductInventoryUpsert,
    db: Session = Depends(get_db),
    _: object = Depends(require_write_access),
) -> ProductInventoryResponse:
    row = db.get(CatalogProduct, product_id)
    if not row:
        raise HTTPException(status_code=404, detail="Product not found")

    variant = _default_variant(db, product_id)
    if not variant:
        raise HTTPException(status_code=400, detail="Product has no variant to track inventory")

    data = _upsert_product_inventory(db, row, variant, payload)
    db.commit()
    return ProductInventoryResponse(data=data)


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
