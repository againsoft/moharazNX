from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.deps.auth import require_write_access
from app.database import get_db
from app.models.commerce_customer import CommerceCustomer, dump_json, load_json
from app.models.commerce_order import CommerceOrder
from app.schemas.commerce_customer import (
    CustomerListMeta,
    CustomerListResponse,
    CustomerRead,
    CustomerResponse,
    CustomerUpdate,
)

router = APIRouter(prefix="/customers", tags=["commerce-customers"])


def _recent_orders(db: Session, row: CommerceCustomer) -> List[dict]:
    phone_digits = "".join(ch for ch in row.phone if ch.isdigit())[-10:]
    filters = [
        CommerceOrder.customer_id == row.id,
        CommerceOrder.customer_email.ilike(row.email),
    ]
    if phone_digits:
        filters.append(CommerceOrder.customer_phone.ilike(f"%{phone_digits}%"))
    orders = (
        db.query(CommerceOrder)
        .filter(or_(*filters))
        .order_by(CommerceOrder.order_date.desc())
        .limit(5)
        .all()
    )
    return [
        {
            "id": order.id,
            "orderNumber": order.order_number if order.order_number.startswith("#") else f"#{order.order_number}",
            "date": order.order_date.strftime("%Y-%m-%d"),
            "amount": float(order.grand_total),
            "status": order.status,
            "paymentStatus": order.payment_status,
        }
        for order in orders
    ]


def _to_read(db: Session, row: CommerceCustomer, include_recent: bool = True) -> CustomerRead:
    recent = _recent_orders(db, row) if include_recent else []
    return CustomerRead(
        id=row.id,
        company_id=row.company_id,
        customer_code=row.customer_code,
        name=row.name,
        phone=row.phone,
        email=row.email,
        profile_image=row.profile_image,
        group=row.group,
        status=row.status,
        loyalty_tier=row.loyalty_tier,
        city=row.city,
        region=row.region,
        country=row.country,
        customer_since=row.customer_since,
        last_order_date=row.last_order_date,
        assigned_staff=row.assigned_staff,
        tags=load_json(row.tags_json, []),
        total_orders=row.total_orders,
        total_spend=row.total_spend,
        avg_order_value=row.avg_order_value,
        return_rate=row.return_rate,
        reward_points=row.reward_points,
        wallet_balance=row.wallet_balance,
        risk_score=row.risk_score,
        risk_level=row.risk_level,
        notes=row.notes,
        addresses=load_json(row.addresses_json, []),
        recent_orders=recent,
        wallet_transactions=load_json(row.wallet_transactions_json, []),
        reward_events=load_json(row.reward_events_json, []),
        timeline=load_json(row.timeline_json, []),
        comments=load_json(row.comments_json, []),
        activities=load_json(row.activities_json, []),
        attachments=load_json(row.attachments_json, []),
        ai_insights=load_json(row.ai_insights_json, {}),
        created_at=row.created_at,
        updated_at=row.updated_at,
    )


def _append_timeline(row: CommerceCustomer, title: str, actor: str = "Admin") -> None:
    timeline = load_json(row.timeline_json, [])
    timeline.insert(
        0,
        {
            "id": f"tl_{int(datetime.utcnow().timestamp() * 1000)}",
            "type": "status_change",
            "title": title,
            "actor": actor,
            "actorInitials": "".join(part[0] for part in actor.split()[:2]).upper() or "AD",
            "at": datetime.utcnow().isoformat() + "Z",
        },
    )
    row.timeline_json = dump_json(timeline)


@router.get("", response_model=CustomerListResponse)
def list_customers(
    db: Session = Depends(get_db),
    search: Optional[str] = Query(default=None),
    status: Optional[str] = Query(default=None),
    group: Optional[str] = Query(default=None),
    city: Optional[str] = Query(default=None),
) -> CustomerListResponse:
    query = db.query(CommerceCustomer).order_by(CommerceCustomer.name)

    if status:
        query = query.filter(CommerceCustomer.status == status)
    if group:
        query = query.filter(CommerceCustomer.group == group)
    if city:
        query = query.filter(CommerceCustomer.city == city)
    if search:
        term = f"%{search.strip().lower()}%"
        query = query.filter(
            (CommerceCustomer.name.ilike(term))
            | (CommerceCustomer.phone.ilike(term))
            | (CommerceCustomer.email.ilike(term))
            | (CommerceCustomer.customer_code.ilike(term)),
        )

    rows = query.all()
    data = [_to_read(db, row, include_recent=False) for row in rows]
    total_spend = sum(row.total_spend for row in rows)
    return CustomerListResponse(
        data=data,
        meta=CustomerListMeta(count=len(data), total_spend=total_spend),
    )


@router.get("/{customer_id}", response_model=CustomerResponse)
def get_customer(customer_id: str, db: Session = Depends(get_db)) -> CustomerResponse:
    row = db.get(CommerceCustomer, customer_id)
    if not row:
        raise HTTPException(status_code=404, detail="Customer not found")
    return CustomerResponse(data=_to_read(db, row))


@router.patch("/{customer_id}", response_model=CustomerResponse)
def update_customer(
    customer_id: str,
    payload: CustomerUpdate,
    db: Session = Depends(get_db),
    _: object = Depends(require_write_access),
) -> CustomerResponse:
    row = db.get(CommerceCustomer, customer_id)
    if not row:
        raise HTTPException(status_code=404, detail="Customer not found")

    updates = payload.model_dump(exclude_unset=True)
    if "tags" in updates:
        row.tags_json = dump_json(updates.pop("tags"))
    if "status" in updates and updates["status"] != row.status:
        _append_timeline(row, f"Status changed to {updates['status']}")
    for key, value in updates.items():
        setattr(row, key, value)

    db.commit()
    db.refresh(row)
    return CustomerResponse(data=_to_read(db, row))
