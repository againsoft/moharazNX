from __future__ import annotations

import logging

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.storefront import StorefrontCheckoutCreate
from app.schemas.storefront_chat import (
    StorefrontChatLink,
    StorefrontChatProduct,
    StorefrontChatRead,
    StorefrontChatRequest,
    StorefrontChatResponse,
    StorefrontChatStatusRead,
    StorefrontChatStatusResponse,
)
from app.services.chat_order_intent import run_chat_action, try_catalog_intent, try_order_intent_fallback
from app.services.customer_support_faq import CONTACT_BLOCK, FAQ_SECTIONS, STORE_NAME
from app.services.llm_client import ChatTurn, LlmError, chat_with_llm, chat_with_order_tools, resolve_llm_config

router = APIRouter(prefix="/chat", tags=["storefront-chat"])
logger = logging.getLogger(__name__)


def _keyword_fallback(message: str) -> str:
    text = message.lower()
    for section in FAQ_SECTIONS:
        for q, a in section["items"]:
            q_words = [w for w in q.lower().split() if len(w) > 3]
            if any(w in text for w in q_words):
                return a
    if any(w in text for w in ("contact", "phone", "email", "call", "যোগাযোগ", "ফোন")):
        return CONTACT_BLOCK
    if any(w in text for w in ("hello", "hi", "hey", "salam", "হ্যালো", "সালাম")):
        return (
            f"Hi! I'm {STORE_NAME} assistant. Tell me a product name — I'll show stock and place your order in chat."
        )
    return (
        f"I'm having trouble answering that right now. Please contact us:\n{CONTACT_BLOCK}\n"
        "Or visit /faq for common questions."
    )


def _build_links(order_number: str | None) -> list[StorefrontChatLink]:
    links: list[StorefrontChatLink] = []
    if order_number:
        links.append(StorefrontChatLink(label="Track order", href="/track"))
    links.append(StorefrontChatLink(label="View cart", href="/cart"))
    links.append(StorefrontChatLink(label="Browse products", href="/products"))
    return links


def _products_from_raw(raw: list[dict] | None) -> list[StorefrontChatProduct] | None:
    if not raw:
        return None
    return [
        StorefrontChatProduct(
            id=str(p["id"]),
            name=str(p["name"]),
            slug=str(p.get("slug", "")),
            brand=str(p.get("brand", "")),
            price_bdt=float(p.get("price_bdt", 0)),
            stock=int(p.get("stock", 0)),
            in_stock=bool(p.get("in_stock", False)),
        )
        for p in raw
    ]


def _response_from_action(
    result: dict,
    mode: str,
    provider: str | None = None,
    cart_token: str | None = None,
) -> StorefrontChatResponse:
    return StorefrontChatResponse(
        data=StorefrontChatRead(
            content=str(result.get("content", "")),
            mode=mode,  # type: ignore[arg-type]
            provider=provider,
            cart_token=result.get("cart_token") or cart_token,
            order_number=result.get("order_number"),
            links=_build_links(result.get("order_number")),
            products=_products_from_raw(result.get("products")),
        ),
    )


@router.get("/status", response_model=StorefrontChatStatusResponse)
def chat_status(db: Session = Depends(get_db)) -> StorefrontChatStatusResponse:
    config = resolve_llm_config(db)
    return StorefrontChatStatusResponse(
        data=StorefrontChatStatusRead(
            live=config is not None,
            provider=config.provider_name if config else None,
            model=config.model if config else None,
            can_order=True,
        ),
    )


@router.post("", response_model=StorefrontChatResponse)
def chat(
    payload: StorefrontChatRequest,
    db: Session = Depends(get_db),
) -> StorefrontChatResponse:
    message = payload.message.strip()

    if payload.action:
        checkout = None
        if payload.checkout:
            email = payload.checkout.email.strip() or f"{payload.checkout.phone.replace(' ', '')}@chat.moharaznx.local"
            checkout = StorefrontCheckoutCreate(
                email=email,
                first_name=payload.checkout.first_name,
                last_name=payload.checkout.last_name,
                phone=payload.checkout.phone,
                address=payload.checkout.address,
                district=payload.checkout.district,
                payment_method=payload.checkout.payment_method,
                shipping_method=payload.checkout.shipping_method,
                notes=payload.checkout.notes,
            )
        result = run_chat_action(
            db,
            payload.action,
            payload.cart_token,
            message or payload.query or "",
            product_id=payload.product_id,
            query=payload.query,
            quantity=payload.quantity,
            checkout=checkout,
        )
        return _response_from_action(result, mode="action", cart_token=payload.cart_token)

    if not message:
        return StorefrontChatResponse(
            data=StorefrontChatRead(
                content="Please type a message or pick a product.",
                mode="fallback",
                links=_build_links(None),
            ),
        )

    config = resolve_llm_config(db)
    history = [ChatTurn(role=turn.role, content=turn.content) for turn in payload.history]

    catalog = try_catalog_intent(db, message)
    if catalog:
        return _response_from_action(catalog, mode="action", cart_token=payload.cart_token)

    if config:
        try:
            result = chat_with_order_tools(
                config,
                db,
                payload.cart_token,
                history,
                message,
            )
            if result.content:
                return StorefrontChatResponse(
                    data=StorefrontChatRead(
                        content=result.content,
                        mode="live",
                        provider=config.provider_name,
                        cart_token=result.cart_token or payload.cart_token,
                        order_number=result.order_number,
                        links=_build_links(result.order_number),
                        products=_products_from_raw(result.products),
                    ),
                )
        except LlmError as exc:
            logger.warning("LLM chat failed (%s): %s", config.provider_id, exc)
        except Exception:
            logger.exception("Unexpected LLM chat failure (%s)", config.provider_id if config else "?")

    intent = try_order_intent_fallback(db, message, payload.cart_token)
    if intent:
        return _response_from_action(intent, mode="fallback", cart_token=payload.cart_token)

    if config:
        try:
            content = chat_with_llm(config, history, message)
            if content:
                return StorefrontChatResponse(
                    data=StorefrontChatRead(
                        content=content,
                        mode="live",
                        provider=config.provider_name,
                        cart_token=payload.cart_token,
                        links=_build_links(None),
                    ),
                )
        except LlmError:
            pass

    return StorefrontChatResponse(
        data=StorefrontChatRead(
            content=_keyword_fallback(message),
            mode="fallback",
            cart_token=payload.cart_token,
            links=_build_links(None),
        ),
    )
