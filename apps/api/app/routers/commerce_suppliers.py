from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.deps.auth import require_write_access
from app.database import get_db
from app.models.commerce_supplier import CommerceSupplier, dump_json, load_json
from app.schemas.commerce_supplier import (
    SupplierListMeta,
    SupplierListResponse,
    SupplierRead,
    SupplierResponse,
    SupplierUpdate,
)

router = APIRouter(prefix="/suppliers", tags=["commerce-suppliers"])

DEFAULT_PERFORMANCE = {
    "onTimeDeliveryPct": 0,
    "qualityRejectRatePct": 0,
    "priceVariancePct": 0,
    "avgLeadTimeDays": 0,
}


def _to_read(row: CommerceSupplier) -> SupplierRead:
    return SupplierRead(
        id=row.id,
        company_id=row.company_id,
        vendor_code=row.vendor_code,
        name=row.name,
        email=row.email,
        phone=row.phone,
        payment_terms=row.payment_terms,
        lead_time_days=row.lead_time_days,
        rating=row.rating,
        open_pos=row.open_pos,
        spend_ytd=row.spend_ytd,
        status=row.status,
        country=row.country,
        tax_id=row.tax_id,
        website=row.website,
        currency=row.currency,
        min_order_value=row.min_order_value,
        incoterms=row.incoterms,
        buyer_name=row.buyer_name,
        contacts=load_json(row.contacts_json, []),
        addresses=load_json(row.addresses_json, []),
        contracts=load_json(row.contracts_json, []),
        bills=load_json(row.bills_json, []),
        performance=load_json(row.performance_json, DEFAULT_PERFORMANCE),
        timeline=load_json(row.timeline_json, []),
        rfq_count=row.rfq_count,
        receipt_count=row.receipt_count,
        has_stock_feed=row.has_stock_feed,
        total_pos=row.total_pos,
        notes=row.notes,
        created_at=row.created_at,
        updated_at=row.updated_at,
    )


def _append_timeline(row: CommerceSupplier, title: str, description: str = "") -> None:
    timeline = load_json(row.timeline_json, [])
    timeline.insert(
        0,
        {
            "id": f"t_{int(datetime.utcnow().timestamp() * 1000)}",
            "type": "note",
            "title": title,
            "description": description,
            "at": datetime.utcnow().isoformat(),
        },
    )
    row.timeline_json = dump_json(timeline)


@router.get("", response_model=SupplierListResponse)
def list_suppliers(
    db: Session = Depends(get_db),
    search: Optional[str] = Query(default=None),
    status: Optional[str] = Query(default=None),
) -> SupplierListResponse:
    query = db.query(CommerceSupplier).order_by(CommerceSupplier.name)

    if status:
        query = query.filter(CommerceSupplier.status == status)
    if search:
        term = f"%{search.strip().lower()}%"
        query = query.filter(
            (CommerceSupplier.name.ilike(term))
            | (CommerceSupplier.vendor_code.ilike(term))
            | (CommerceSupplier.email.ilike(term))
            | (CommerceSupplier.phone.ilike(term)),
        )

    rows = query.all()
    data = [_to_read(row) for row in rows]
    total_spend = sum(row.spend_ytd for row in rows)
    return SupplierListResponse(
        data=data,
        meta=SupplierListMeta(count=len(data), total_spend_ytd=total_spend),
    )


@router.get("/{supplier_id}", response_model=SupplierResponse)
def get_supplier(supplier_id: str, db: Session = Depends(get_db)) -> SupplierResponse:
    row = db.get(CommerceSupplier, supplier_id)
    if not row:
        raise HTTPException(status_code=404, detail="Supplier not found")
    return SupplierResponse(data=_to_read(row))


@router.patch("/{supplier_id}", response_model=SupplierResponse)
def update_supplier(
    supplier_id: str,
    payload: SupplierUpdate,
    db: Session = Depends(get_db),
    _: object = Depends(require_write_access),
) -> SupplierResponse:
    row = db.get(CommerceSupplier, supplier_id)
    if not row:
        raise HTTPException(status_code=404, detail="Supplier not found")

    updates = payload.model_dump(exclude_unset=True)
    if "status" in updates and updates["status"] != row.status:
        _append_timeline(row, f"Status changed to {updates['status']}")
    for key, value in updates.items():
        setattr(row, key, value)

    db.commit()
    db.refresh(row)
    return SupplierResponse(data=_to_read(row))
