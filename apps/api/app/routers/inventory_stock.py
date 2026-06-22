from __future__ import annotations

from decimal import Decimal
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.deps.auth import require_write_access
from app.database import get_db
from app.models.catalog_product import CatalogProduct
from app.models.catalog_product_variant import CatalogProductVariant
from app.models.inventory_stock_level import InventoryStockLevel
from app.models.inventory_warehouse import InventoryWarehouse
from app.schemas.inventory_stock import (
    StockLevelRead,
    StockLevelUpdate,
    StockListMeta,
    StockListResponse,
    StockResponse,
)

router = APIRouter(prefix="/stock", tags=["inventory-stock"])


def compute_stock_status(on_hand: int, min_qty: int, max_qty: int) -> str:
    if on_hand <= 0:
        return "out_of_stock"
    if on_hand < min_qty:
        return "low_stock"
    if max_qty > 0 and on_hand > max_qty:
        return "overstock"
    return "in_stock"


def _to_read(row: InventoryStockLevel, warehouse_name: str) -> StockLevelRead:
    available = max(row.on_hand - row.reserved, 0)
    return StockLevelRead(
        id=row.id,
        company_id=row.company_id,
        warehouse_id=row.warehouse_id,
        warehouse_name=warehouse_name,
        variant_id=row.variant_id,
        product_id=row.product_id,
        sku=row.sku,
        name=row.name,
        on_hand=row.on_hand,
        reserved=row.reserved,
        available=available,
        incoming=row.incoming,
        min_qty=row.min_qty,
        max_qty=row.max_qty,
        unit_cost=row.unit_cost,
        status=row.status,
        thumbnail=row.thumbnail,
        created_at=row.created_at,
        updated_at=row.updated_at,
    )


def _apply_status(row: InventoryStockLevel) -> None:
    row.status = compute_stock_status(row.on_hand, row.min_qty, row.max_qty)


@router.get("", response_model=StockListResponse)
def list_stock(
    db: Session = Depends(get_db),
    search: Optional[str] = Query(default=None),
    warehouse_id: Optional[str] = Query(default=None),
    warehouse: Optional[str] = Query(default=None),
    status: Optional[str] = Query(default=None),
) -> StockListResponse:
    query = (
        db.query(InventoryStockLevel, InventoryWarehouse.name)
        .join(InventoryWarehouse, InventoryStockLevel.warehouse_id == InventoryWarehouse.id)
        .order_by(InventoryStockLevel.sku, InventoryWarehouse.name)
    )

    if warehouse_id:
        query = query.filter(InventoryStockLevel.warehouse_id == warehouse_id)
    if warehouse:
        query = query.filter(InventoryWarehouse.name == warehouse)
    if status:
        query = query.filter(InventoryStockLevel.status == status)
    if search:
        term = f"%{search.strip().lower()}%"
        query = query.filter(
            (InventoryStockLevel.sku.ilike(term)) | (InventoryStockLevel.name.ilike(term)),
        )

    rows = query.all()
    data = [_to_read(stock, wh_name) for stock, wh_name in rows]
    total_units = sum(item.on_hand for item in data)
    total_value = sum(Decimal(item.on_hand) * item.unit_cost for item in data)

    return StockListResponse(
        data=data,
        meta=StockListMeta(
            count=len(data),
            total_units=total_units,
            total_value=total_value,
        ),
    )


@router.get("/{stock_id}", response_model=StockResponse)
def get_stock(stock_id: str, db: Session = Depends(get_db)) -> StockResponse:
    row = (
        db.query(InventoryStockLevel, InventoryWarehouse.name)
        .join(InventoryWarehouse, InventoryStockLevel.warehouse_id == InventoryWarehouse.id)
        .filter(InventoryStockLevel.id == stock_id)
        .first()
    )
    if not row:
        raise HTTPException(status_code=404, detail="Stock level not found")
    stock, wh_name = row
    return StockResponse(data=_to_read(stock, wh_name))


@router.patch("/{stock_id}", response_model=StockResponse)
def update_stock(
    stock_id: str,
    payload: StockLevelUpdate,
    db: Session = Depends(get_db),
    _: object = Depends(require_write_access),
) -> StockResponse:
    row = (
        db.query(InventoryStockLevel, InventoryWarehouse.name)
        .join(InventoryWarehouse, InventoryStockLevel.warehouse_id == InventoryWarehouse.id)
        .filter(InventoryStockLevel.id == stock_id)
        .first()
    )
    if not row:
        raise HTTPException(status_code=404, detail="Stock level not found")

    stock, wh_name = row
    updates = payload.model_dump(exclude_unset=True)
    for key, value in updates.items():
        setattr(stock, key, value)

    if stock.reserved > stock.on_hand:
        raise HTTPException(status_code=400, detail="Reserved quantity cannot exceed on-hand")

    _apply_status(stock)
    db.commit()
    db.refresh(stock)
    return StockResponse(data=_to_read(stock, wh_name))
