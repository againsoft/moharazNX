from __future__ import annotations

from datetime import datetime

from sqlalchemy.orm import Session

from app.config import get_settings
from app.models.ai_api_connection import AiApiConnection
from app.models.ai_provider import AiProvider
from app.services.llm_client import LlmConfig, LlmError, _pick_model, ping_llm


def _mask_hint(api_key: str) -> str:
    if not api_key:
        return ""
    if len(api_key) <= 4:
        return "****"
    return f"…{api_key[-4:]}"


def sync_env_openai_connection(db: Session, *, test_connect: bool = True) -> str:
    """Copy OPENAI_API_KEY from env into conn-openai and optionally validate."""
    settings = get_settings()
    api_key = settings.openai_api_key.strip()
    if len(api_key) < 8:
        return "skipped"

    row = db.get(AiApiConnection, "conn-openai")
    if not row:
        return "missing"

    row.api_key = api_key
    row.api_key_hint = _mask_hint(api_key)

    if not test_connect:
        db.commit()
        return "saved"

    provider = db.get(AiProvider, "openai")
    config = LlmConfig(
        provider_id="openai",
        provider_name=row.provider_name,
        api_key=api_key,
        base_url=row.base_url.strip(),
        model=_pick_model(provider, "openai"),
    )

    try:
        ping_llm(config)
        row.status = "connected"
        row.last_connected_at = datetime.utcnow()
        if provider:
            provider.status = "healthy"
        db.commit()
        return "connected"
    except LlmError:
        row.status = "error"
        if provider:
            provider.status = "degraded"
        db.commit()
        return "error"
