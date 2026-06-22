from __future__ import annotations

from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps.auth import require_admin_user
from app.models.auth_user import AuthUser
from app.schemas.auth import UserListMeta, UserListResponse, UserRead, UserResponse, UserUpdate

router = APIRouter(prefix="/users", tags=["auth-users"])


def _user_read(user: AuthUser) -> UserRead:
    return UserRead(id=user.id, email=user.email, name=user.name, role=user.role, is_active=user.is_active)


@router.get("", response_model=UserListResponse)
def list_users(
    _: AuthUser = Depends(require_admin_user),
    db: Session = Depends(get_db),
) -> UserListResponse:
    rows = db.query(AuthUser).order_by(AuthUser.name).all()
    return UserListResponse(
        data=[_user_read(row) for row in rows],
        meta=UserListMeta(count=len(rows)),
    )


@router.get("/{user_id}", response_model=UserResponse)
def get_user(
    user_id: str,
    _: AuthUser = Depends(require_admin_user),
    db: Session = Depends(get_db),
) -> UserResponse:
    row = db.get(AuthUser, user_id)
    if not row:
        raise HTTPException(status_code=404, detail="User not found")
    return UserResponse(data=_user_read(row))


@router.patch("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: str,
    payload: UserUpdate,
    actor: AuthUser = Depends(require_admin_user),
    db: Session = Depends(get_db),
) -> UserResponse:
    row = db.get(AuthUser, user_id)
    if not row:
        raise HTTPException(status_code=404, detail="User not found")
    if row.id == actor.id and payload.is_active is False:
        raise HTTPException(status_code=400, detail="Cannot deactivate your own account")

    changes = payload.model_dump(exclude_unset=True)
    if not changes:
        return UserResponse(data=_user_read(row))

    allowed_roles = {"admin", "staff", "viewer"}
    if "role" in changes and changes["role"] not in allowed_roles:
        raise HTTPException(status_code=400, detail="Invalid role")

    for key, value in changes.items():
        setattr(row, key, value)

    db.commit()
    db.refresh(row)
    return UserResponse(data=_user_read(row))
