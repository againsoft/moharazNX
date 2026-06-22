from __future__ import annotations

import uuid
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps.auth import require_admin_user
from app.models.auth_activity_log import AuthActivityLog
from app.models.auth_user import AuthUser
from app.schemas.auth import UserCreate, UserListMeta, UserListResponse, UserRead, UserResponse, UserUpdate
from app.security import hash_password

router = APIRouter(prefix="/users", tags=["auth-users"])

ALLOWED_ROLES = {"admin", "staff", "viewer"}


def _user_read(user: AuthUser) -> UserRead:
    return UserRead(
        id=user.id,
        email=user.email,
        username=user.username,
        name=user.name,
        role=user.role,
        is_active=user.is_active,
    )


def _log(
    db: Session,
    *,
    user_id: str,
    action: str,
    detail: Optional[str] = None,
    actor: Optional[AuthUser] = None,
) -> None:
    db.add(AuthActivityLog(
        id=str(uuid.uuid4()),
        user_id=user_id,
        actor_id=actor.id if actor else None,
        actor_name=actor.name if actor else None,
        action=action,
        detail=detail,
    ))


def _dual_log(
    db: Session,
    *,
    target: AuthUser,
    actor: AuthUser,
    target_action: str,
    actor_action: str,
    target_detail: str,
    actor_detail: str,
) -> None:
    """Log the same event from both perspectives."""
    _log(db, user_id=target.id, action=target_action, detail=target_detail, actor=actor)
    if actor.id != target.id:
        _log(db, user_id=actor.id, action=actor_action, detail=actor_detail, actor=actor)


@router.post("", response_model=UserResponse, status_code=201)
def create_user(
    payload: UserCreate,
    actor: AuthUser = Depends(require_admin_user),
    db: Session = Depends(get_db),
) -> UserResponse:
    if payload.role not in ALLOWED_ROLES:
        raise HTTPException(status_code=400, detail="Invalid role")
    if db.query(AuthUser).filter(AuthUser.email == payload.email.lower()).first():
        raise HTTPException(status_code=409, detail="Email already in use")
    if db.query(AuthUser).filter(AuthUser.username == payload.username.lower()).first():
        raise HTTPException(status_code=409, detail="Username already taken")

    user = AuthUser(
        email=payload.email.lower().strip(),
        username=payload.username.lower().strip(),
        name=payload.name.strip(),
        role=payload.role,
        password_hash=hash_password(payload.password),
        is_active=True,
    )
    db.add(user)
    db.flush()

    _dual_log(
        db,
        target=user, actor=actor,
        target_action="account_created",
        actor_action="created_account",
        target_detail=f"Account created by {actor.name}",
        actor_detail=f"Created account for {user.name} ({payload.role})",
    )
    db.commit()
    db.refresh(user)
    return UserResponse(data=_user_read(user))


@router.delete("/{user_id}", status_code=204)
def delete_user(
    user_id: str,
    actor: AuthUser = Depends(require_admin_user),
    db: Session = Depends(get_db),
) -> None:
    row = db.get(AuthUser, user_id)
    if not row:
        raise HTTPException(status_code=404, detail="User not found")
    if row.id == actor.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    # Log only in actor's record (target is being deleted)
    _log(db, user_id=actor.id, action="deleted_account",
         detail=f"Removed {row.name} ({row.email}) from the team", actor=actor)
    db.commit()
    db.delete(row)
    db.commit()


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


@router.get("/{user_id}/activity")
def get_user_activity(
    user_id: str,
    limit: int = 50,
    _: AuthUser = Depends(require_admin_user),
    db: Session = Depends(get_db),
) -> dict:
    row = db.get(AuthUser, user_id)
    if not row:
        raise HTTPException(status_code=404, detail="User not found")
    logs = (
        db.query(AuthActivityLog)
        .filter(AuthActivityLog.user_id == user_id)
        .order_by(AuthActivityLog.created_at.desc())
        .limit(limit)
        .all()
    )
    return {
        "data": [
            {
                "id": log.id,
                "action": log.action,
                "detail": log.detail,
                "actor_id": log.actor_id,
                "actor_name": log.actor_name,
                "created_at": log.created_at.isoformat(),
            }
            for log in logs
        ]
    }


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

    if "role" in changes and changes["role"] not in ALLOWED_ROLES:
        raise HTTPException(status_code=400, detail="Invalid role")

    if "email" in changes:
        taken = db.query(AuthUser).filter(
            AuthUser.email == changes["email"].lower(),
            AuthUser.id != row.id,
        ).first()
        if taken:
            raise HTTPException(status_code=409, detail="Email already in use")
        changes["email"] = changes["email"].lower().strip()

    if "username" in changes:
        taken = db.query(AuthUser).filter(
            AuthUser.username == changes["username"].lower(),
            AuthUser.id != row.id,
        ).first()
        if taken:
            raise HTTPException(status_code=409, detail="Username already taken")
        changes["username"] = changes["username"].lower().strip()

    # Build dual-log entries per changed field
    isSelf = actor.id == row.id

    if "is_active" in changes:
        activating = changes["is_active"]
        action_word = "Reactivated" if activating else "Deactivated"
        _dual_log(
            db,
            target=row, actor=actor,
            target_action="reactivated" if activating else "deactivated",
            actor_action="reactivated_user" if activating else "deactivated_user",
            target_detail=f"{action_word} by {actor.name}",
            actor_detail=f"{action_word} {row.name}",
        )

    if "role" in changes:
        old_role, new_role = row.role, changes["role"]
        _dual_log(
            db,
            target=row, actor=actor,
            target_action="role_changed",
            actor_action="changed_role",
            target_detail=f"Role changed from {old_role} to {new_role} by {actor.name}",
            actor_detail=f"Changed {row.name}'s role from {old_role} to {new_role}",
        )

    # Collect other field changes for a single combined entry
    info_parts_target: list[str] = []
    info_parts_actor: list[str] = []
    for field in ("name", "email", "username"):
        if field not in changes:
            continue
        old_val = getattr(row, field)
        new_val = changes[field]
        if field == "name":
            info_parts_target.append(f"Name changed to {new_val}")
            info_parts_actor.append(f"Changed {row.name}'s name to {new_val}")
        elif field == "email":
            info_parts_target.append(f"Email changed to {new_val}")
            info_parts_actor.append(f"Changed {row.name}'s email to {new_val}")
        elif field == "username":
            info_parts_target.append(f"Username changed to @{new_val}")
            info_parts_actor.append(f"Changed {row.name}'s username to @{new_val}")

    if "password" in changes:
        info_parts_target.append("Password changed by " + (actor.name if not isSelf else "you"))
        if not isSelf:
            info_parts_actor.append(f"Changed {row.name}'s password")

    if info_parts_target:
        _dual_log(
            db,
            target=row, actor=actor,
            target_action="profile_updated",
            actor_action="updated_profile",
            target_detail="; ".join(info_parts_target),
            actor_detail="; ".join(info_parts_actor) if info_parts_actor else "; ".join(info_parts_target),
        )

    # Apply changes
    if "password" in changes:
        row.password_hash = hash_password(changes.pop("password"))

    for key, value in changes.items():
        setattr(row, key, value)

    db.commit()
    db.refresh(row)
    return UserResponse(data=_user_read(row))
