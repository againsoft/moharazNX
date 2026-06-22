from __future__ import annotations

import json
from dataclasses import dataclass
from typing import Any, Literal

import httpx
from sqlalchemy.orm import Session

from app.config import get_settings
from app.models.ai_api_connection import AiApiConnection
from app.models.ai_provider import AiProvider
from app.services.chat_order_service import CHAT_ORDER_TOOLS, execute_chat_order_tool
from app.services.customer_support_faq import build_system_prompt

ChatRole = Literal["user", "assistant"]


@dataclass
class ChatTurn:
    role: ChatRole
    content: str


@dataclass
class LlmConfig:
    provider_id: str
    provider_name: str
    api_key: str
    base_url: str
    model: str


class LlmError(Exception):
    pass


@dataclass
class ChatToolResult:
    content: str
    cart_token: str = ""
    order_number: str | None = None
    products: list[dict[str, Any]] | None = None


DEFAULT_MODELS = {
    "openai": "gpt-4o-mini",
    "anthropic": "claude-3-5-haiku-latest",
    "google": "gemini-2.0-flash",
    "local": "llama3.2",
}

PROVIDER_PRIORITY = ("openai", "anthropic", "google", "local")


def _pick_model(provider: AiProvider | None, provider_id: str) -> str:
    if provider and provider.models:
        return provider.models[0]
    return DEFAULT_MODELS.get(provider_id, "gpt-4o-mini")


def resolve_llm_config(db: Session) -> LlmConfig | None:
    settings = get_settings()
    rows = (
        db.query(AiApiConnection)
        .filter(AiApiConnection.status == "connected")
        .order_by(AiApiConnection.provider_name.asc())
        .all()
    )
    by_provider = {row.provider_id: row for row in rows}

    for provider_id in PROVIDER_PRIORITY:
        row = by_provider.get(provider_id)
        if not row:
            continue
        if provider_id != "local" and len(row.api_key.strip()) < 8:
            continue
        if provider_id == "local" and not row.base_url.strip():
            continue
        provider = db.get(AiProvider, provider_id)
        return LlmConfig(
            provider_id=provider_id,
            provider_name=row.provider_name,
            api_key=row.api_key.strip(),
            base_url=row.base_url.strip(),
            model=_pick_model(provider, provider_id),
        )

    if settings.openai_api_key.strip():
        return LlmConfig(
            provider_id="openai",
            provider_name="OpenAI",
            api_key=settings.openai_api_key.strip(),
            base_url="",
            model=DEFAULT_MODELS["openai"],
        )

    return None


def _openai_chat(config: LlmConfig, system: str, history: list[ChatTurn], message: str) -> str:
    base = (config.base_url or "https://api.openai.com/v1").rstrip("/")
    messages = [{"role": "system", "content": system}]
    for turn in history[-8:]:
        messages.append({"role": turn.role, "content": turn.content})
    messages.append({"role": "user", "content": message})

    with httpx.Client(timeout=45.0) as client:
        res = client.post(
            f"{base}/chat/completions",
            headers={"Authorization": f"Bearer {config.api_key}", "Content-Type": "application/json"},
            json={"model": config.model, "messages": messages, "temperature": 0.4, "max_tokens": 800},
        )
    if res.status_code >= 400:
        raise LlmError(f"OpenAI error {res.status_code}: {res.text[:200]}")
    data = res.json()
    return str(data["choices"][0]["message"]["content"]).strip()


def _anthropic_chat(config: LlmConfig, system: str, history: list[ChatTurn], message: str) -> str:
    messages = [{"role": turn.role, "content": turn.content} for turn in history[-8:]]
    messages.append({"role": "user", "content": message})

    with httpx.Client(timeout=45.0) as client:
        res = client.post(
            "https://api.anthropic.com/v1/messages",
            headers={
                "x-api-key": config.api_key,
                "anthropic-version": "2023-06-01",
                "Content-Type": "application/json",
            },
            json={
                "model": config.model,
                "max_tokens": 800,
                "system": system,
                "messages": messages,
            },
        )
    if res.status_code >= 400:
        raise LlmError(f"Anthropic error {res.status_code}: {res.text[:200]}")
    data = res.json()
    parts = data.get("content") or []
    text = "".join(part.get("text", "") for part in parts if part.get("type") == "text")
    return text.strip()


def _google_chat(config: LlmConfig, system: str, history: list[ChatTurn], message: str) -> str:
    model = config.model if config.model.startswith("gemini") else DEFAULT_MODELS["google"]
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
    contents = []
    for turn in history[-8:]:
        role = "model" if turn.role == "assistant" else "user"
        contents.append({"role": role, "parts": [{"text": turn.content}]})
    contents.append({"role": "user", "parts": [{"text": message}]})

    with httpx.Client(timeout=45.0) as client:
        res = client.post(
            url,
            params={"key": config.api_key},
            json={
                "systemInstruction": {"parts": [{"text": system}]},
                "contents": contents,
                "generationConfig": {"temperature": 0.4, "maxOutputTokens": 800},
            },
        )
    if res.status_code >= 400:
        raise LlmError(f"Gemini error {res.status_code}: {res.text[:200]}")
    data = res.json()
    candidates = data.get("candidates") or []
    if not candidates:
        raise LlmError("Gemini returned no candidates")
    parts = candidates[0].get("content", {}).get("parts") or []
    return "".join(part.get("text", "") for part in parts).strip()


def _local_chat(config: LlmConfig, system: str, history: list[ChatTurn], message: str) -> str:
    base = config.base_url.rstrip("/")
    messages = [{"role": "system", "content": system}]
    for turn in history[-8:]:
        messages.append({"role": turn.role, "content": turn.content})
    messages.append({"role": "user", "content": message})

    with httpx.Client(timeout=90.0) as client:
        res = client.post(
            f"{base}/api/chat",
            json={"model": config.model, "messages": messages, "stream": False},
        )
    if res.status_code >= 400:
        raise LlmError(f"Ollama error {res.status_code}: {res.text[:200]}")
    data = res.json()
    return str(data.get("message", {}).get("content", "")).strip()


def ping_llm(config: LlmConfig) -> None:
    """Minimal call to verify credentials."""
    reply = chat_with_llm(config, [], "Reply with exactly: OK")
    if not reply:
        raise LlmError("Empty response from provider")


def chat_with_llm(
    config: LlmConfig,
    history: list[ChatTurn],
    message: str,
) -> str:
    system = build_system_prompt()
    if config.provider_id == "openai":
        return _openai_chat(config, system, history, message)
    if config.provider_id == "anthropic":
        return _anthropic_chat(config, system, history, message)
    if config.provider_id == "google":
        return _google_chat(config, system, history, message)
    if config.provider_id == "local":
        return _local_chat(config, system, history, message)
    raise LlmError(f"Unsupported provider: {config.provider_id}")


def chat_with_order_tools(
    config: LlmConfig,
    db: Session,
    cart_token: str | None,
    history: list[ChatTurn],
    message: str,
) -> ChatToolResult:
    if config.provider_id != "openai":
        content = chat_with_llm(config, history, message)
        return ChatToolResult(content=content, cart_token=cart_token or "")

    system = build_system_prompt()
    base = (config.base_url or "https://api.openai.com/v1").rstrip("/")
    messages: list[dict[str, Any]] = [{"role": "system", "content": system}]
    for turn in history[-10:]:
        messages.append({"role": turn.role, "content": turn.content})
    messages.append({"role": "user", "content": message})

    current_token = cart_token or ""
    order_number: str | None = None
    last_products: list[dict[str, Any]] | None = None

    with httpx.Client(timeout=90.0) as client:
        for _ in range(6):
            res = client.post(
                f"{base}/chat/completions",
                headers={"Authorization": f"Bearer {config.api_key}", "Content-Type": "application/json"},
                json={
                    "model": config.model,
                    "messages": messages,
                    "tools": CHAT_ORDER_TOOLS,
                    "tool_choice": "auto",
                    "temperature": 0.3,
                    "max_tokens": 1000,
                },
            )
            if res.status_code >= 400:
                raise LlmError(f"OpenAI error {res.status_code}: {res.text[:200]}")
            data = res.json()
            choice = data["choices"][0]["message"]
            tool_calls = choice.get("tool_calls") or []

            if not tool_calls:
                content = str(choice.get("content") or "").strip()
                return ChatToolResult(
                    content=content,
                    cart_token=current_token,
                    order_number=order_number,
                    products=last_products,
                )

            messages.append(choice)
            for tool_call in tool_calls:
                fn = tool_call.get("function") or {}
                name = str(fn.get("name", ""))
                try:
                    args = json.loads(fn.get("arguments") or "{}")
                except json.JSONDecodeError:
                    args = {}
                result_json, current_token, placed = execute_chat_order_tool(
                    db, current_token or None, name, args,
                )
                if placed:
                    order_number = placed
                if name == "search_products":
                    try:
                        parsed = json.loads(result_json)
                        last_products = parsed.get("products")
                    except json.JSONDecodeError:
                        pass
                elif name == "list_products":
                    try:
                        parsed = json.loads(result_json)
                        last_products = parsed.get("products")
                    except json.JSONDecodeError:
                        pass
                messages.append(
                    {
                        "role": "tool",
                        "tool_call_id": tool_call["id"],
                        "content": result_json,
                    },
                )

    raise LlmError("Tool loop exceeded max rounds")
