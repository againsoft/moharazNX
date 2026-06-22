from __future__ import annotations

from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps.auth import get_current_user
from app.models.auth_session import AuthSession
from app.models.auth_user import AuthUser
from app.schemas.auth import LoginRequest, LoginResponse, LogoutResponse, MeResponse, UserRead
from app.security import new_session_token, verify_password

router = APIRouter(prefix="/auth", tags=["auth"])

SESSION_DAYS = 7


def _user_read(user: AuthUser) -> UserRead:
    return UserRead(id=user.id, email=user.email, name=user.name, role=user.role, is_active=user.is_active)


@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> LoginResponse:
    user = db.query(AuthUser).filter(AuthUser.email == payload.email.lower()).first()
    if not user or not user.is_active or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    expires_at = datetime.utcnow() + timedelta(days=SESSION_DAYS)
    token = new_session_token()
    db.add(AuthSession(user_id=user.id, token=token, expires_at=expires_at))
    db.commit()
    return LoginResponse(token=token, expires_at=expires_at, user=_user_read(user))


@router.get("/me", response_model=MeResponse)
def me(user: AuthUser = Depends(get_current_user)) -> MeResponse:
    return MeResponse(data=_user_read(user))


@router.post("/logout", response_model=LogoutResponse)
def logout(
    authorization: Optional[str] = Header(default=None),
    db: Session = Depends(get_db),
) -> LogoutResponse:
    if authorization and authorization.startswith("Bearer "):
        token = authorization.removeprefix("Bearer ").strip()
        db.query(AuthSession).filter(AuthSession.token == token).delete()
        db.commit()
    return LogoutResponse()
