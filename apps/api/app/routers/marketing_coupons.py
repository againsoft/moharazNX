from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.deps.auth import require_write_access
from app.database import get_db
from app.models.marketing_coupon import MarketingCoupon
from app.schemas.marketing_coupon import CouponListMeta, CouponListResponse, CouponRead, CouponResponse, CouponUpdate

router = APIRouter(prefix="/coupons", tags=["marketing-coupons"])


@router.get("", response_model=CouponListResponse)
def list_coupons(
    db: Session = Depends(get_db),
    search: Optional[str] = Query(default=None),
    status: Optional[str] = Query(default=None),
) -> CouponListResponse:
    query = db.query(MarketingCoupon).order_by(MarketingCoupon.code)
    if status:
        query = query.filter(MarketingCoupon.status == status)
    if search:
        term = f"%{search.strip().lower()}%"
        query = query.filter(
            (MarketingCoupon.code.ilike(term)) | (MarketingCoupon.name.ilike(term)),
        )
    rows = query.all()
    data = [CouponRead.model_validate(r) for r in rows]
    active = sum(1 for r in rows if r.status == "active")
    return CouponListResponse(data=data, meta=CouponListMeta(count=len(data), active_count=active))


@router.get("/{coupon_id}", response_model=CouponResponse)
def get_coupon(coupon_id: str, db: Session = Depends(get_db)) -> CouponResponse:
    row = db.get(MarketingCoupon, coupon_id)
    if not row:
        raise HTTPException(status_code=404, detail="Coupon not found")
    return CouponResponse(data=CouponRead.model_validate(row))


@router.patch("/{coupon_id}", response_model=CouponResponse)
def update_coupon(
    coupon_id: str,
    payload: CouponUpdate,
    db: Session = Depends(get_db),
    _: object = Depends(require_write_access),
) -> CouponResponse:
    row = db.get(MarketingCoupon, coupon_id)
    if not row:
        raise HTTPException(status_code=404, detail="Coupon not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(row, key, value)
    db.commit()
    db.refresh(row)
    return CouponResponse(data=CouponRead.model_validate(row))
