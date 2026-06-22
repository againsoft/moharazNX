from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.ai_provider import AiProvider
from app.schemas.ai_provider import (
    AiProviderListMeta,
    AiProviderListResponse,
    AiProviderRead,
    AiProviderResponse,
)

router = APIRouter(prefix="/providers", tags=["ai-providers"])


def _to_read(row: AiProvider) -> AiProviderRead:
    return AiProviderRead(
        id=row.id,
        company_id=row.company_id,
        name=row.name,
        models=row.models,
        status=row.status,
        latency_ms=row.latency_ms,
        spend_pct=row.spend_pct,
        created_at=row.created_at,
        updated_at=row.updated_at,
    )


@router.get("", response_model=AiProviderListResponse)
def list_providers(
    db: Session = Depends(get_db),
    status: Optional[str] = Query(default=None),
) -> AiProviderListResponse:
    query = db.query(AiProvider).order_by(AiProvider.spend_pct.desc(), AiProvider.name.asc())

    if status:
        query = query.filter(AiProvider.status == status)

    rows = query.all()
    data = [_to_read(row) for row in rows]
    return AiProviderListResponse(
        data=data,
        meta=AiProviderListMeta(count=len(data)),
    )


@router.get("/{provider_id}", response_model=AiProviderResponse)
def get_provider(provider_id: str, db: Session = Depends(get_db)) -> AiProviderResponse:
    row = db.get(AiProvider, provider_id)
    if not row:
        raise HTTPException(status_code=404, detail="Provider not found")
    return AiProviderResponse(data=_to_read(row))
