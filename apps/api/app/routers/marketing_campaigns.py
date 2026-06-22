from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.deps.auth import require_write_access
from app.database import get_db
from app.models.marketing_campaign import MarketingCampaign, load_json
from app.schemas.marketing_campaign import (
    CampaignListMeta,
    CampaignListResponse,
    CampaignRead,
    CampaignResponse,
    CampaignUpdate,
)

router = APIRouter(prefix="/campaigns", tags=["marketing-campaigns"])


def _to_read(row: MarketingCampaign) -> CampaignRead:
    return CampaignRead(
        id=row.id,
        company_id=row.company_id,
        code=row.code,
        name=row.name,
        type=row.type,
        status=row.status,
        audience=row.audience,
        channels=load_json(row.channels_json, []),
        starts_at=row.starts_at,
        ends_at=row.ends_at,
        goal=row.goal,
        progress=row.progress,
        revenue=row.revenue,
        created_at=row.created_at,
        updated_at=row.updated_at,
    )


@router.get("", response_model=CampaignListResponse)
def list_campaigns(
    db: Session = Depends(get_db),
    search: Optional[str] = Query(default=None),
    status: Optional[str] = Query(default=None),
) -> CampaignListResponse:
    query = db.query(MarketingCampaign).order_by(MarketingCampaign.starts_at.desc())
    if status:
        query = query.filter(MarketingCampaign.status == status)
    if search:
        term = f"%{search.strip().lower()}%"
        query = query.filter(
            (MarketingCampaign.code.ilike(term))
            | (MarketingCampaign.name.ilike(term))
            | (MarketingCampaign.audience.ilike(term)),
        )
    rows = query.all()
    data = [_to_read(row) for row in rows]
    running = sum(1 for row in rows if row.status == "running")
    return CampaignListResponse(data=data, meta=CampaignListMeta(count=len(data), running_count=running))


@router.get("/{campaign_id}", response_model=CampaignResponse)
def get_campaign(campaign_id: str, db: Session = Depends(get_db)) -> CampaignResponse:
    row = db.get(MarketingCampaign, campaign_id)
    if not row:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return CampaignResponse(data=_to_read(row))


@router.patch("/{campaign_id}", response_model=CampaignResponse)
def update_campaign(
    campaign_id: str,
    payload: CampaignUpdate,
    db: Session = Depends(get_db),
    _: object = Depends(require_write_access),
) -> CampaignResponse:
    row = db.get(MarketingCampaign, campaign_id)
    if not row:
        raise HTTPException(status_code=404, detail="Campaign not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(row, key, value)
    db.commit()
    db.refresh(row)
    return CampaignResponse(data=_to_read(row))
