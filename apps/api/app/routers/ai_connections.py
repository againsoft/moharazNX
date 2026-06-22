from __future__ import annotations

from datetime import datetime
from urllib.parse import urlparse

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.config import get_settings
from app.services.llm_client import LlmConfig, LlmError, ping_llm, _pick_model
from app.database import check_database_connection, get_db
from app.deps.auth import require_write_access
from app.models.ai_api_connection import AiApiConnection
from app.models.ai_provider import AiProvider
from app.models.auth_user import AuthUser
from app.schemas.ai_api_connection import (
    AiApiConnectionListMeta,
    AiApiConnectionListResponse,
    AiApiConnectionRead,
    AiApiConnectionResponse,
    AiApiConnectionUpdate,
    AiDbConnectionRead,
    AiDbConnectionResponse,
)

router = APIRouter(prefix="/connections", tags=["ai-connections"])
settings = get_settings()


def _mask_hint(api_key: str) -> str:
    if not api_key:
        return ""
    if len(api_key) <= 4:
        return "****"
    return f"…{api_key[-4:]}"


def _to_read(row: AiApiConnection) -> AiApiConnectionRead:
    return AiApiConnectionRead(
        id=row.id,
        company_id=row.company_id,
        provider_id=row.provider_id,
        provider_name=row.provider_name,
        api_key_set=bool(row.api_key),
        api_key_hint=row.api_key_hint,
        base_url=row.base_url,
        status=row.status,
        last_connected_at=row.last_connected_at,
        created_at=row.created_at,
        updated_at=row.updated_at,
    )


def _validate_connection(row: AiApiConnection, db: Session) -> str:
    if row.provider_id == "local":
        if not row.base_url.strip():
            return "disconnected"
        parsed = urlparse(row.base_url.strip())
        if parsed.scheme not in {"http", "https"} or not parsed.netloc:
            return "error"
        provider = db.get(AiProvider, row.provider_id)
        config = LlmConfig(
            provider_id=row.provider_id,
            provider_name=row.provider_name,
            api_key=row.api_key.strip(),
            base_url=row.base_url.strip(),
            model=_pick_model(provider, row.provider_id),
        )
        try:
            ping_llm(config)
            return "connected"
        except LlmError:
            return "error"

    if len(row.api_key.strip()) < 8:
        return "disconnected"

    provider = db.get(AiProvider, row.provider_id)
    config = LlmConfig(
        provider_id=row.provider_id,
        provider_name=row.provider_name,
        api_key=row.api_key.strip(),
        base_url=row.base_url.strip(),
        model=_pick_model(provider, row.provider_id),
    )
    try:
        ping_llm(config)
        return "connected"
    except LlmError:
        return "error"


def _sync_provider_status(db: Session, provider_id: str, status: str) -> None:
    provider = db.get(AiProvider, provider_id)
    if not provider:
        return
    if status == "connected":
        provider.status = "healthy"
    elif status == "error":
        provider.status = "degraded"
    else:
        provider.status = "offline"


@router.get("/db", response_model=AiDbConnectionResponse)
def get_db_connection() -> AiDbConnectionResponse:
    db_info = check_database_connection()
    parsed = urlparse(settings.database_url.replace("+psycopg", ""))
    host = parsed.hostname or "127.0.0.1"
    port = parsed.port or 5432
    return AiDbConnectionResponse(
        data=AiDbConnectionRead(
            ok=db_info.get("ok") is True,
            version=str(db_info.get("version") or ""),
            database=parsed.path.lstrip("/") or "moharaznx",
            host=f"{host}:{port}",
        )
    )


@router.get("", response_model=AiApiConnectionListResponse)
def list_connections(db: Session = Depends(get_db)) -> AiApiConnectionListResponse:
    rows = db.query(AiApiConnection).order_by(AiApiConnection.provider_name.asc()).all()
    data = [_to_read(row) for row in rows]
    connected_count = sum(1 for row in rows if row.status == "connected")
    return AiApiConnectionListResponse(
        data=data,
        meta=AiApiConnectionListMeta(count=len(data), connected_count=connected_count),
    )


@router.get("/{connection_id}", response_model=AiApiConnectionResponse)
def get_connection(connection_id: str, db: Session = Depends(get_db)) -> AiApiConnectionResponse:
    row = db.get(AiApiConnection, connection_id)
    if not row:
        raise HTTPException(status_code=404, detail="Connection not found")
    return AiApiConnectionResponse(data=_to_read(row))


@router.patch("/{connection_id}", response_model=AiApiConnectionResponse)
def update_connection(
    connection_id: str,
    payload: AiApiConnectionUpdate,
    db: Session = Depends(get_db),
    _user: AuthUser = Depends(require_write_access),
) -> AiApiConnectionResponse:
    row = db.get(AiApiConnection, connection_id)
    if not row:
        raise HTTPException(status_code=404, detail="Connection not found")

    if payload.api_key is not None:
        row.api_key = payload.api_key.strip()
        row.api_key_hint = _mask_hint(row.api_key)

    if payload.base_url is not None:
        row.base_url = payload.base_url.strip()

    if payload.test_connect:
        next_status = _validate_connection(row, db)
        row.status = next_status
        if next_status == "connected":
            row.last_connected_at = datetime.utcnow()
        _sync_provider_status(db, row.provider_id, next_status)

    db.commit()
    db.refresh(row)
    return AiApiConnectionResponse(data=_to_read(row))
