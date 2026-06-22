from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.deps.auth import require_write_access
from app.database import get_db
from app.models.configurator_category import ConfiguratorCategory
from app.models.configurator_profile import ConfiguratorProfile
from app.schemas.configurator_category import (
    ConfiguratorCategoryBulkStatusRequest,
    ConfiguratorCategoryCreate,
    ConfiguratorCategoryListMeta,
    ConfiguratorCategoryListResponse,
    ConfiguratorCategoryRead,
    ConfiguratorCategoryResponse,
    ConfiguratorCategoryUpdate,
)

router = APIRouter(prefix="/categories", tags=["configurator-categories"])


def _profile_name_map(db: Session) -> dict[str, str]:
    return {row.id: row.name for row in db.query(ConfiguratorProfile.id, ConfiguratorProfile.name).all()}


def _to_read(row: ConfiguratorCategory, profile_names: dict[str, str]) -> ConfiguratorCategoryRead:
    data = ConfiguratorCategoryRead.model_validate(row)
    data.profile_name = profile_names.get(row.profile_id, "")
    return data


def _sync_profile_category_count(db: Session, profile_id: str) -> None:
    profile = db.get(ConfiguratorProfile, profile_id)
    if not profile:
        return
    count = db.query(ConfiguratorCategory).filter(ConfiguratorCategory.profile_id == profile_id).count()
    profile.category_count = count


def _next_sort_order(db: Session, profile_id: str) -> int:
    max_order = (
        db.query(ConfiguratorCategory.sort_order)
        .filter(ConfiguratorCategory.profile_id == profile_id)
        .order_by(ConfiguratorCategory.sort_order.desc())
        .first()
    )
    return (max_order[0] + 1) if max_order else 1


@router.get("", response_model=ConfiguratorCategoryListResponse)
def list_categories(
    profile_id: Optional[str] = Query(default=None),
    db: Session = Depends(get_db),
) -> ConfiguratorCategoryListResponse:
    query = db.query(ConfiguratorCategory)
    if profile_id:
        query = query.filter(ConfiguratorCategory.profile_id == profile_id)
    rows = query.order_by(ConfiguratorCategory.sort_order, ConfiguratorCategory.name).all()
    profile_names = _profile_name_map(db)
    data = [_to_read(r, profile_names) for r in rows]
    return ConfiguratorCategoryListResponse(data=data, meta=ConfiguratorCategoryListMeta(count=len(data)))


@router.patch("/bulk/status", response_model=ConfiguratorCategoryListResponse)
def bulk_set_status(
    payload: ConfiguratorCategoryBulkStatusRequest,
    db: Session = Depends(get_db),
    _: object = Depends(require_write_access),
) -> ConfiguratorCategoryListResponse:
    rows = db.query(ConfiguratorCategory).filter(ConfiguratorCategory.id.in_(payload.ids)).all()
    if len(rows) != len(set(payload.ids)):
        raise HTTPException(status_code=400, detail="One or more category ids not found")

    for row in rows:
        row.status = payload.status

    db.commit()

    all_rows = db.query(ConfiguratorCategory).order_by(ConfiguratorCategory.sort_order).all()
    profile_names = _profile_name_map(db)
    data = [_to_read(r, profile_names) for r in all_rows]
    return ConfiguratorCategoryListResponse(data=data, meta=ConfiguratorCategoryListMeta(count=len(data)))


@router.get("/{category_id}", response_model=ConfiguratorCategoryResponse)
def get_category(category_id: str, db: Session = Depends(get_db)) -> ConfiguratorCategoryResponse:
    row = db.get(ConfiguratorCategory, category_id)
    if not row:
        raise HTTPException(status_code=404, detail="Configurator category not found")
    profile_names = _profile_name_map(db)
    return ConfiguratorCategoryResponse(data=_to_read(row, profile_names))


@router.post("", response_model=ConfiguratorCategoryResponse, status_code=201)
def create_category(
    payload: ConfiguratorCategoryCreate,
    db: Session = Depends(get_db),
    _: object = Depends(require_write_access),
) -> ConfiguratorCategoryResponse:
    profile = db.get(ConfiguratorProfile, payload.profile_id)
    if not profile:
        raise HTTPException(status_code=400, detail="Configurator profile not found")

    existing = (
        db.query(ConfiguratorCategory)
        .filter(
            ConfiguratorCategory.profile_id == payload.profile_id,
            ConfiguratorCategory.slug == payload.slug,
        )
        .first()
    )
    if existing:
        raise HTTPException(status_code=409, detail="Category slug already exists for this profile")

    row = ConfiguratorCategory(**payload.model_dump())
    if row.sort_order == 0:
        row.sort_order = _next_sort_order(db, payload.profile_id)

    db.add(row)
    db.commit()
    _sync_profile_category_count(db, payload.profile_id)
    db.commit()
    db.refresh(row)

    profile_names = _profile_name_map(db)
    return ConfiguratorCategoryResponse(data=_to_read(row, profile_names))


@router.patch("/{category_id}", response_model=ConfiguratorCategoryResponse)
def update_category(
    category_id: str,
    payload: ConfiguratorCategoryUpdate,
    db: Session = Depends(get_db),
    _: object = Depends(require_write_access),
) -> ConfiguratorCategoryResponse:
    row = db.get(ConfiguratorCategory, category_id)
    if not row:
        raise HTTPException(status_code=404, detail="Configurator category not found")

    changes = payload.model_dump(exclude_unset=True)
    if not changes:
        profile_names = _profile_name_map(db)
        return ConfiguratorCategoryResponse(data=_to_read(row, profile_names))

    profile_id = changes.get("profile_id", row.profile_id)
    if profile_id != row.profile_id:
        profile = db.get(ConfiguratorProfile, profile_id)
        if not profile:
            raise HTTPException(status_code=400, detail="Configurator profile not found")

    slug = changes.get("slug", row.slug)
    if slug != row.slug or profile_id != row.profile_id:
        conflict = (
            db.query(ConfiguratorCategory)
            .filter(
                ConfiguratorCategory.profile_id == profile_id,
                ConfiguratorCategory.slug == slug,
                ConfiguratorCategory.id != category_id,
            )
            .first()
        )
        if conflict:
            raise HTTPException(status_code=409, detail="Category slug already exists for this profile")

    old_profile_id = row.profile_id
    for key, value in changes.items():
        setattr(row, key, value)

    db.commit()
    _sync_profile_category_count(db, old_profile_id)
    if profile_id != old_profile_id:
        _sync_profile_category_count(db, profile_id)
    db.commit()
    db.refresh(row)

    profile_names = _profile_name_map(db)
    return ConfiguratorCategoryResponse(data=_to_read(row, profile_names))


@router.delete("/{category_id}", status_code=204)
def delete_category(
    category_id: str,
    db: Session = Depends(get_db),
    _: object = Depends(require_write_access),
) -> None:
    row = db.get(ConfiguratorCategory, category_id)
    if not row:
        raise HTTPException(status_code=404, detail="Configurator category not found")
    profile_id = row.profile_id
    db.delete(row)
    db.commit()
    _sync_profile_category_count(db, profile_id)
    db.commit()
