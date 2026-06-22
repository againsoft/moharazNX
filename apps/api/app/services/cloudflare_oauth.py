from __future__ import annotations

import hashlib
import hmac
import secrets
import time
from typing import Optional
from urllib.parse import urlencode

import httpx

from app.config import get_settings

CF_AUTH_URL = "https://dash.cloudflare.com/oauth2/auth"
CF_TOKEN_URL = "https://dash.cloudflare.com/oauth2/token"
CF_API = "https://api.cloudflare.com/client/v4"
STATE_TTL_SECONDS = 600


class CloudflareOAuthError(Exception):
    pass


def oauth_is_configured() -> bool:
    settings = get_settings()
    return bool(
        settings.cloudflare_oauth_client_id.strip()
        and settings.cloudflare_oauth_client_secret.strip()
        and settings.cloudflare_oauth_redirect_uri.strip()
    )


def _state_secret() -> str:
    settings = get_settings()
    secret = settings.cloudflare_oauth_client_secret.strip()
    if secret:
        return secret
    return "moharaznx-dev-oauth-state"


def create_oauth_state() -> str:
    ts = int(time.time())
    nonce = secrets.token_urlsafe(16)
    payload = f"{ts}.{nonce}"
    sig = hmac.new(_state_secret().encode(), payload.encode(), hashlib.sha256).hexdigest()
    return f"{payload}.{sig}"


def verify_oauth_state(state: str) -> bool:
    parts = state.split(".")
    if len(parts) != 3:
        return False
    ts_str, _nonce, sig = parts
    try:
        ts = int(ts_str)
    except ValueError:
        return False
    if time.time() - ts > STATE_TTL_SECONDS:
        return False
    payload = f"{parts[0]}.{parts[1]}"
    expected = hmac.new(_state_secret().encode(), payload.encode(), hashlib.sha256).hexdigest()
    return hmac.compare_digest(sig, expected)


def build_authorize_url(state: str) -> str:
    settings = get_settings()
    params = {
        "client_id": settings.cloudflare_oauth_client_id.strip(),
        "redirect_uri": settings.cloudflare_oauth_redirect_uri.strip(),
        "response_type": "code",
        "scope": settings.cloudflare_oauth_scopes.strip(),
        "state": state,
    }
    return f"{CF_AUTH_URL}?{urlencode(params)}"


def web_redirect_base() -> str:
    settings = get_settings()
    origin = settings.cloudflare_oauth_success_redirect.strip()
    if origin:
        return origin.rstrip("/")
    return settings.cors_origins.split(",")[0].strip().rstrip("/")


async def exchange_authorization_code(code: str) -> dict:
    settings = get_settings()
    async with httpx.AsyncClient(timeout=20.0) as client:
        res = await client.post(
            CF_TOKEN_URL,
            data={
                "grant_type": "authorization_code",
                "code": code,
                "redirect_uri": settings.cloudflare_oauth_redirect_uri.strip(),
                "client_id": settings.cloudflare_oauth_client_id.strip(),
                "client_secret": settings.cloudflare_oauth_client_secret.strip(),
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )
        body = res.json()
        if res.status_code >= 400 or "access_token" not in body:
            detail = body.get("error_description") or body.get("error") or "Token exchange failed"
            raise CloudflareOAuthError(str(detail))
        return body


async def fetch_primary_account_id(access_token: str) -> tuple[str, str]:
    async with httpx.AsyncClient(timeout=20.0) as client:
        res = await client.get(
            f"{CF_API}/accounts",
            headers={"Authorization": f"Bearer {access_token}"},
        )
        body = res.json()
        if not body.get("success"):
            raise CloudflareOAuthError("Could not load Cloudflare accounts")
        accounts = body.get("result", [])
        if not accounts:
            raise CloudflareOAuthError("No Cloudflare accounts found for this user")
        account = accounts[0]
        return str(account.get("id") or ""), str(account.get("name") or "Cloudflare Account")
