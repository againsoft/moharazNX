from __future__ import annotations

from datetime import datetime
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.commerce_order import CommerceOrder, dump_json
from app.models.commerce_order_item import CommerceOrderItem
from app.models.storefront_cart import StorefrontCart, StorefrontCartItem
from app.routers.storefront_cart import get_cart_context
from app.schemas.storefront import (
    StorefrontCheckoutCreate,
    StorefrontCheckoutRead,
    StorefrontCheckoutResponse,
)
from app.security import new_session_token

router = APIRouter(prefix="/checkout", tags=["storefront-checkout"])

FREE_SHIPPING_THRESHOLD = Decimal("2000")
SHIPPING_RATES = {
    "standard": Decimal("80"),
    "express": Decimal("150"),
}

PAYMENT_LABELS = {
    "cod": "Cash on Delivery",
    "bkash": "bKash",
    "card": "Credit / Debit Card",
    "bank": "Bank Transfer",
}


def _shipping_amount(method: str, subtotal: Decimal) -> Decimal:
    if subtotal >= FREE_SHIPPING_THRESHOLD:
        return Decimal("0")
    return SHIPPING_RATES.get(method, SHIPPING_RATES["standard"])


def _order_number() -> str:
    suffix = new_session_token()[:8].upper()
    return f"ORD-{suffix}"


@router.post("", response_model=StorefrontCheckoutResponse)
def submit_checkout(
    payload: StorefrontCheckoutCreate,
    cart: StorefrontCart = Depends(get_cart_context),
    db: Session = Depends(get_db),
) -> StorefrontCheckoutResponse:
    if not cart.items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    subtotal = sum((item.unit_price * item.quantity for item in cart.items), Decimal("0"))
    shipping_amount = _shipping_amount(payload.shipping_method, subtotal)
    grand_total = subtotal + shipping_amount

    customer_name = f"{payload.first_name.strip()} {payload.last_name.strip()}".strip()
    payment_key = payload.payment_method.lower()
    payment_method = PAYMENT_LABELS.get(payment_key, payload.payment_method)

    order = CommerceOrder(
        order_number=_order_number(),
        order_date=datetime.utcnow(),
        status="pending",
        payment_status="unpaid",
        shipment_status="unfulfilled",
        source="Web Store",
        customer_name=customer_name,
        customer_phone=payload.phone.strip(),
        customer_email=payload.email.strip().lower(),
        billing_address=payload.address.strip(),
        billing_city=payload.district.strip() or None,
        billing_region=payload.district.strip() or None,
        billing_country="Bangladesh",
        shipping_address=payload.address.strip(),
        shipping_city=payload.district.strip() or None,
        shipping_region=payload.district.strip() or None,
        shipping_country="Bangladesh",
        payment_method=payment_method,
        paid_amount=Decimal("0"),
        due_amount=grand_total,
        shipping_cost=shipping_amount,
        subtotal=subtotal,
        shipping_amount=shipping_amount,
        grand_total=grand_total,
        notes=payload.notes,
        timeline_json=dump_json(
            [
                {
                    "id": "evt_checkout",
                    "type": "created",
                    "label": "Order placed",
                    "at": datetime.utcnow().isoformat(),
                },
            ],
        ),
    )
    db.add(order)
    db.flush()

    for idx, item in enumerate(cart.items):
        line_total = item.unit_price * item.quantity
        db.add(
            CommerceOrderItem(
                order_id=order.id,
                product_id=item.product_id,
                sku=item.slug,
                name=item.name,
                image_url=item.thumbnail,
                quantity=item.quantity,
                unit_price=item.unit_price,
                line_total=line_total,
                sort_order=idx,
            ),
        )

    db.query(StorefrontCartItem).filter(StorefrontCartItem.cart_id == cart.id).delete()
    db.commit()

    return StorefrontCheckoutResponse(
        data=StorefrontCheckoutRead(
            id=order.id,
            order_number=order.order_number,
            email=order.customer_email,
            grand_total=grand_total,
            payment_method=payment_method,
        ),
    )
