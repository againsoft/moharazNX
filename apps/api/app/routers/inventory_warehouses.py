from __future__ import annotations

from typing import Dict, List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.deps.auth import require_write_access
from app.database import get_db
from app.models.inventory_stock_level import InventoryStockLevel
from app.models.inventory_warehouse import InventoryWarehouse
from app.schemas.inventory_warehouse import (
    WarehouseCreate,
    WarehouseListMeta,
    WarehouseListResponse,
    WarehouseRead,
    WarehouseResponse,
    WarehouseUpdate,
)

router = APIRouter(prefix="/warehouses", tags=["inventory-warehouses"])


def _total_units_by_warehouse(db: Session) -> Dict[str, int]:
    rows = (
        db.query(
            InventoryStockLevel.warehouse_id,
            func.coalesce(func.sum(InventoryStockLevel.on_hand), 0),
        )
        .group_by(InventoryStockLevel.warehouse_id)
        .all()
    )
    return {warehouse_id: int(total or 0) for warehouse_id, total in rows}


def _to_read(row: InventoryWarehouse, totals: Dict[str, int]) -> WarehouseRead:
    data = WarehouseRead.model_validate(row)
    data.total_units = totals.get(row.id, 0)
    return data


@router.get("", response_model=WarehouseListResponse)
def list_warehouses(db: Session = Depends(get_db)) -> WarehouseListResponse:
    rows = (
        db.query(InventoryWarehouse)
        .order_by(InventoryWarehouse.sort_order, InventoryWarehouse.name)
        .all()
    )
    totals = _total_units_by_warehouse(db)
    data = [_to_read(r, totals) for r in rows]
    return WarehouseListResponse(data=data, meta=WarehouseListMeta(count=len(data)))


@router.get("/{warehouse_id}", response_model=WarehouseResponse)
def get_warehouse(warehouse_id: str, db: Session = Depends(get_db)) -> WarehouseResponse:
    row = db.get(InventoryWarehouse, warehouse_id)
    if not row:
        raise HTTPException(status_code=404, detail="Warehouse not found")
    totals = _total_units_by_warehouse(db)
    return WarehouseResponse(data=_to_read(row, totals))


@router.post("", response_model=WarehouseResponse, status_code=201)
def create_warehouse(
    payload: WarehouseCreate,
    db: Session = Depends(get_db),
    _: object = Depends(require_write_access),
) -> WarehouseResponse:
    existing = db.query(InventoryWarehouse).filter(InventoryWarehouse.code == payload.code).first()
    if existing:
        raise HTTPException(status_code=409, detail="Warehouse code already exists")

    row = InventoryWarehouse(**payload.model_dump())
    db.add(row)
    db.commit()
    db.refresh(row)
    totals = _total_units_by_warehouse(db)
    return WarehouseResponse(data=_to_read(row, totals))


@router.patch("/{warehouse_id}", response_model=WarehouseResponse)
def update_warehouse(
    warehouse_id: str,
    payload: WarehouseUpdate,
    db: Session = Depends(get_db),
    _: object = Depends(require_write_access),
) -> WarehouseResponse:
    row = db.get(InventoryWarehouse, warehouse_id)
    if not row:
        raise HTTPException(status_code=404, detail="Warehouse not found")

    updates = payload.model_dump(exclude_unset=True)
    if "code" in updates:
        conflict = (
            db.query(InventoryWarehouse)
            .filter(InventoryWarehouse.code == updates["code"], InventoryWarehouse.id != warehouse_id)
            .first()
        )
        if conflict:
            raise HTTPException(status_code=409, detail="Warehouse code already exists")

    for key, value in updates.items():
        setattr(row, key, value)

    db.commit()
    db.refresh(row)
    totals = _total_units_by_warehouse(db)
    return WarehouseResponse(data=_to_read(row, totals))
