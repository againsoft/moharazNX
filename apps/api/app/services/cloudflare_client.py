from __future__ import annotations

from dataclasses import dataclass
from typing import Optional

import httpx

from app.models.cloudflare_plugin import CloudflarePlugin

CF_API = "https://api.cloudflare.com/client/v4"


class CloudflareError(Exception):
    pass


@dataclass
class CloudflareVerifyResult:
    status: str
    message: str = ""


def _mask_hint(value: str) -> str:
    if not value:
        return ""
    if len(value) <= 4:
        return "****"
    return f"…{value[-4:]}"


def _cf_headers(token: str) -> dict[str, str]:
    return {
        "Authorization": f"Bearer {token.strip()}",
        "Content-Type": "application/json",
    }


async def verify_account_token(account_id: str, api_token: str) -> CloudflareVerifyResult:
    token = api_token.strip()
    if len(token) < 8:
        return CloudflareVerifyResult("disconnected", "API token is required")
    if not account_id.strip():
        return CloudflareVerifyResult("disconnected", "Account ID is required")

    async with httpx.AsyncClient(timeout=20.0) as client:
        # Try account endpoint directly — avoids requiring "User: API Tokens: Read" permission
        account_res = await client.get(
            f"{CF_API}/accounts/{account_id.strip()}",
            headers=_cf_headers(token),
        )
        account_body = account_res.json()
        if account_res.status_code == 200 and account_body.get("success"):
            return CloudflareVerifyResult("connected", "Cloudflare account verified")

        # Fallback: token verify endpoint (requires API Tokens: Read permission)
        verify_res = await client.get(f"{CF_API}/user/tokens/verify", headers=_cf_headers(token))
        verify_body = verify_res.json()
        if verify_body.get("success"):
            return CloudflareVerifyResult("connected", "Cloudflare account verified")

        errors = account_body.get("errors", [])
        msg = errors[0].get("message", "Invalid token or Account ID") if errors else "Invalid token or Account ID"
        return CloudflareVerifyResult("error", msg)


async def verify_r2_bucket(row: CloudflarePlugin) -> CloudflareVerifyResult:
    if row.account_status != "connected":
        return CloudflareVerifyResult("disconnected", "Verify account first")
    if not row.r2_bucket.strip():
        return CloudflareVerifyResult("disconnected", "R2 bucket name is required")
    if not row.r2_access_key_id.strip() or not row.r2_secret_access_key.strip():
        return CloudflareVerifyResult("disconnected", "R2 access keys are required")

    token = row.api_token.strip()
    async with httpx.AsyncClient(timeout=20.0) as client:
        res = await client.get(
            f"{CF_API}/accounts/{row.account_id.strip()}/r2/buckets",
            headers=_cf_headers(token),
        )
        body = res.json()
        if not body.get("success"):
            return CloudflareVerifyResult("error", "Could not list R2 buckets")

        buckets = [b.get("name") for b in body.get("result", {}).get("buckets", [])]
        if row.r2_bucket.strip() not in buckets:
            return CloudflareVerifyResult("error", f"Bucket '{row.r2_bucket}' not found")

    try:
        import boto3
        from botocore.exceptions import ClientError

        s3 = boto3.client(
            "s3",
            endpoint_url=f"https://{row.account_id.strip()}.r2.cloudflarestorage.com",
            aws_access_key_id=row.r2_access_key_id.strip(),
            aws_secret_access_key=row.r2_secret_access_key.strip(),
            region_name="auto",
        )
        s3.head_bucket(Bucket=row.r2_bucket.strip())
    except ImportError:
        return CloudflareVerifyResult("connected", "Bucket found (upload SDK pending)")
    except ClientError as exc:
        code = exc.response.get("Error", {}).get("Code", "")
        if code in {"403", "AccessDenied"}:
            return CloudflareVerifyResult("error", "R2 keys cannot access this bucket")
        return CloudflareVerifyResult("error", "R2 connection failed")
    except Exception:
        return CloudflareVerifyResult("error", "R2 connection failed")

    return CloudflareVerifyResult("connected", "R2 storage connected")


async def verify_images(row: CloudflarePlugin) -> CloudflareVerifyResult:
    if row.account_status != "connected":
        return CloudflareVerifyResult("disconnected", "Verify account first")
    token = (row.images_api_token or row.api_token).strip()
    account_hash = row.images_account_hash.strip()
    if not account_hash:
        return CloudflareVerifyResult("disconnected", "Images account hash is required")
    if len(token) < 8:
        return CloudflareVerifyResult("disconnected", "Images API token is required")

    async with httpx.AsyncClient(timeout=20.0) as client:
        res = await client.get(
            f"{CF_API}/accounts/{row.account_id.strip()}/images/v1/stats",
            headers=_cf_headers(token),
        )
        body = res.json()
        if not body.get("success"):
            return CloudflareVerifyResult("error", "Cloudflare Images API check failed")

    return CloudflareVerifyResult("connected", "Cloudflare Images connected")


def upload_to_r2(row: CloudflarePlugin, key: str, content: bytes, mime: str) -> None:
    import boto3

    s3 = boto3.client(
        "s3",
        endpoint_url=f"https://{row.account_id.strip()}.r2.cloudflarestorage.com",
        aws_access_key_id=row.r2_access_key_id.strip(),
        aws_secret_access_key=row.r2_secret_access_key.strip(),
        region_name="auto",
    )
    s3.put_object(
        Bucket=row.r2_bucket.strip(),
        Key=key,
        Body=content,
        ContentType=mime,
    )


def public_r2_url(row: CloudflarePlugin, key: str) -> str:
    base = row.r2_public_base_url.strip().rstrip("/")
    if base:
        return f"{base}/{key}"
    return f"https://{row.account_id.strip()}.r2.cloudflarestorage.com/{row.r2_bucket.strip()}/{key}"


def should_use_r2(row: Optional[CloudflarePlugin]) -> bool:
    if not row:
        return False
    return (
        row.installed
        and row.enabled
        and row.account_status == "connected"
        and row.media_storage == "r2"
        and row.r2_status == "connected"
        and bool(row.r2_bucket.strip())
    )
