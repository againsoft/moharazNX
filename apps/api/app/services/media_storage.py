from __future__ import annotations

from pathlib import Path
from typing import Optional, Tuple

from sqlalchemy.orm import Session

from app.config import get_settings
from app.models.cloudflare_plugin import CloudflarePlugin
from app.services.cloudflare_client import public_r2_url, should_use_r2, upload_to_r2

UPLOAD_DIR = Path(__file__).resolve().parents[2] / "uploads" / "media"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

DEFAULT_PLUGIN_ID = "cf-default"


def get_cloudflare_plugin(db: Session) -> Optional[CloudflarePlugin]:
    return db.get(CloudflarePlugin, DEFAULT_PLUGIN_ID)


def save_media_bytes(
    db: Session,
    stored: str,
    content: bytes,
    mime: str,
) -> Tuple[str, str, str]:
    """Returns (public_url, local_path, provider)."""
    row = get_cloudflare_plugin(db)
    if should_use_r2(row):
        key = f"media/{stored}"
        upload_to_r2(row, key, content, mime)
        return public_r2_url(row, key), f"r2://{row.r2_bucket}/{key}", "r2"

    dest = UPLOAD_DIR / stored
    dest.write_bytes(content)
    settings = get_settings()
    url = f"http://{settings.api_host}:{settings.api_port}/uploads/media/{stored}"
    return url, f"/storage/media/uploads/{stored}", "direct"
