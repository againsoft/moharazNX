from __future__ import annotations

from datetime import datetime
from typing import Optional

from fastapi import Depends, Header, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.auth_session import AuthSession
from app.models.auth_user import AuthUser

WRITE_ROLES = frozenset({"admin", "staff"})
ADMIN_ROLES = frozenset({"admin"})


def get_current_user(
    authorization: Optional[str] = Header(default=None),
    db: Session = Depends(get_db),
) -> AuthUser:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = authorization.removeprefix("Bearer ").strip()
    session = (
        db.query(AuthSession)
        .filter(AuthSession.token == token, AuthSession.expires_at > datetime.utcnow())
        .first()
    )
    if not session:
        raise HTTPException(status_code=401, detail="Invalid or expired session")
    user = db.get(AuthUser, session.user_id)
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User inactive")
    return user


def require_write_access(user: AuthUser = Depends(get_current_user)) -> AuthUser:
    if user.role not in WRITE_ROLES:
        raise HTTPException(status_code=403, detail="Read-only access")
    return user


def require_admin_user(user: AuthUser = Depends(get_current_user)) -> AuthUser:
    if user.role not in ADMIN_ROLES:
        raise HTTPException(status_code=403, detail="Admin access required")
    return user
