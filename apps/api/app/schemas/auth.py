from __future__ import annotations

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class UserRead(BaseModel):
    id: str
    email: str
    username: str
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


class UserCreate(BaseModel):
    email: str = Field(min_length=3, max_length=255)
    username: str = Field(min_length=3, max_length=64, pattern=r"^[a-zA-Z0-9._-]+$")
    name: str = Field(min_length=1, max_length=255)
    role: str = Field(default="staff")
    password: str = Field(min_length=6, max_length=128)


class UserUpdate(BaseModel):
    email: Optional[str] = Field(default=None, min_length=3, max_length=255)
    name: Optional[str] = None
    username: Optional[str] = Field(default=None, min_length=3, max_length=64, pattern=r"^[a-zA-Z0-9._-]+$")
    role: Optional[str] = None
    is_active: Optional[bool] = None
    password: Optional[str] = Field(default=None, min_length=6, max_length=128)


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
