from __future__ import annotations

from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.deps.auth import require_write_access
from app.database import get_db
from app.models.seo_meta_record import SeoMetaRecord, load_json
from app.schemas.seo_meta import SeoMetaListMeta, SeoMetaListResponse, SeoMetaRead, SeoMetaResponse, SeoMetaUpdate

router = APIRouter(prefix="/meta", tags=["seo-meta"])


def _to_read(row: SeoMetaRecord) -> SeoMetaRead:
    return SeoMetaRead(
        id=row.id,
        company_id=row.company_id,
        entity_type=row.entity_type,
        title=row.title,
        url=row.url,
        meta_title=row.meta_title,
        meta_description=row.meta_description,
        og_image=row.og_image,
        canonical_url=row.canonical_url,
        indexable=row.indexable,
        schema_type=row.schema_type,
        score=row.score,
        issues=load_json(row.issues_json, []),
        created_at=row.created_at,
        updated_at=row.updated_at,
    )


@router.get("", response_model=SeoMetaListResponse)
def list_meta(
    db: Session = Depends(get_db),
    search: Optional[str] = Query(default=None),
    entity_type: Optional[str] = Query(default=None),
) -> SeoMetaListResponse:
    query = db.query(SeoMetaRecord).order_by(SeoMetaRecord.score.desc(), SeoMetaRecord.title)
    if entity_type:
        query = query.filter(SeoMetaRecord.entity_type == entity_type)
    if search:
        term = f"%{search.strip().lower()}%"
        query = query.filter(
            (SeoMetaRecord.title.ilike(term))
            | (SeoMetaRecord.url.ilike(term))
            | (SeoMetaRecord.meta_title.ilike(term)),
        )
    rows = query.all()
    data = [_to_read(r) for r in rows]
    avg = sum(r.score for r in rows) / len(rows) if rows else 0.0
    return SeoMetaListResponse(data=data, meta=SeoMetaListMeta(count=len(data), avg_score=avg))


@router.get("/{record_id}", response_model=SeoMetaResponse)
def get_meta(record_id: str, db: Session = Depends(get_db)) -> SeoMetaResponse:
    row = db.get(SeoMetaRecord, record_id)
    if not row:
        raise HTTPException(status_code=404, detail="Meta record not found")
    return SeoMetaResponse(data=_to_read(row))


@router.patch("/{record_id}", response_model=SeoMetaResponse)
def update_meta(
    record_id: str,
    payload: SeoMetaUpdate,
    db: Session = Depends(get_db),
    _: object = Depends(require_write_access),
) -> SeoMetaResponse:
    row = db.get(SeoMetaRecord, record_id)
    if not row:
        raise HTTPException(status_code=404, detail="Meta record not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(row, key, value)
    db.commit()
    db.refresh(row)
    return SeoMetaResponse(data=_to_read(row))
