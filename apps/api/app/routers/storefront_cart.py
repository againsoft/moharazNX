from __future__ import annotations

from decimal import Decimal
from typing import Optional

from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models.catalog_product import CatalogProduct
from app.models.storefront_cart import StorefrontCart, StorefrontCartItem
from app.schemas.storefront import (
    StorefrontCartItemCreate,
    StorefrontCartItemRead,
    StorefrontCartItemUpdate,
    StorefrontCartRead,
    StorefrontCartResponse,
)
from app.security import new_session_token

router = APIRouter(prefix="/cart", tags=["storefront-cart"])

CART_HEADER = "X-Cart-Token"


def _cart_read(cart: StorefrontCart) -> StorefrontCartRead:
    items = [
        StorefrontCartItemRead(
            id=item.id,
            product_id=item.product_id,
            slug=item.slug,
            name=item.name,
            thumbnail=item.thumbnail,
            unit_price=item.unit_price,
            compare_at_price=item.compare_at_price,
            quantity=item.quantity,
        )
        for item in cart.items
    ]
    subtotal = sum((item.unit_price * item.quantity for item in cart.items), Decimal("0"))
    item_count = sum(item.quantity for item in cart.items)
    return StorefrontCartRead(
        cart_token=cart.cart_token,
        items=items,
        item_count=item_count,
        subtotal=subtotal,
    )


def _load_cart(db: Session, cart_id: str) -> StorefrontCart:
    cart = (
        db.query(StorefrontCart)
        .options(joinedload(StorefrontCart.items))
        .filter(StorefrontCart.id == cart_id)
        .first()
    )
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
    return cart


def _get_or_create_cart(db: Session, cart_token: Optional[str]) -> StorefrontCart:
    if cart_token:
        cart = (
            db.query(StorefrontCart)
            .options(joinedload(StorefrontCart.items))
            .filter(StorefrontCart.cart_token == cart_token)
            .first()
        )
        if cart:
            return cart
    cart = StorefrontCart(cart_token=new_session_token())
    db.add(cart)
    db.commit()
    return _load_cart(db, cart.id)


def get_cart_context(
    x_cart_token: Optional[str] = Header(default=None, alias=CART_HEADER),
    db: Session = Depends(get_db),
) -> StorefrontCart:
    return _get_or_create_cart(db, x_cart_token)


@router.get("", response_model=StorefrontCartResponse)
def get_cart(cart: StorefrontCart = Depends(get_cart_context)) -> StorefrontCartResponse:
    return StorefrontCartResponse(data=_cart_read(cart))


@router.post("/items", response_model=StorefrontCartResponse)
def add_cart_item(
    payload: StorefrontCartItemCreate,
    cart: StorefrontCart = Depends(get_cart_context),
    db: Session = Depends(get_db),
) -> StorefrontCartResponse:
    product = (
        db.query(CatalogProduct)
        .filter(CatalogProduct.id == payload.product_id, CatalogProduct.status == "published")
        .first()
    )
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if product.stock <= 0:
        raise HTTPException(status_code=400, detail="Product out of stock")

    existing = (
        db.query(StorefrontCartItem)
        .filter(StorefrontCartItem.cart_id == cart.id, StorefrontCartItem.product_id == product.id)
        .first()
    )
    if existing:
        existing.quantity = min(existing.quantity + payload.quantity, 99)
    else:
        db.add(
            StorefrontCartItem(
                cart_id=cart.id,
                product_id=product.id,
                slug=product.slug,
                name=product.name,
                thumbnail=product.thumbnail,
                unit_price=product.price,
                compare_at_price=product.compare_at_price,
                quantity=payload.quantity,
            ),
        )
    db.commit()
    return StorefrontCartResponse(data=_cart_read(_load_cart(db, cart.id)))


@router.patch("/items/{item_id}", response_model=StorefrontCartResponse)
def update_cart_item(
    item_id: str,
    payload: StorefrontCartItemUpdate,
    cart: StorefrontCart = Depends(get_cart_context),
    db: Session = Depends(get_db),
) -> StorefrontCartResponse:
    item = (
        db.query(StorefrontCartItem)
        .filter(StorefrontCartItem.id == item_id, StorefrontCartItem.cart_id == cart.id)
        .first()
    )
    if not item:
        raise HTTPException(status_code=404, detail="Cart item not found")

    if payload.quantity <= 0:
        db.delete(item)
    else:
        item.quantity = payload.quantity
    db.commit()
    return StorefrontCartResponse(data=_cart_read(_load_cart(db, cart.id)))


@router.delete("/items/{item_id}", response_model=StorefrontCartResponse)
def remove_cart_item(
    item_id: str,
    cart: StorefrontCart = Depends(get_cart_context),
    db: Session = Depends(get_db),
) -> StorefrontCartResponse:
    item = (
        db.query(StorefrontCartItem)
        .filter(StorefrontCartItem.id == item_id, StorefrontCartItem.cart_id == cart.id)
        .first()
    )
    if not item:
        raise HTTPException(status_code=404, detail="Cart item not found")
    db.delete(item)
    db.commit()
    return StorefrontCartResponse(data=_cart_read(_load_cart(db, cart.id)))
