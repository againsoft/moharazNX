from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.deps.auth import require_write_access
from app.database import get_db
from app.models.marketing_journey import MarketingJourney
from app.schemas.marketing_journey import (
    JourneyListMeta,
    JourneyListResponse,
    JourneyRead,
    JourneyResponse,
    JourneyUpdate,
)

router = APIRouter(prefix="/journeys", tags=["marketing-journeys"])


@router.get("", response_model=JourneyListResponse)
def list_journeys(
    db: Session = Depends(get_db),
    search: Optional[str] = Query(default=None),
    status: Optional[str] = Query(default=None),
) -> JourneyListResponse:
    query = db.query(MarketingJourney).order_by(MarketingJourney.name)
    if status:
        query = query.filter(MarketingJourney.status == status)
    if search:
        term = f"%{search.strip().lower()}%"
        query = query.filter(
            (MarketingJourney.name.ilike(term)) | (MarketingJourney.trigger.ilike(term)),
        )
    rows = query.all()
    data = [JourneyRead.model_validate(row) for row in rows]
    active = sum(1 for row in rows if row.status == "active")
    return JourneyListResponse(data=data, meta=JourneyListMeta(count=len(data), active_count=active))


@router.get("/{journey_id}", response_model=JourneyResponse)
def get_journey(journey_id: str, db: Session = Depends(get_db)) -> JourneyResponse:
    row = db.get(MarketingJourney, journey_id)
    if not row:
        raise HTTPException(status_code=404, detail="Journey not found")
    return JourneyResponse(data=JourneyRead.model_validate(row))


@router.patch("/{journey_id}", response_model=JourneyResponse)
def update_journey(
    journey_id: str,
    payload: JourneyUpdate,
    db: Session = Depends(get_db),
    _: object = Depends(require_write_access),
) -> JourneyResponse:
    row = db.get(MarketingJourney, journey_id)
    if not row:
        raise HTTPException(status_code=404, detail="Journey not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(row, key, value)
    db.commit()
    db.refresh(row)
    return JourneyResponse(data=JourneyRead.model_validate(row))
