from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.deps.auth import require_write_access
from app.database import get_db
from app.models.commerce_order import CommerceOrder, dump_json, load_json
from app.models.commerce_order_item import CommerceOrderItem
from app.schemas.commerce_order import (
    OrderItemRead,
    OrderListMeta,
    OrderListResponse,
    OrderRead,
    OrderResponse,
    OrderUpdate,
)

router = APIRouter(prefix="/orders", tags=["commerce-orders"])


def _items_for_order(db: Session, order_id: str) -> List[CommerceOrderItem]:
    return (
        db.query(CommerceOrderItem)
        .filter(CommerceOrderItem.order_id == order_id)
        .order_by(CommerceOrderItem.sort_order, CommerceOrderItem.name)
        .all()
    )


def _item_to_read(row: CommerceOrderItem) -> OrderItemRead:
    return OrderItemRead.model_validate(row)


def _to_read(row: CommerceOrder, items: List[CommerceOrderItem]) -> OrderRead:
    item_reads = [_item_to_read(i) for i in items]
    qty_total = sum(i.quantity for i in items)
    return OrderRead(
        id=row.id,
        company_id=row.company_id,
        order_number=row.order_number,
        order_date=row.order_date,
        status=row.status,
        payment_status=row.payment_status,
        shipment_status=row.shipment_status,
        source=row.source,
        branch=row.branch,
        assigned_staff=row.assigned_staff,
        priority=row.priority,
        tags=load_json(row.tags_json, []),
        customer_id=row.customer_id,
        customer_name=row.customer_name,
        customer_phone=row.customer_phone,
        customer_email=row.customer_email,
        customer_group=row.customer_group,
        customer_lifetime_value=row.customer_lifetime_value,
        customer_order_count=row.customer_order_count,
        customer_risk_score=row.customer_risk_score,
        billing_address=row.billing_address,
        billing_city=row.billing_city,
        billing_region=row.billing_region,
        billing_country=row.billing_country,
        shipping_address=row.shipping_address,
        shipping_city=row.shipping_city,
        shipping_region=row.shipping_region,
        shipping_country=row.shipping_country,
        payment_method=row.payment_method,
        payment_transaction_id=row.payment_transaction_id,
        paid_amount=row.paid_amount,
        due_amount=row.due_amount,
        refund_amount=row.refund_amount,
        courier=row.courier,
        tracking_number=row.tracking_number,
        tracking_url=row.tracking_url,
        shipping_cost=row.shipping_cost,
        shipped_at=row.shipped_at,
        delivered_at=row.delivered_at,
        subtotal=row.subtotal,
        discount_amount=row.discount_amount,
        tax_amount=row.tax_amount,
        shipping_amount=row.shipping_amount,
        grand_total=row.grand_total,
        notes=row.notes,
        ai_risk=row.ai_risk,
        ai_summary=row.ai_summary,
        timeline=load_json(row.timeline_json, []),
        activities=load_json(row.activities_json, []),
        comments=load_json(row.comments_json, []),
        attachments=load_json(row.attachments_json, []),
        payment_timeline=load_json(row.payment_timeline_json, []),
        ai_insights=load_json(row.ai_insights_json, {}),
        followers=load_json(row.followers_json, []),
        items=item_reads,
        item_count=qty_total,
        created_at=row.created_at,
        updated_at=row.updated_at,
    )


def _append_timeline(row: CommerceOrder, title: str, actor: str = "System") -> None:
    timeline = load_json(row.timeline_json, [])
    timeline.insert(
        0,
        {
            "id": f"t_{int(datetime.utcnow().timestamp() * 1000)}",
            "type": "status",
            "title": title,
            "actor": actor,
            "actorInitials": "".join(part[0] for part in actor.split()[:2]).upper() or "SY",
            "at": datetime.utcnow().isoformat() + "Z",
        },
    )
    row.timeline_json = dump_json(timeline)


@router.get("", response_model=OrderListResponse)
def list_orders(
    db: Session = Depends(get_db),
    search: Optional[str] = Query(default=None),
    status: Optional[str] = Query(default=None),
    payment_status: Optional[str] = Query(default=None),
    branch: Optional[str] = Query(default=None),
) -> OrderListResponse:
    query = db.query(CommerceOrder).order_by(CommerceOrder.order_date.desc())

    if status:
        query = query.filter(CommerceOrder.status == status)
    if payment_status:
        query = query.filter(CommerceOrder.payment_status == payment_status)
    if branch:
        query = query.filter(CommerceOrder.branch == branch)
    if search:
        term = f"%{search.strip().lower()}%"
        query = query.filter(
            (CommerceOrder.order_number.ilike(term))
            | (CommerceOrder.customer_name.ilike(term))
            | (CommerceOrder.customer_phone.ilike(term))
            | (CommerceOrder.customer_email.ilike(term)),
        )

    rows = query.all()
    data: List[OrderRead] = []
    total_revenue = Decimal("0")
    for row in rows:
        items = _items_for_order(db, row.id)
        read = _to_read(row, items)
        data.append(read)
        total_revenue += row.grand_total

    return OrderListResponse(
        data=data,
        meta=OrderListMeta(count=len(data), total_revenue=total_revenue),
    )


@router.get("/{order_id}", response_model=OrderResponse)
def get_order(order_id: str, db: Session = Depends(get_db)) -> OrderResponse:
    row = db.get(CommerceOrder, order_id)
    if not row:
        raise HTTPException(status_code=404, detail="Order not found")
    items = _items_for_order(db, row.id)
    return OrderResponse(data=_to_read(row, items))


@router.patch("/{order_id}", response_model=OrderResponse)
def update_order(
    order_id: str,
    payload: OrderUpdate,
    db: Session = Depends(get_db),
    _: object = Depends(require_write_access),
) -> OrderResponse:
    row = db.get(CommerceOrder, order_id)
    if not row:
        raise HTTPException(status_code=404, detail="Order not found")

    updates = payload.model_dump(exclude_unset=True)
    if "status" in updates and updates["status"] != row.status:
        _append_timeline(row, f"Status changed to {updates['status']}", actor="Admin")
    for key, value in updates.items():
        setattr(row, key, value)

    db.commit()
    db.refresh(row)
    items = _items_for_order(db, row.id)
    return OrderResponse(data=_to_read(row, items))
