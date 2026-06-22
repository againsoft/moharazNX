from __future__ import annotations

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class AiApiConnectionRead(BaseModel):
    id: str
    company_id: str
    provider_id: str
    provider_name: str
    api_key_set: bool
    api_key_hint: str
    base_url: str
    status: str
    last_connected_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime


class AiApiConnectionUpdate(BaseModel):
    api_key: Optional[str] = None
    base_url: Optional[str] = None
    test_connect: bool = False


class AiApiConnectionListMeta(BaseModel):
    count: int
    connected_count: int


class AiApiConnectionListResponse(BaseModel):
    data: List[AiApiConnectionRead]
    meta: AiApiConnectionListMeta


class AiApiConnectionResponse(BaseModel):
    data: AiApiConnectionRead


class AiDbConnectionRead(BaseModel):
    ok: bool
    version: str = ""
    database: str = "PostgreSQL"
    host: str = "127.0.0.1:5433"


class AiDbConnectionResponse(BaseModel):
    data: AiDbConnectionRead
