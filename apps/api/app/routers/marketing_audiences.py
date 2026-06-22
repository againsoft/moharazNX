from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.deps.auth import require_write_access
from app.database import get_db
from app.models.marketing_audience import MarketingAudience
from app.schemas.marketing_audience import (
    AudienceListMeta,
    AudienceListResponse,
    AudienceRead,
    AudienceResponse,
    AudienceUpdate,
)

router = APIRouter(prefix="/audiences", tags=["marketing-audiences"])


@router.get("", response_model=AudienceListResponse)
def list_audiences(
    db: Session = Depends(get_db),
    search: Optional[str] = Query(default=None),
) -> AudienceListResponse:
    query = db.query(MarketingAudience).order_by(MarketingAudience.members.desc())
    if search:
        term = f"%{search.strip().lower()}%"
        query = query.filter(
            (MarketingAudience.name.ilike(term)) | (MarketingAudience.source.ilike(term)),
        )
    rows = query.all()
    data = [AudienceRead.model_validate(row) for row in rows]
    total_members = sum(row.members for row in rows)
    return AudienceListResponse(
        data=data,
        meta=AudienceListMeta(count=len(data), total_members=total_members),
    )


@router.get("/{audience_id}", response_model=AudienceResponse)
def get_audience(audience_id: str, db: Session = Depends(get_db)) -> AudienceResponse:
    row = db.get(MarketingAudience, audience_id)
    if not row:
        raise HTTPException(status_code=404, detail="Audience not found")
    return AudienceResponse(data=AudienceRead.model_validate(row))


@router.patch("/{audience_id}", response_model=AudienceResponse)
def update_audience(
    audience_id: str,
    payload: AudienceUpdate,
    db: Session = Depends(get_db),
    _: object = Depends(require_write_access),
) -> AudienceResponse:
    row = db.get(MarketingAudience, audience_id)
    if not row:
        raise HTTPException(status_code=404, detail="Audience not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(row, key, value)
    db.commit()
    db.refresh(row)
    return AudienceResponse(data=AudienceRead.model_validate(row))
