from __future__ import annotations

import json
from typing import Dict, List, Optional, Set

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.deps.auth import require_write_access
from app.database import get_db
from app.models.catalog_attribute import CatalogAttribute
from app.models.catalog_attribute_group import CatalogAttributeGroup
from app.models.catalog_attribute_profile import CatalogAttributeProfile
from app.schemas.attribute_profile import (
    AttributeFieldRead,
    AttributeGroupRead,
    AttributeProfileBulkSaveRequest,
    AttributeProfileCreate,
    AttributeProfileDetailRead,
    AttributeProfileListMeta,
    AttributeProfileListResponse,
    AttributeProfileRead,
    AttributeProfileReorderRequest,
    AttributeProfileResponse,
    AttributeProfileUpdate,
    dump_json_list,
    parse_json_list,
    slugify_code,
)

router = APIRouter(prefix="/attribute-profiles", tags=["catalog-attribute-profiles"])


def _field_to_read(row: CatalogAttribute) -> AttributeFieldRead:
    return AttributeFieldRead(
        id=row.id,
        group_id=row.group_id,
        name=row.name,
        code=row.code,
        field_type=row.field_type,
        sort_order=row.sort_order,
        is_required=row.is_required,
        is_filterable=row.is_filterable,
        is_comparable=row.is_comparable,
        is_searchable=row.is_searchable,
        is_visible=row.is_visible,
        is_active=row.is_active,
        unit=row.unit,
        help_text=row.help_text,
        predefined_values=parse_json_list(row.predefined_values),
    )


def _group_to_read(row: CatalogAttributeGroup, attrs: List[CatalogAttribute]) -> AttributeGroupRead:
    group_attrs = [_field_to_read(a) for a in attrs if a.group_id == row.id]
    group_attrs.sort(key=lambda a: a.sort_order)
    return AttributeGroupRead(
        id=row.id,
        profile_id=row.profile_id,
        name=row.name,
        code=row.code,
        sort_order=row.sort_order,
        is_active=row.is_active,
        description=row.description,
        attributes=group_attrs,
    )


def _profile_to_read(
    row: CatalogAttributeProfile,
    group_count: int,
    attribute_count: int,
    product_count: int = 0,
) -> AttributeProfileRead:
    return AttributeProfileRead(
        id=row.id,
        company_id=row.company_id,
        name=row.name,
        code=row.code,
        description=row.description,
        sort_order=row.sort_order,
        is_active=row.is_active,
        icon_url=row.icon_url,
        image_url=row.image_url,
        category_labels=parse_json_list(row.category_labels),
        product_count=product_count,
        group_count=group_count,
        attribute_count=attribute_count,
        created_at=row.created_at,
        updated_at=row.updated_at,
    )


def _counts_for_profiles(
    db: Session,
    profile_ids: List[str],
) -> Dict[str, Dict[str, int]]:
    counts: Dict[str, Dict[str, int]] = {
        pid: {"groups": 0, "attributes": 0} for pid in profile_ids
    }
    if not profile_ids:
        return counts

    groups = db.query(CatalogAttributeGroup).filter(
        CatalogAttributeGroup.profile_id.in_(profile_ids),
    ).all()
    group_ids = [g.id for g in groups]
    group_by_profile: Dict[str, List[str]] = {}
    for group in groups:
        counts[group.profile_id]["groups"] += 1
        group_by_profile.setdefault(group.profile_id, []).append(group.id)

    if group_ids:
        attrs = db.query(CatalogAttribute.group_id).filter(
            CatalogAttribute.group_id.in_(group_ids),
        ).all()
        attr_count_by_group: Dict[str, int] = {}
        for (group_id,) in attrs:
            attr_count_by_group[group_id] = attr_count_by_group.get(group_id, 0) + 1
        for profile_id, gids in group_by_profile.items():
            counts[profile_id]["attributes"] = sum(
                attr_count_by_group.get(gid, 0) for gid in gids
            )

    return counts


def _next_sort_order(db: Session) -> int:
    max_order = (
        db.query(CatalogAttributeProfile.sort_order)
        .order_by(CatalogAttributeProfile.sort_order.desc())
        .first()
    )
    return (max_order[0] + 1) if max_order else 0


def _load_structure(db: Session, profile_id: str) -> AttributeProfileDetailRead:
    row = db.get(CatalogAttributeProfile, profile_id)
    if not row:
        raise HTTPException(status_code=404, detail="Profile not found")

    groups = (
        db.query(CatalogAttributeGroup)
        .filter(CatalogAttributeGroup.profile_id == profile_id)
        .order_by(CatalogAttributeGroup.sort_order)
        .all()
    )
    group_ids = [g.id for g in groups]
    attrs: List[CatalogAttribute] = []
    if group_ids:
        attrs = (
            db.query(CatalogAttribute)
            .filter(CatalogAttribute.group_id.in_(group_ids))
            .order_by(CatalogAttribute.sort_order)
            .all()
        )

    base = _profile_to_read(row, len(groups), len(attrs))
    detail = AttributeProfileDetailRead(**base.model_dump())
    detail.groups = [_group_to_read(g, attrs) for g in groups]
    return detail


@router.get("", response_model=AttributeProfileListResponse)
def list_profiles(db: Session = Depends(get_db)) -> AttributeProfileListResponse:
    rows = (
        db.query(CatalogAttributeProfile)
        .order_by(CatalogAttributeProfile.sort_order, CatalogAttributeProfile.name)
        .all()
    )
    profile_ids = [r.id for r in rows]
    counts = _counts_for_profiles(db, profile_ids)

    groups = (
        db.query(CatalogAttributeGroup)
        .filter(CatalogAttributeGroup.profile_id.in_(profile_ids))
        .order_by(CatalogAttributeGroup.sort_order)
        .all()
        if profile_ids
        else []
    )
    group_ids = [g.id for g in groups]
    attrs = (
        db.query(CatalogAttribute)
        .filter(CatalogAttribute.group_id.in_(group_ids))
        .order_by(CatalogAttribute.sort_order)
        .all()
        if group_ids
        else []
    )

    data = [
        _profile_to_read(
            r,
            counts[r.id]["groups"],
            counts[r.id]["attributes"],
        )
        for r in rows
    ]
    flat_groups = [_group_to_read(g, attrs) for g in groups]
    flat_attrs = [_field_to_read(a) for a in attrs]

    return AttributeProfileListResponse(
        data=data,
        groups=flat_groups,
        attributes=flat_attrs,
        meta=AttributeProfileListMeta(count=len(data)),
    )


@router.patch("/reorder", response_model=AttributeProfileListResponse)
def reorder_profiles(
    payload: AttributeProfileReorderRequest,
    db: Session = Depends(get_db),
    _: object = Depends(require_write_access),
) -> AttributeProfileListResponse:
    rows = db.query(CatalogAttributeProfile).all()
    row_map = {r.id: r for r in rows}
    if set(payload.ordered_ids) != set(row_map.keys()):
        raise HTTPException(status_code=400, detail="ordered_ids must include all profiles")

    for index, profile_id in enumerate(payload.ordered_ids):
        row_map[profile_id].sort_order = index
    db.commit()
    return list_profiles(db)


@router.get("/{profile_id}", response_model=AttributeProfileResponse)
def get_profile(profile_id: str, db: Session = Depends(get_db)) -> AttributeProfileResponse:
    return AttributeProfileResponse(data=_load_structure(db, profile_id))


@router.post("", response_model=AttributeProfileResponse, status_code=201)
def create_profile(
    payload: AttributeProfileCreate,
    db: Session = Depends(get_db),
    _: object = Depends(require_write_access),
) -> AttributeProfileResponse:
    existing = (
        db.query(CatalogAttributeProfile)
        .filter(CatalogAttributeProfile.code == payload.code)
        .first()
    )
    if existing:
        raise HTTPException(status_code=409, detail="Profile code already exists")

    row = CatalogAttributeProfile(
        name=payload.name,
        code=payload.code,
        description=payload.description,
        sort_order=payload.sort_order or _next_sort_order(db),
        is_active=payload.is_active,
        icon_url=payload.icon_url,
        image_url=payload.image_url,
        category_labels=dump_json_list(payload.category_labels),
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return AttributeProfileResponse(data=_load_structure(db, row.id))


@router.post("/bulk", response_model=AttributeProfileResponse, status_code=201)
def create_profile_bulk(
    payload: AttributeProfileBulkSaveRequest,
    db: Session = Depends(get_db),
    _: object = Depends(require_write_access),
) -> AttributeProfileResponse:
    code = slugify_code(payload.profile_name)
    row = CatalogAttributeProfile(
        name=payload.profile_name.strip(),
        code=code,
        sort_order=_next_sort_order(db),
        is_active=True,
        image_url=payload.image_url,
        category_labels=dump_json_list([]),
    )
    db.add(row)
    db.flush()
    _replace_profile_structure(db, row.id, payload)
    db.commit()
    return AttributeProfileResponse(data=_load_structure(db, row.id))


@router.put("/{profile_id}/bulk", response_model=AttributeProfileResponse)
def update_profile_bulk(
    profile_id: str,
    payload: AttributeProfileBulkSaveRequest,
    db: Session = Depends(get_db),
    _: object = Depends(require_write_access),
) -> AttributeProfileResponse:
    row = db.get(CatalogAttributeProfile, profile_id)
    if not row:
        raise HTTPException(status_code=404, detail="Profile not found")

    row.name = payload.profile_name.strip()
    row.code = slugify_code(payload.profile_name)
    if payload.image_url is not None:
        row.image_url = payload.image_url or None
    _replace_profile_structure(db, profile_id, payload)
    db.commit()
    return AttributeProfileResponse(data=_load_structure(db, profile_id))


def _replace_profile_structure(
    db: Session,
    profile_id: str,
    payload: AttributeProfileBulkSaveRequest,
) -> None:
    existing_groups = (
        db.query(CatalogAttributeGroup)
        .filter(CatalogAttributeGroup.profile_id == profile_id)
        .all()
    )
    existing_group_ids = [g.id for g in existing_groups]
    if existing_group_ids:
        db.query(CatalogAttribute).filter(
            CatalogAttribute.group_id.in_(existing_group_ids),
        ).delete(synchronize_session=False)
        db.query(CatalogAttributeGroup).filter(
            CatalogAttributeGroup.profile_id == profile_id,
        ).delete(synchronize_session=False)

    kept_group_ids: Set[str] = set()
    for group_index, group_item in enumerate(payload.groups):
        if not group_item.name.strip():
            continue
        group = CatalogAttributeGroup(
            id=group_item.id or None,
            profile_id=profile_id,
            name=group_item.name.strip(),
            code=slugify_code(group_item.name),
            sort_order=group_index,
            is_active=True,
        )
        db.add(group)
        db.flush()
        kept_group_ids.add(group.id)

        for attr_index, attr_item in enumerate(group_item.attributes):
            if not attr_item.name.strip():
                continue
            field_type = "dropdown" if attr_item.predefined_values else "text"
            db.add(
                CatalogAttribute(
                    id=attr_item.id or None,
                    group_id=group.id,
                    name=attr_item.name.strip(),
                    code=slugify_code(attr_item.name),
                    field_type=field_type,
                    sort_order=attr_index,
                    is_filterable=attr_item.filterable,
                    predefined_values=json.dumps(attr_item.predefined_values or []),
                ),
            )


@router.patch("/{profile_id}", response_model=AttributeProfileResponse)
def update_profile(
    profile_id: str,
    payload: AttributeProfileUpdate,
    db: Session = Depends(get_db),
    _: object = Depends(require_write_access),
) -> AttributeProfileResponse:
    row = db.get(CatalogAttributeProfile, profile_id)
    if not row:
        raise HTTPException(status_code=404, detail="Profile not found")

    changes = payload.model_dump(exclude_unset=True)
    if not changes:
        return AttributeProfileResponse(data=_load_structure(db, profile_id))

    code = changes.get("code", row.code)
    if code != row.code:
        conflict = (
            db.query(CatalogAttributeProfile)
            .filter(CatalogAttributeProfile.code == code, CatalogAttributeProfile.id != profile_id)
            .first()
        )
        if conflict:
            raise HTTPException(status_code=409, detail="Profile code already exists")

    if "category_labels" in changes:
        changes["category_labels"] = dump_json_list(changes["category_labels"])

    for key, value in changes.items():
        setattr(row, key, value)

    db.commit()
    return AttributeProfileResponse(data=_load_structure(db, profile_id))


@router.delete("/{profile_id}", status_code=204)
def delete_profile(
    profile_id: str,
    db: Session = Depends(get_db),
    _: object = Depends(require_write_access),
) -> None:
    row = db.get(CatalogAttributeProfile, profile_id)
    if not row:
        raise HTTPException(status_code=404, detail="Profile not found")
    db.delete(row)
    db.commit()
