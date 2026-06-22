from __future__ import annotations

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class UserRead(BaseModel):
    id: str
    email: str
    name: str
    role: str
    is_active: bool


class UserListMeta(BaseModel):
    count: int


class UserListResponse(BaseModel):
    data: List[UserRead]
    meta: UserListMeta


class UserResponse(BaseModel):
    data: UserRead


class UserUpdate(BaseModel):
    role: Optional[str] = None
    is_active: Optional[bool] = None


class LoginRequest(BaseModel):
    email: str = Field(min_length=3, max_length=255)
    password: str = Field(min_length=6, max_length=128)


class LoginResponse(BaseModel):
    token: str
    expires_at: datetime
    user: UserRead


class MeResponse(BaseModel):
    data: UserRead


class LogoutResponse(BaseModel):
    ok: bool = True
