#!/usr/bin/env python3
"""Create tables and seed catalog data for MoharazNX."""

from decimal import Decimal
from datetime import date, datetime
from typing import Dict, Optional

from sqlalchemy import text

from app.database import Base, SessionLocal, check_database_connection, engine
from app.models.auth_session import AuthSession
from app.models.auth_user import AuthUser
from app.models.storefront_cart import StorefrontCart, StorefrontCartItem
from app.models.catalog_attribute import CatalogAttribute
from app.models.catalog_attribute_group import CatalogAttributeGroup
from app.models.catalog_attribute_profile import CatalogAttributeProfile
from app.models.catalog_brand import CatalogBrand
from app.models.catalog_collection import CatalogCollection
from app.models.configurator_build import ConfiguratorBuild
from app.models.configurator_category import ConfiguratorCategory
from app.models.configurator_profile import ConfiguratorProfile
from app.models.configurator_template import ConfiguratorTemplate, dump_components
from app.models.catalog_filter import CatalogFilter
from app.models.catalog_category import CatalogCategory
from app.models.catalog_product import CatalogProduct
from app.models.catalog_product_attribute_value import CatalogProductAttributeValue
from app.models.catalog_product_media import CatalogProductMedia
from app.models.marketing_audience import MarketingAudience
from app.models.marketing_campaign import MarketingCampaign
from app.models.marketing_journey import MarketingJourney
from app.models.marketing_coupon import MarketingCoupon
from app.models.seo_meta_record import SeoMetaRecord, dump_json as dump_json_list_seo
from app.models.media import Media
from app.models.catalog_product_review import CatalogProductReview
from app.models.catalog_product_variant import CatalogProductVariant
from app.models.commerce_customer import CommerceCustomer
from app.models.ai_approval import AiApproval
from app.models.ai_audit_log import AiAuditLog
from app.models.cloudflare_plugin import CloudflarePlugin
from app.models.ai_api_connection import AiApiConnection
from app.models.ai_provider import AiProvider
from app.models.ai_agent import AiAgent
from app.models.ai_tool import AiTool
from app.models.commerce_supplier import CommerceSupplier, dump_json as supplier_dump_json
from app.models.commerce_order import CommerceOrder, dump_json
from app.models.commerce_order_item import CommerceOrderItem
from app.models.commerce_order_return import CommerceOrderReturn
from app.models.commerce_order_refund import CommerceOrderRefund
from app.models.inventory_stock_level import InventoryStockLevel
from app.models.inventory_warehouse import InventoryWarehouse
from app.schemas.attribute_profile import dump_json_list
from app.security import hash_password
from scripts.auth_seed_data import AUTH_USERS_SEED
from scripts.meta_seed_data import META_SEED
from scripts.journey_seed_data import JOURNEY_SEED
from scripts.audience_seed_data import AUDIENCE_SEED
from scripts.campaign_seed_data import CAMPAIGN_SEED
from scripts.coupon_seed_data import COUPON_SEED
from scripts.customer_seed_data import CUSTOMER_SEED
from scripts.ai_approval_seed_data import AI_APPROVAL_SEED
from scripts.ai_audit_log_seed_data import AI_AUDIT_LOG_SEED
from scripts.ai_connection_seed_data import AI_CONNECTION_SEED
from scripts.ai_provider_seed_data import AI_PROVIDER_SEED
from scripts.ai_agent_seed_data import AI_AGENT_SEED
from scripts.ai_tool_seed_data import AI_TOOL_SEED
from scripts.supplier_seed_data import SUPPLIER_SEED
from app.services.ai_connection_sync import sync_env_openai_connection
from scripts.seed_data import (
    ATTRIBUTE_PROFILE_SEED,
    BRAND_SEED,
    CATALOG_SEED,
    CATEGORY_SEED,
    COLLECTION_SEED,
    CONFIGURATOR_BUILD_SEED,
    CONFIGURATOR_CATEGORY_SEED,
    CONFIGURATOR_PROFILE_SEED,
    CONFIGURATOR_TEMPLATE_SEED,
    FILTER_SEED,
    MEDIA_SEED,
    WAREHOUSE_SEED,
)


def seed_products(db) -> int:
    existing_slugs = {
        row[0]
        for row in db.query(CatalogProduct.slug).all()
    }
    inserted = 0
    for item in CATALOG_SEED:
        if item["slug"] in existing_slugs:
            continue
        db.add(CatalogProduct(**item))
        inserted += 1
    if inserted:
        db.commit()
    return inserted


def _apply_path_depth(row: CatalogCategory, parent: Optional[CatalogCategory]) -> None:
    if parent:
        row.parent_id = parent.id
        row.depth = parent.depth + 1
        row.path = f"{parent.path}{row.id}/"
    else:
        row.parent_id = None
        row.depth = 0
        row.path = f"/{row.id}/"


def seed_categories(db) -> int:
    slug_to_id: Dict[str, str] = {
        slug: cat_id for slug, cat_id in db.query(CatalogCategory.slug, CatalogCategory.id).all()
    }
    inserted = 0
    for item in CATEGORY_SEED:
        if item["slug"] in slug_to_id:
            continue

        parent: Optional[CatalogCategory] = None
        parent_slug = item.get("parent_slug")
        if parent_slug:
            parent_id = slug_to_id.get(parent_slug)
            if parent_id:
                parent = db.get(CatalogCategory, parent_id)

        row = CatalogCategory(
            name=item["name"],
            caption=item.get("caption") or item["name"],
            slug=item["slug"],
            sort_order=item.get("sort_order", 0),
            is_active=item.get("is_active", True),
            show_in_top_menu=item.get("show_in_top_menu", False),
            description=item.get("description"),
            meta_title=item.get("meta_title"),
            meta_description=item.get("meta_description"),
            meta_keywords=item.get("meta_keywords"),
            icon_url=item.get("icon_url"),
            banner_url=item.get("banner_url"),
        )
        db.add(row)
        db.flush()
        _apply_path_depth(row, parent)
        slug_to_id[row.slug] = row.id
        inserted += 1

    if inserted:
        db.commit()
    return inserted


def seed_brands(db) -> int:
    existing_slugs = {
        slug for slug, in db.query(CatalogBrand.slug).all()
    }
    inserted = 0
    for item in BRAND_SEED:
        if item["slug"] in existing_slugs:
            continue
        db.add(CatalogBrand(**item))
        inserted += 1
    if inserted:
        db.commit()
    return inserted


def _parse_optional_date(value: Optional[str | date]) -> Optional[date]:
    if value is None:
        return None
    if isinstance(value, date):
        return value
    return date.fromisoformat(value)


def seed_collections(db) -> int:
    existing_slugs = {
        slug for slug, in db.query(CatalogCollection.slug).all()
    }
    inserted = 0
    for item in COLLECTION_SEED:
        if item["slug"] in existing_slugs:
            continue
        payload = dict(item)
        payload["schedule_start"] = _parse_optional_date(payload.get("schedule_start"))
        payload["schedule_end"] = _parse_optional_date(payload.get("schedule_end"))
        db.add(CatalogCollection(**payload))
        inserted += 1
    if inserted:
        db.commit()
    return inserted


def seed_filters(db) -> int:
    existing_keys = {
        key for key, in db.query(CatalogFilter.param_key).all()
    }
    inserted = 0
    for item in FILTER_SEED:
        if item["param_key"] in existing_keys:
            continue
        db.add(CatalogFilter(**item))
        inserted += 1
    if inserted:
        db.commit()
    return inserted


def seed_configurator_profiles(db) -> int:
    existing_slugs = {
        slug for slug, in db.query(ConfiguratorProfile.slug).all()
    }
    inserted = 0
    for item in CONFIGURATOR_PROFILE_SEED:
        if item["slug"] in existing_slugs:
            continue
        db.add(ConfiguratorProfile(**item))
        inserted += 1
    if inserted:
        db.commit()
    return inserted


def seed_configurator_categories(db) -> int:
    profiles_by_slug = {row.slug: row for row in db.query(ConfiguratorProfile).all()}
    existing = {
        (profile_id, slug)
        for profile_id, slug in db.query(ConfiguratorCategory.profile_id, ConfiguratorCategory.slug).all()
    }
    inserted = 0
    touched_profiles: set[str] = set()

    for item in CONFIGURATOR_CATEGORY_SEED:
        profile = profiles_by_slug.get(item["profile_slug"])
        if not profile:
            continue
        key = (profile.id, item["slug"])
        if key in existing:
            continue
        db.add(
            ConfiguratorCategory(
                profile_id=profile.id,
                name=item["name"],
                slug=item["slug"],
                description=item.get("description"),
                sort_order=item.get("sort_order", 0),
                is_required=item.get("is_required", False),
                selection_mode=item.get("selection_mode", "single"),
                product_count=item.get("product_count", 0),
                status=item.get("status", "draft"),
            ),
        )
        touched_profiles.add(profile.id)
        inserted += 1

    if inserted:
        db.commit()
        for profile_id in touched_profiles:
            profile = db.get(ConfiguratorProfile, profile_id)
            if profile:
                profile.category_count = (
                    db.query(ConfiguratorCategory)
                    .filter(ConfiguratorCategory.profile_id == profile_id)
                    .count()
                )
        db.commit()
    return inserted


def seed_configurator_templates(db) -> int:
    profiles_by_slug = {row.slug: row for row in db.query(ConfiguratorProfile).all()}
    categories_by_key = {
        (row.profile_id, row.slug): row
        for row in db.query(ConfiguratorCategory).all()
    }
    existing = {
        (profile_id, slug)
        for profile_id, slug in db.query(ConfiguratorTemplate.profile_id, ConfiguratorTemplate.slug).all()
    }
    inserted = 0
    touched_profiles: set[str] = set()

    for item in CONFIGURATOR_TEMPLATE_SEED:
        profile = profiles_by_slug.get(item["profile_slug"])
        if not profile:
            continue
        key = (profile.id, item["slug"])
        if key in existing:
            continue

        components = []
        for comp in item.get("components", []):
            category = categories_by_key.get((profile.id, comp["category_slug"]))
            if not category:
                continue
            components.append(
                {
                    "category_id": category.id,
                    "category_name": comp.get("category_name", category.name),
                    "product_name": comp.get("product_name"),
                    "quantity": comp.get("quantity", 1),
                },
            )

        db.add(
            ConfiguratorTemplate(
                profile_id=profile.id,
                name=item["name"],
                slug=item["slug"],
                description=item.get("description"),
                components_json=dump_components(components),
                is_featured=item.get("is_featured", False),
                status=item.get("status", "draft"),
                use_count=item.get("use_count", 0),
            ),
        )
        touched_profiles.add(profile.id)
        inserted += 1

    if inserted:
        db.commit()
        for profile_id in touched_profiles:
            profile = db.get(ConfiguratorProfile, profile_id)
            if profile:
                profile.template_count = (
                    db.query(ConfiguratorTemplate)
                    .filter(ConfiguratorTemplate.profile_id == profile_id)
                    .count()
                )
        db.commit()
    return inserted


def seed_configurator_builds(db) -> int:
    profiles_by_slug = {row.slug: row for row in db.query(ConfiguratorProfile).all()}
    categories_by_key = {
        (row.profile_id, row.slug): row
        for row in db.query(ConfiguratorCategory).all()
    }
    existing_codes = {code for code, in db.query(ConfiguratorBuild.build_code).all()}
    inserted = 0
    touched_profiles: set[str] = set()

    for item in CONFIGURATOR_BUILD_SEED:
        if item["build_code"] in existing_codes:
            continue
        profile = profiles_by_slug.get(item["profile_slug"])
        if not profile:
            continue

        components = []
        for comp in item.get("components", []):
            category = categories_by_key.get((profile.id, comp["category_slug"]))
            if not category:
                continue
            components.append(
                {
                    "category_id": category.id,
                    "category_name": comp.get("category_name", category.name),
                    "product_name": comp.get("product_name"),
                    "quantity": comp.get("quantity", 1),
                },
            )

        db.add(
            ConfiguratorBuild(
                profile_id=profile.id,
                name=item["name"],
                build_code=item["build_code"],
                customer_name=item.get("customer_name"),
                user_name=item.get("user_name"),
                components_json=dump_components(components),
                total_price=Decimal(str(item.get("total_price", 0))),
                compatibility_status=item.get("compatibility_status", "compatible"),
                status=item.get("status", "draft"),
            ),
        )
        touched_profiles.add(profile.id)
        inserted += 1

    if inserted:
        db.commit()
        for profile_id in touched_profiles:
            profile = db.get(ConfiguratorProfile, profile_id)
            if profile:
                profile.build_count = (
                    db.query(ConfiguratorBuild)
                    .filter(ConfiguratorBuild.profile_id == profile_id)
                    .count()
                )
        db.commit()
    return inserted


def seed_attribute_profiles(db) -> int:
    existing_codes = {
        code for code, in db.query(CatalogAttributeProfile.code).all()
    }
    inserted = 0
    for item in ATTRIBUTE_PROFILE_SEED:
        if item["code"] in existing_codes:
            continue

        profile = CatalogAttributeProfile(
            name=item["name"],
            code=item["code"],
            description=item.get("description"),
            sort_order=item.get("sort_order", 0),
            is_active=item.get("is_active", True),
            icon_url=item.get("icon_url"),
            image_url=item.get("image_url"),
            category_labels=dump_json_list(item.get("category_labels", [])),
        )
        db.add(profile)
        db.flush()

        for group_item in item.get("groups", []):
            group = CatalogAttributeGroup(
                profile_id=profile.id,
                name=group_item["name"],
                code=group_item["code"],
                sort_order=group_item.get("sort_order", 0),
                is_active=True,
                description=group_item.get("description"),
            )
            db.add(group)
            db.flush()

            for attr_index, attr_item in enumerate(group_item.get("attributes", [])):
                db.add(
                    CatalogAttribute(
                        group_id=group.id,
                        name=attr_item["name"],
                        code=attr_item["code"],
                        field_type=attr_item.get("field_type", "text"),
                        sort_order=attr_index,
                        is_required=attr_item.get("is_required", False),
                        is_filterable=attr_item.get("is_filterable", False),
                        is_comparable=attr_item.get("is_comparable", True),
                        is_searchable=attr_item.get("is_searchable", False),
                        is_visible=attr_item.get("is_visible", True),
                        is_active=True,
                        unit=attr_item.get("unit"),
                        help_text=attr_item.get("help_text"),
                        predefined_values=dump_json_list(attr_item.get("predefined_values", [])),
                    ),
                )

        inserted += 1

    if inserted:
        db.commit()
    return inserted


def seed_variants(db) -> int:
    existing_product_ids = {
        pid for pid, in db.query(CatalogProductVariant.product_id).all()
    }
    inserted = 0
    products = db.query(CatalogProduct).all()
    for product in products:
        if product.id in existing_product_ids:
            continue
        db.add(
            CatalogProductVariant(
                product_id=product.id,
                sku=product.sku,
                name="Default",
                price=product.price,
                stock=product.stock,
                status=product.status,
                is_default=True,
                sort_order=0,
            ),
        )
        inserted += 1
    if inserted:
        db.commit()
    return inserted


def seed_media(db) -> int:
    before = db.query(Media).count()
    if before > 0:
        return 0
    for item in MEDIA_SEED:
        db.add(Media(**item))
    db.commit()
    return len(MEDIA_SEED)


def _compute_stock_status(on_hand: int, min_qty: int, max_qty: int) -> str:
    if on_hand <= 0:
        return "out_of_stock"
    if on_hand < min_qty:
        return "low_stock"
    if max_qty > 0 and on_hand > max_qty:
        return "overstock"
    return "in_stock"


def seed_warehouses(db) -> int:
    existing_codes = {code for code, in db.query(InventoryWarehouse.code).all()}
    inserted = 0
    for item in WAREHOUSE_SEED:
        if item["code"] in existing_codes:
            continue
        db.add(InventoryWarehouse(**item))
        inserted += 1
    if inserted:
        db.commit()
    return inserted


def seed_stock_levels(db) -> int:
    if db.query(InventoryStockLevel).count() > 0:
        return 0

    warehouses = (
        db.query(InventoryWarehouse)
        .order_by(InventoryWarehouse.sort_order, InventoryWarehouse.name)
        .all()
    )
    if not warehouses:
        return 0

    variants = (
        db.query(CatalogProductVariant, CatalogProduct)
        .join(CatalogProduct, CatalogProductVariant.product_id == CatalogProduct.id)
        .order_by(CatalogProductVariant.sku)
        .all()
    )

    inserted = 0
    for index, (variant, product) in enumerate(variants):
        warehouse = warehouses[index % len(warehouses)]
        on_hand = variant.stock
        reserved = min(3, on_hand // 4) if on_hand > 0 else 0
        if on_hand == 0:
            incoming = 24
        elif on_hand < 10:
            incoming = 50
        else:
            incoming = 0
        min_qty = 10
        max_qty = max(on_hand * 3, 50)
        unit_cost = (product.price * Decimal("0.65")).quantize(Decimal("0.01"))
        display_name = product.name
        if variant.name and variant.name != "Default":
            display_name = f"{product.name} — {variant.name}"

        db.add(
            InventoryStockLevel(
                warehouse_id=warehouse.id,
                variant_id=variant.id,
                product_id=product.id,
                sku=variant.sku,
                name=display_name,
                on_hand=on_hand,
                reserved=reserved,
                incoming=incoming,
                min_qty=min_qty,
                max_qty=max_qty,
                unit_cost=unit_cost,
                status=_compute_stock_status(on_hand, min_qty, max_qty),
                thumbnail=product.thumbnail,
            ),
        )
        inserted += 1

    if inserted:
        db.commit()
    return inserted


def _default_ai_insights(risk: str, score: int) -> dict:
    return {
        "orderSummary": "Standard ecommerce order with verified payment."
        if risk == "low"
        else "COD order — confirm address before fulfillment."
        if risk == "medium"
        else "High-value return case — review refund history.",
        "customerSummary": "Active buyer with consistent purchase pattern.",
        "riskLevel": risk,
        "riskScore": score,
        "riskReasons": ["Verified payment", "Repeat customer"]
        if risk == "low"
        else ["COD payment", "New delivery address"]
        if risk == "medium"
        else ["Multiple returns", "Unusual location"],
        "deliveryPrediction": {
            "success": 94 if risk == "low" else 78 if risk == "medium" else 62,
            "delayRisk": "Low" if risk == "low" else "Medium" if risk == "medium" else "High",
            "returnRisk": "2%" if risk == "low" else "8%" if risk == "medium" else "24%",
        },
        "upsellSuggestions": [
            {"name": "Extended Warranty", "reason": "Electronics category match"},
        ],
        "retentionProbability": 87 if risk == "low" else 64 if risk == "medium" else 41,
    }


ORDER_SEED_TEMPLATES = [
    {"id": "ord_1001", "order_number": "ORD-1001", "status": "shipped", "tags": ["VIP"], "ai_risk": "low", "risk_score": 12},
    {"id": "ord_1002", "order_number": "ORD-1002", "status": "pending", "payment_status": "unpaid", "shipment_status": "unfulfilled", "priority": "high", "ai_risk": "medium", "risk_score": 45, "customer_idx": 1, "payment_method": "COD", "paid_amount": 0},
    {"id": "ord_1003", "order_number": "ORD-1003", "status": "processing", "shipment_status": "partial", "branch": "Chittagong", "assigned_staff": "Nusrat Jahan", "tags": ["B2B"], "ai_risk": "low", "risk_score": 20, "customer_idx": 2, "item_count": 2},
    {"id": "ord_1004", "order_number": "ORD-1004", "status": "delivered", "shipment_status": "delivered", "courier": "RedX", "tracking_number": "RDX-99102", "ai_risk": "low", "risk_score": 10},
    {"id": "ord_1005", "order_number": "ORD-1005", "status": "completed", "payment_status": "paid", "shipment_status": "delivered", "ai_risk": "low", "risk_score": 8},
    {"id": "ord_1006", "order_number": "ORD-1006", "status": "draft", "payment_status": "unpaid", "shipment_status": "unfulfilled", "source": "Phone", "assigned_staff": "Sales Team", "ai_risk": "medium", "risk_score": 30},
    {"id": "ord_1007", "order_number": "ORD-1007", "status": "confirmed", "tags": ["Express"], "ai_risk": "low", "risk_score": 15},
    {"id": "ord_1008", "order_number": "ORD-1008", "status": "packed", "shipment_status": "partial", "ai_risk": "low", "risk_score": 18},
    {"id": "ord_1009", "order_number": "ORD-1009", "status": "returned", "payment_status": "refunded", "shipment_status": "returned", "priority": "urgent", "ai_risk": "high", "risk_score": 72},
    {"id": "ord_1010", "order_number": "ORD-1010", "status": "refunded", "payment_status": "refunded", "ai_risk": "medium", "risk_score": 55},
    {"id": "ord_1011", "order_number": "ORD-1011", "status": "cancelled", "payment_status": "failed", "shipment_status": "unfulfilled", "ai_risk": "medium", "risk_score": 40},
    {"id": "ord_1012", "order_number": "ORD-1012", "status": "failed", "payment_status": "failed", "ai_risk": "high", "risk_score": 80},
]

ORDER_CUSTOMERS = [
    {"id": "c1", "name": "Rahim Uddin", "phone": "+880 1712-345678", "email": "rahim@example.com", "group": "Retail", "lifetime_value": Decimal("84200"), "order_count": 12, "risk_score": 12},
    {"id": "c2", "name": "Fatima Khan", "phone": "+880 1812-998877", "email": "fatima@example.com", "group": "Retail", "lifetime_value": Decimal("12400"), "order_count": 2, "risk_score": 45},
    {"id": "c3", "name": "Karim Ahmed", "phone": "+880 1911-223344", "email": "karim@example.com", "group": "Wholesale", "lifetime_value": Decimal("156000"), "order_count": 28, "risk_score": 20},
]


def seed_orders(db) -> int:
    if db.query(CommerceOrder).count() > 0:
        return 0

    catalog_rows = (
        db.query(CatalogProductVariant, CatalogProduct)
        .join(CatalogProduct, CatalogProductVariant.product_id == CatalogProduct.id)
        .order_by(CatalogProductVariant.sku)
        .all()
    )
    if not catalog_rows:
        return 0

    inserted = 0
    order_dates = [
        "2026-06-10T14:32:00",
        "2026-06-12T10:15:00",
        "2026-06-11T16:45:00",
        "2026-06-08T09:20:00",
        "2026-06-07T18:00:00",
        "2026-06-13T11:30:00",
        "2026-06-09T13:10:00",
        "2026-06-11T08:55:00",
        "2026-06-05T15:40:00",
        "2026-06-04T12:00:00",
        "2026-06-03T10:25:00",
        "2026-06-02T17:15:00",
    ]

    for index, tmpl in enumerate(ORDER_SEED_TEMPLATES):
        customer = ORDER_CUSTOMERS[tmpl.get("customer_idx", index % len(ORDER_CUSTOMERS))]
        risk = tmpl.get("ai_risk", "low")
        score = tmpl.get("risk_score", customer["risk_score"])

        shipping_amount = Decimal("120")
        discount_amount = Decimal("500") if index % 2 == 0 else Decimal("0")
        subtotal = Decimal("0")
        line_rows = []
        item_count = tmpl.get("item_count", 1)

        for line_idx in range(item_count):
            variant, product = catalog_rows[(index + line_idx) % len(catalog_rows)]
            qty = 2 if line_idx == 0 and item_count == 1 and index == 0 else 1
            unit_price = variant.price
            line_discount = Decimal("200") if line_idx == 0 and index == 0 else Decimal("0")
            line_tax = (unit_price * qty * Decimal("0.05")).quantize(Decimal("0.01"))
            line_total = unit_price * qty - line_discount + line_tax
            subtotal += unit_price * qty
            line_rows.append((variant, product, qty, unit_price, line_discount, line_tax, line_total, line_idx))

        tax_amount = sum(row[5] for row in line_rows)
        grand_total = subtotal - discount_amount + tax_amount + shipping_amount
        paid_amount = tmpl.get("paid_amount", grand_total)
        if isinstance(paid_amount, int):
            paid_amount = Decimal(str(paid_amount))
        due_amount = max(grand_total - paid_amount, Decimal("0"))

        payment_status = tmpl.get("payment_status", "paid" if paid_amount >= grand_total else "unpaid")
        shipment_status = tmpl.get("shipment_status", "shipped" if tmpl["status"] in {"shipped", "delivered", "completed"} else "unfulfilled")

        order = CommerceOrder(
            id=tmpl["id"],
            order_number=tmpl["order_number"],
            order_date=datetime.fromisoformat(order_dates[index]),
            status=tmpl["status"],
            payment_status=payment_status,
            shipment_status=shipment_status,
            source=tmpl.get("source", "Web Store"),
            branch=tmpl.get("branch", "Dhaka HQ"),
            assigned_staff=tmpl.get("assigned_staff", "Karim Ahmed"),
            priority=tmpl.get("priority", "normal"),
            tags_json=dump_json(tmpl.get("tags", [])),
            customer_id=customer["id"],
            customer_name=customer["name"],
            customer_phone=customer["phone"],
            customer_email=customer["email"],
            customer_group=customer["group"],
            customer_lifetime_value=customer["lifetime_value"],
            customer_order_count=customer["order_count"],
            customer_risk_score=score,
            billing_address="12 Mirpur Road",
            billing_city="Dhaka",
            billing_region="Dhaka",
            billing_country="Bangladesh",
            shipping_address="12 Mirpur Road",
            shipping_city="Dhaka",
            shipping_region="Dhaka",
            shipping_country="Bangladesh",
            payment_method=tmpl.get("payment_method", "bKash"),
            payment_transaction_id="BKX92837465" if payment_status == "paid" else None,
            paid_amount=paid_amount,
            due_amount=due_amount,
            refund_amount=grand_total if payment_status == "refunded" else Decimal("0"),
            courier=tmpl.get("courier", "Pathao" if shipment_status != "unfulfilled" else None),
            tracking_number=tmpl.get("tracking_number", "PTH-8827364" if shipment_status != "unfulfilled" else None),
            tracking_url="https://pathao.com/track/8827364" if shipment_status != "unfulfilled" else None,
            shipping_cost=shipping_amount,
            subtotal=subtotal,
            discount_amount=discount_amount,
            tax_amount=tax_amount,
            shipping_amount=shipping_amount,
            grand_total=grand_total,
            ai_risk=risk,
            ai_summary="COD order — verify address before confirm." if risk == "medium" else None,
            timeline_json=dump_json([
                {
                    "id": f"t_created_{tmpl['id']}",
                    "type": "created",
                    "title": "Order placed",
                    "actor": "System",
                    "actorInitials": "SY",
                    "at": order_dates[index] + "Z",
                },
            ]),
            activities_json=dump_json([]),
            comments_json=dump_json([]),
            attachments_json=dump_json([]),
            payment_timeline_json=dump_json([
                {
                    "id": f"pt_{tmpl['id']}",
                    "label": "Payment received" if payment_status == "paid" else "Awaiting payment",
                    "amount": float(paid_amount),
                    "status": "completed" if payment_status == "paid" else "pending",
                    "at": order_dates[index],
                },
            ]),
            ai_insights_json=dump_json(_default_ai_insights(risk, score)),
            followers_json=dump_json(["Karim Ahmed"]),
        )
        db.add(order)
        db.flush()

        for variant, product, qty, unit_price, line_discount, line_tax, line_total, line_idx in line_rows:
            db.add(
                CommerceOrderItem(
                    order_id=order.id,
                    product_id=product.id,
                    variant_id=variant.id,
                    sku=variant.sku,
                    name=product.name,
                    image_url=product.thumbnail,
                    variant_label=variant.name if variant.name != "Default" else None,
                    quantity=qty,
                    unit_price=unit_price,
                    discount_amount=line_discount,
                    tax_amount=line_tax,
                    line_total=line_total,
                    sort_order=line_idx,
                ),
            )

        inserted += 1

    if inserted:
        db.commit()
    return inserted


def seed_customers(db) -> int:
    existing_codes = {code for code, in db.query(CommerceCustomer.customer_code).all()}
    inserted = 0
    for item in CUSTOMER_SEED:
        if item["customer_code"] in existing_codes:
            continue
        row = CommerceCustomer(
            id=item["id"],
            customer_code=item["customer_code"],
            name=item["name"],
            phone=item["phone"],
            email=item["email"],
            group=item["group"],
            status=item["status"],
            loyalty_tier=item["loyalty_tier"],
            city=item["city"],
            region=item["region"],
            country=item["country"],
            customer_since=item["customer_since"],
            last_order_date=item.get("last_order_date"),
            assigned_staff=item.get("assigned_staff"),
            tags_json=dump_json(item.get("tags", [])),
            total_orders=item.get("total_orders", 0),
            total_spend=item.get("total_spend", Decimal("0")),
            avg_order_value=item.get("avg_order_value", Decimal("0")),
            return_rate=item.get("return_rate", Decimal("0")),
            reward_points=item.get("reward_points", 0),
            wallet_balance=item.get("wallet_balance", Decimal("0")),
            risk_score=item.get("risk_score", 0),
            risk_level=item.get("risk_level", "low"),
            addresses_json=dump_json(item.get("addresses", [])),
            wallet_transactions_json=dump_json(item.get("wallet_transactions", [])),
            reward_events_json=dump_json(item.get("reward_events", [])),
            timeline_json=dump_json(item.get("timeline", [])),
            comments_json=dump_json(item.get("comments", [])),
            activities_json=dump_json(item.get("activities", [])),
            attachments_json=dump_json(item.get("attachments", [])),
            ai_insights_json=dump_json(item.get("ai_insights", {})),
        )
        db.add(row)
        inserted += 1
    if inserted:
        db.commit()
    return inserted


RETURN_SEED = [
    {
        "id": "ret_001",
        "return_number": "RMA-5001",
        "order_id": "ord_1004",
        "order_number": "ORD-1004",
        "customer_name": "Rakibul Hasan",
        "product_name": "Wireless Earbuds Pro",
        "sku": "SKU-0002",
        "quantity": 1,
        "reason": "Defective — left earbud not working",
        "status": "requested",
        "amount": Decimal("3499"),
        "assigned_staff": "Sadia Rahman",
        "created_at": "2026-06-12T09:00:00",
    },
    {
        "id": "ret_002",
        "return_number": "RMA-5002",
        "order_id": "ord_1002",
        "order_number": "ORD-1002",
        "customer_name": "Fatima Khan",
        "product_name": "Smart Watch Series 5",
        "sku": "SKU-0005",
        "quantity": 1,
        "reason": "Wrong size band received",
        "status": "review",
        "amount": Decimal("8900"),
        "assigned_staff": "Rahim Uddin",
        "created_at": "2026-06-11T14:30:00",
    },
    {
        "id": "ret_003",
        "return_number": "RMA-5003",
        "order_id": "ord_1005",
        "order_number": "ORD-1005",
        "customer_name": "Nasrin Akter",
        "product_name": "Ceramic Coffee Mug Set",
        "sku": "SKU-0003",
        "quantity": 2,
        "reason": "Damaged in shipping",
        "status": "approved",
        "amount": Decimal("1200"),
        "assigned_staff": "Sadia Rahman",
        "created_at": "2026-06-10T11:00:00",
    },
    {
        "id": "ret_004",
        "return_number": "RMA-5004",
        "order_id": "ord_1003",
        "order_number": "ORD-1003",
        "customer_name": "Tanvir Ahmed",
        "product_name": "Running Shoes Ultra",
        "sku": "SKU-0004",
        "quantity": 1,
        "reason": "Size mismatch — ordered 42, received 40",
        "status": "received",
        "amount": Decimal("5200"),
        "assigned_staff": "Warehouse Team",
        "created_at": "2026-06-08T16:00:00",
    },
    {
        "id": "ret_005",
        "return_number": "RMA-5005",
        "order_id": "ord_1001",
        "order_number": "ORD-1001",
        "customer_name": "Rahim Uddin",
        "product_name": "Premium Cotton T-Shirt",
        "sku": "SKU-0001",
        "quantity": 1,
        "reason": "Color different from website",
        "status": "inspected",
        "amount": Decimal("899"),
        "assigned_staff": "Warehouse Team",
        "created_at": "2026-06-07T10:00:00",
    },
    {
        "id": "ret_006",
        "return_number": "RMA-5006",
        "order_id": "ord_1006",
        "order_number": "ORD-1006",
        "customer_name": "Jahidul Islam",
        "product_name": "Bluetooth Speaker Mini",
        "sku": "SKU-0007",
        "quantity": 1,
        "reason": "Not as described — battery life poor",
        "status": "completed",
        "amount": Decimal("2100"),
        "created_at": "2026-06-01T08:00:00",
    },
    {
        "id": "ret_007",
        "return_number": "RMA-5007",
        "order_id": "ord_1007",
        "order_number": "ORD-1007",
        "customer_name": "Karim Ahmed",
        "product_name": "LED Desk Lamp",
        "sku": "SKU-0010",
        "quantity": 1,
        "reason": "Changed mind",
        "status": "rejected",
        "amount": Decimal("1850"),
        "created_at": "2026-05-28T12:00:00",
    },
]


REVIEW_SEED = [
    {
        "id": "rev_001",
        "review_number": "R-20001",
        "product_slug": "dell-inspiron-15",
        "customer_id": "cust_001",
        "customer_name": "Rahim Uddin",
        "review_type": "photo",
        "status": "approved",
        "rating": 5,
        "title": "Best laptop I've ever bought — completely worth it!",
        "body": "Performance is outstanding, the display is gorgeous, and the battery easily lasts all day.",
        "sentiment": "positive",
        "is_verified_purchase": True,
        "helpful_votes": 47,
        "moderated_by": "Sumaiya Akter",
        "created_at": "2026-06-10T10:00:00",
    },
    {
        "id": "rev_002",
        "review_number": "R-20002",
        "product_slug": "asus-tuf-gaming-f15",
        "customer_id": "cust_002",
        "customer_name": "Fatima Khan",
        "review_type": "text",
        "status": "pending",
        "rating": 2,
        "title": "Disappointed — overheats constantly",
        "body": "It overheats during video calls and the fan noise is unbearable. Considering returning it.",
        "sentiment": "negative",
        "is_verified_purchase": True,
        "helpful_votes": 12,
        "created_at": "2026-06-11T14:00:00",
    },
    {
        "id": "rev_003",
        "review_number": "R-20003",
        "product_slug": "logitech-mx-master-3s",
        "customer_id": "cust_003",
        "customer_name": "Karim Ahmed",
        "review_type": "verified",
        "status": "approved",
        "rating": 4,
        "title": "Great mouse, scroll wheel could be better",
        "body": "Comfortable for long sessions. Side buttons are well placed. Scroll wheel feels a bit stiff.",
        "sentiment": "positive",
        "is_verified_purchase": True,
        "helpful_votes": 23,
        "moderated_by": "Admin",
        "created_at": "2026-06-09T08:30:00",
    },
    {
        "id": "rev_004",
        "review_number": "R-20004",
        "product_slug": "hp-pavilion-14",
        "customer_id": "cust_001",
        "customer_name": "Rahim Uddin",
        "review_type": "text",
        "status": "rejected",
        "rating": 1,
        "title": "Terrible experience — do not buy",
        "body": "Product arrived damaged and support refused a replacement. One star.",
        "sentiment": "negative",
        "is_verified_purchase": False,
        "helpful_votes": 3,
        "moderated_by": "Admin",
        "created_at": "2026-06-08T16:00:00",
    },
    {
        "id": "rev_005",
        "review_number": "R-20005",
        "product_slug": "macbook-air-m2",
        "customer_id": "cust_002",
        "customer_name": "Fatima Khan",
        "review_type": "photo",
        "status": "approved",
        "rating": 5,
        "title": "Perfect for students and professionals",
        "body": "Lightweight, silent, and the M2 chip handles everything I throw at it.",
        "sentiment": "positive",
        "is_verified_purchase": True,
        "helpful_votes": 61,
        "moderated_by": "Sumaiya Akter",
        "created_at": "2026-06-07T11:00:00",
    },
    {
        "id": "rev_006",
        "review_number": "R-20006",
        "product_slug": "lenovo-ideapad-slim-5",
        "customer_id": "cust_003",
        "customer_name": "Karim Ahmed",
        "review_type": "text",
        "status": "spam",
        "rating": 3,
        "title": "CLICK HERE FOR FREE LAPTOP!!!",
        "body": "Visit my website for amazing deals and free gifts!!!",
        "sentiment": "neutral",
        "is_verified_purchase": False,
        "helpful_votes": 0,
        "moderated_by": "AI Agent",
        "created_at": "2026-06-06T09:00:00",
    },
    {
        "id": "rev_007",
        "review_number": "R-20007",
        "product_slug": "razer-deathadder-v3",
        "customer_id": "cust_001",
        "customer_name": "Rahim Uddin",
        "review_type": "text",
        "status": "pending",
        "rating": 4,
        "title": "Solid gaming mouse for the price",
        "body": "Responsive clicks and comfortable grip. Software could use an update.",
        "sentiment": "positive",
        "is_verified_purchase": True,
        "helpful_votes": 8,
        "created_at": "2026-06-12T09:30:00",
    },
    {
        "id": "rev_008",
        "review_number": "R-20008",
        "product_slug": "dell-inspiron-15",
        "customer_id": "cust_002",
        "customer_name": "Fatima Khan",
        "review_type": "text",
        "status": "archived",
        "rating": 3,
        "title": "Mixed feelings after 6 months",
        "body": "Started great but battery degraded quickly. Still usable for office work.",
        "sentiment": "mixed",
        "is_verified_purchase": True,
        "helpful_votes": 15,
        "moderated_by": "Admin",
        "created_at": "2026-05-20T10:00:00",
    },
]


def seed_reviews(db) -> int:
    if db.query(CatalogProductReview).count() > 0:
        return 0
    if db.query(CatalogProduct).count() == 0:
        return 0

    slug_to_product = {product.slug: product for product in db.query(CatalogProduct).all()}
    inserted = 0
    for item in REVIEW_SEED:
        product = slug_to_product.get(item["product_slug"])
        if product is None:
            continue
        db.add(
            CatalogProductReview(
                id=item["id"],
                review_number=item["review_number"],
                product_id=product.id,
                product_name=product.name,
                product_sku=product.sku,
                product_brand=product.brand,
                product_category=product.category,
                product_image_url=product.thumbnail,
                customer_id=item.get("customer_id"),
                customer_name=item["customer_name"],
                review_type=item["review_type"],
                status=item["status"],
                rating=item["rating"],
                title=item["title"],
                body=item["body"],
                sentiment=item["sentiment"],
                is_verified_purchase=item["is_verified_purchase"],
                helpful_votes=item["helpful_votes"],
                moderated_by=item.get("moderated_by"),
                created_at=datetime.fromisoformat(item["created_at"]),
            ),
        )
        inserted += 1

    if inserted:
        db.commit()
    return inserted


REFUND_SEED = [
    {
        "id": "ref_001",
        "refund_number": "REF-3001",
        "order_id": "ord_1006",
        "order_number": "ORD-1006",
        "customer_name": "Jahidul Islam",
        "amount": Decimal("2100"),
        "method": "bKash",
        "reason": "Return completed — RMA-5006",
        "status": "completed",
        "approved_by": "Manager",
        "created_at": "2026-06-02T10:00:00",
    },
    {
        "id": "ref_002",
        "refund_number": "REF-3002",
        "order_id": "ord_1002",
        "order_number": "ORD-1002",
        "customer_name": "Fatima Khan",
        "amount": Decimal("8900"),
        "method": "Card",
        "reason": "Partial refund — shipping delay compensation",
        "status": "pending",
        "created_at": "2026-06-12T11:00:00",
    },
    {
        "id": "ref_003",
        "refund_number": "REF-3003",
        "order_id": "ord_1003",
        "order_number": "ORD-1003",
        "customer_name": "Tanvir Ahmed",
        "amount": Decimal("5200"),
        "method": "Nagad",
        "reason": "Return approved — awaiting item receipt",
        "status": "approved",
        "approved_by": "Sadia Rahman",
        "created_at": "2026-06-09T09:00:00",
    },
    {
        "id": "ref_004",
        "refund_number": "REF-3004",
        "order_id": "ord_1008",
        "order_number": "ORD-1008",
        "customer_name": "Mossiur Rahman",
        "amount": Decimal("4500"),
        "method": "bKash",
        "reason": "Duplicate payment charged",
        "status": "processing",
        "approved_by": "Manager",
        "created_at": "2026-06-11T15:00:00",
    },
    {
        "id": "ref_005",
        "refund_number": "REF-3005",
        "order_id": "ord_1007",
        "order_number": "ORD-1007",
        "customer_name": "Unknown User",
        "amount": Decimal("1850"),
        "method": "COD",
        "reason": "Return rejected — outside policy window",
        "status": "rejected",
        "approved_by": "Manager",
        "created_at": "2026-05-29T10:00:00",
    },
]


def seed_refunds(db) -> int:
    if db.query(CommerceOrderRefund).count() > 0:
        return 0
    if db.query(CommerceOrder).count() == 0:
        return 0

    inserted = 0
    for item in REFUND_SEED:
        if db.get(CommerceOrder, item["order_id"]) is None:
            continue
        db.add(
            CommerceOrderRefund(
                id=item["id"],
                refund_number=item["refund_number"],
                order_id=item["order_id"],
                order_number=item["order_number"],
                customer_name=item["customer_name"],
                amount=item["amount"],
                method=item["method"],
                reason=item["reason"],
                status=item["status"],
                approved_by=item.get("approved_by"),
                created_at=datetime.fromisoformat(item["created_at"]),
            ),
        )
        inserted += 1

    if inserted:
        db.commit()
    return inserted


def seed_returns(db) -> int:
    if db.query(CommerceOrderReturn).count() > 0:
        return 0
    if db.query(CommerceOrder).count() == 0:
        return 0

    inserted = 0
    for item in RETURN_SEED:
        if db.get(CommerceOrder, item["order_id"]) is None:
            continue
        db.add(
            CommerceOrderReturn(
                id=item["id"],
                return_number=item["return_number"],
                order_id=item["order_id"],
                order_number=item["order_number"],
                customer_name=item["customer_name"],
                product_name=item["product_name"],
                sku=item["sku"],
                quantity=item["quantity"],
                reason=item["reason"],
                status=item["status"],
                amount=item["amount"],
                assigned_staff=item.get("assigned_staff"),
                created_at=datetime.fromisoformat(item["created_at"]),
            ),
        )
        inserted += 1

    if inserted:
        db.commit()
    return inserted


def seed_suppliers(db) -> int:
    existing_codes = {code for code, in db.query(CommerceSupplier.vendor_code).all()}
    inserted = 0
    for item in SUPPLIER_SEED:
        if item["vendor_code"] in existing_codes:
            continue
        row = CommerceSupplier(
            id=item["id"],
            vendor_code=item["vendor_code"],
            name=item["name"],
            email=item["email"],
            phone=item["phone"],
            payment_terms=item["payment_terms"],
            lead_time_days=item["lead_time_days"],
            rating=item["rating"],
            open_pos=item.get("open_pos", 0),
            spend_ytd=item.get("spend_ytd", Decimal("0")),
            status=item["status"],
            country=item["country"],
            tax_id=item.get("tax_id"),
            website=item.get("website"),
            currency=item.get("currency"),
            min_order_value=item.get("min_order_value"),
            incoterms=item.get("incoterms"),
            buyer_name=item.get("buyer_name"),
            contacts_json=supplier_dump_json(item.get("contacts", [])),
            addresses_json=supplier_dump_json(item.get("addresses", [])),
            contracts_json=supplier_dump_json(item.get("contracts", [])),
            bills_json=supplier_dump_json(item.get("bills", [])),
            performance_json=supplier_dump_json(item.get("performance", {})),
            timeline_json=supplier_dump_json(item.get("timeline", [])),
            rfq_count=item.get("rfq_count", 0),
            receipt_count=item.get("receipt_count", 0),
            has_stock_feed=item.get("has_stock_feed", False),
            total_pos=item.get("total_pos", 0),
        )
        db.add(row)
        inserted += 1
    if inserted:
        db.commit()
    return inserted


def seed_ai_approvals(db) -> int:
    existing_ids = {row[0] for row in db.query(AiApproval.id).all()}
    inserted = 0
    for item in AI_APPROVAL_SEED:
        if item["id"] in existing_ids:
            continue
        db.add(
            AiApproval(
                id=item["id"],
                agent=item["agent"],
                tool=item["tool"],
                summary=item["summary"],
                reason=item["reason"],
                risk=item["risk"],
                status=item["status"],
                entity=item["entity"],
                requested_at=item["requested_at"],
            ),
        )
        inserted += 1
    if inserted:
        db.commit()
    return inserted


def seed_ai_audit_logs(db) -> int:
    existing_ids = {row[0] for row in db.query(AiAuditLog.id).all()}
    inserted = 0
    for item in AI_AUDIT_LOG_SEED:
        if item["id"] in existing_ids:
            continue
        db.add(
            AiAuditLog(
                id=item["id"],
                action=item["action"],
                agent=item["agent"],
                user=item["user"],
                summary=item["summary"],
                tokens=item["tokens"],
                logged_at=item["logged_at"],
            ),
        )
        inserted += 1
    if inserted:
        db.commit()
    return inserted


def ensure_cloudflare_plugin_columns() -> None:
    statements = [
        "ALTER TABLE cloudflare_plugin ADD COLUMN IF NOT EXISTS auth_method VARCHAR(20) NOT NULL DEFAULT 'manual'",
        "ALTER TABLE cloudflare_plugin ADD COLUMN IF NOT EXISTS oauth_refresh_token TEXT NOT NULL DEFAULT ''",
        "ALTER TABLE cloudflare_plugin ADD COLUMN IF NOT EXISTS account_name VARCHAR(120) NOT NULL DEFAULT ''",
    ]
    with engine.begin() as conn:
        for stmt in statements:
            conn.execute(text(stmt))


def ensure_product_columns() -> None:
    """Migrate catalog_products for AgainERP-aligned fields."""
    statements = [
        "ALTER TABLE catalog_products ADD COLUMN IF NOT EXISTS product_type VARCHAR(20) NOT NULL DEFAULT 'simple'",
        "ALTER TABLE catalog_products ADD COLUMN IF NOT EXISTS visibility VARCHAR(20) NOT NULL DEFAULT 'public'",
        "ALTER TABLE catalog_products ADD COLUMN IF NOT EXISTS brand_id VARCHAR(36)",
        "ALTER TABLE catalog_products ADD COLUMN IF NOT EXISTS category_id VARCHAR(36)",
        "ALTER TABLE catalog_products ADD COLUMN IF NOT EXISTS short_description TEXT",
        "ALTER TABLE catalog_products ADD COLUMN IF NOT EXISTS tags_json TEXT NOT NULL DEFAULT '[]'",
        "ALTER TABLE catalog_products ADD COLUMN IF NOT EXISTS seo_title VARCHAR(255)",
        "ALTER TABLE catalog_products ADD COLUMN IF NOT EXISTS seo_description TEXT",
        "ALTER TABLE catalog_products ADD COLUMN IF NOT EXISTS attribute_profile_id VARCHAR(36)",
    ]
    with engine.begin() as conn:
        for stmt in statements:
            conn.execute(text(stmt))


def _slugify_username(value: str) -> str:
    import re

    value = value.lower().strip()
    value = re.sub(r"[^a-z0-9._-]", "", value)
    value = re.sub(r"[-_.]{2,}", "_", value)
    return value[:32].strip("_.-") or "user"


def ensure_auth_user_columns() -> None:
    """Add username column and backfill legacy auth_users rows."""
    with engine.begin() as conn:
        conn.execute(text("ALTER TABLE auth_users ADD COLUMN IF NOT EXISTS username VARCHAR(64)"))

    db = SessionLocal()
    try:
        users = db.query(AuthUser).all()
        taken = {user.username for user in users if user.username}
        changed = False
        for user in users:
            if user.username:
                continue
            base = _slugify_username(user.email.split("@")[0])
            candidate = base
            suffix = 2
            while candidate in taken:
                candidate = f"{base}{suffix}"
                suffix += 1
            user.username = candidate
            taken.add(candidate)
            changed = True
        if changed:
            db.commit()
    finally:
        db.close()

    with engine.begin() as conn:
        try:
            conn.execute(text("ALTER TABLE auth_users ALTER COLUMN username SET NOT NULL"))
        except Exception:
            pass
        conn.execute(text("CREATE UNIQUE INDEX IF NOT EXISTS ix_auth_users_username ON auth_users (username)"))


def link_product_taxonomy(db) -> int:
    """Backfill category_id / brand_id on products from denormalized names."""
    cat_by_name = {name: cid for name, cid in db.query(CatalogCategory.name, CatalogCategory.id).all()}
    brand_by_name = {name: bid for name, bid in db.query(CatalogBrand.name, CatalogBrand.id).all()}
    updated = 0
    for product in db.query(CatalogProduct).all():
        changed = False
        if product.category and not product.category_id:
            cid = cat_by_name.get(product.category)
            if cid:
                product.category_id = cid
                changed = True
        if product.brand and not product.brand_id:
            bid = brand_by_name.get(product.brand)
            if bid:
                product.brand_id = bid
                changed = True
        if changed:
            updated += 1
    if updated:
        db.commit()
    return updated


def seed_cloudflare_plugin(db) -> int:
    if db.get(CloudflarePlugin, "cf-default"):
        return 0
    db.add(CloudflarePlugin(id="cf-default"))
    db.commit()
    return 1


def seed_ai_connections(db) -> int:
    existing_ids = {row[0] for row in db.query(AiApiConnection.id).all()}
    inserted = 0
    for item in AI_CONNECTION_SEED:
        if item["id"] in existing_ids:
            continue
        db.add(
            AiApiConnection(
                id=item["id"],
                provider_id=item["provider_id"],
                provider_name=item["provider_name"],
                status=item["status"],
                base_url=item.get("base_url", ""),
            ),
        )
        inserted += 1
    if inserted:
        db.commit()
    return inserted


def seed_ai_providers(db) -> int:
    existing_ids = {row[0] for row in db.query(AiProvider.id).all()}
    inserted = 0
    for item in AI_PROVIDER_SEED:
        if item["id"] in existing_ids:
            continue
        row = AiProvider(
            id=item["id"],
            name=item["name"],
            status=item["status"],
            latency_ms=item["latency_ms"],
            spend_pct=item["spend_pct"],
        )
        row.models = item["models"]
        db.add(row)
        inserted += 1
    if inserted:
        db.commit()
    return inserted


def seed_ai_agents(db) -> int:
    existing_ids = {row[0] for row in db.query(AiAgent.id).all()}
    inserted = 0
    for item in AI_AGENT_SEED:
        if item["id"] in existing_ids:
            continue
        db.add(
            AiAgent(
                id=item["id"],
                name=item["name"],
                domain=item["domain"],
                status=item["status"],
                tools=item["tools"],
                runs_today=item["runs_today"],
                model=item["model"],
                description=item["description"],
            ),
        )
        inserted += 1
    if inserted:
        db.commit()
    return inserted


def seed_ai_tools(db) -> int:
    existing_ids = {row[0] for row in db.query(AiTool.id).all()}
    inserted = 0
    for item in AI_TOOL_SEED:
        if item["id"] in existing_ids:
            continue
        db.add(
            AiTool(
                id=item["id"],
                name=item["name"],
                agent=item["agent"],
                category=item["category"],
                risk=item["risk"],
                description=item["description"],
            ),
        )
        inserted += 1
    if inserted:
        db.commit()
    return inserted


def seed_coupons(db) -> int:
    existing = {code for code, in db.query(MarketingCoupon.code).all()}
    inserted = 0
    for item in COUPON_SEED:
        if item["code"] in existing:
            continue
        db.add(MarketingCoupon(**item))
        inserted += 1
    if inserted:
        db.commit()
    return inserted


def seed_campaigns(db) -> int:
    existing = {code for code, in db.query(MarketingCampaign.code).all()}
    inserted = 0
    for item in CAMPAIGN_SEED:
        if item["code"] in existing:
            continue
        db.add(MarketingCampaign(**item))
        inserted += 1
    if inserted:
        db.commit()
    return inserted


def seed_audiences(db) -> int:
    existing = {row_id for row_id, in db.query(MarketingAudience.id).all()}
    inserted = 0
    for item in AUDIENCE_SEED:
        if item["id"] in existing:
            continue
        db.add(MarketingAudience(**item))
        inserted += 1
    if inserted:
        db.commit()
    return inserted


def seed_journeys(db) -> int:
    existing = {row_id for row_id, in db.query(MarketingJourney.id).all()}
    inserted = 0
    for item in JOURNEY_SEED:
        if item["id"] in existing:
            continue
        db.add(MarketingJourney(**item))
        inserted += 1
    if inserted:
        db.commit()
    return inserted


def seed_auth_users(db) -> int:
    existing = {email for email, in db.query(AuthUser.email).all()}
    inserted = 0
    for item in AUTH_USERS_SEED:
        if item["email"] in existing:
            continue
        username = item.get("username") or _slugify_username(item["email"].split("@")[0])
        db.add(
            AuthUser(
                id=item["id"],
                email=item["email"],
                username=username,
                name=item["name"],
                role=item["role"],
                password_hash=hash_password(item["password"]),
                is_active=True,
            ),
        )
        inserted += 1
    if inserted:
        db.commit()
    return inserted


def seed_seo_meta(db) -> int:
    if db.query(SeoMetaRecord).count() > 0:
        return 0
    for item in META_SEED:
        db.add(
            SeoMetaRecord(
                id=item["id"],
                entity_type=item["entity_type"],
                title=item["title"],
                url=item["url"],
                meta_title=item.get("meta_title", ""),
                meta_description=item.get("meta_description", ""),
                og_image=item.get("og_image"),
                canonical_url=item.get("canonical_url"),
                indexable=item.get("indexable", True),
                schema_type=item.get("schema_type", "WebPage"),
                score=item.get("score", 0),
                issues_json=dump_json_list_seo(item.get("issues", [])),
            ),
        )
    db.commit()
    return len(META_SEED)


def main() -> None:
    print("Checking database connection…")
    info = check_database_connection()
    print(f"  Connected: {info}")

    print("Creating tables…")
    Base.metadata.create_all(bind=engine)
    ensure_cloudflare_plugin_columns()
    ensure_product_columns()
    ensure_auth_user_columns()
    print("  Tables ready.")

    db = SessionLocal()
    try:
        before_products = db.query(CatalogProduct).count()
        inserted_products = seed_products(db)
        after_products = db.query(CatalogProduct).count()
        print(
            f"  Products: {after_products} ({inserted_products} new, {before_products} before seed).",
        )

        before_reviews = db.query(CatalogProductReview).count()
        inserted_reviews = seed_reviews(db)
        after_reviews = db.query(CatalogProductReview).count()
        print(
            f"  Product reviews: {after_reviews} ({inserted_reviews} new, {before_reviews} before seed).",
        )

        before_categories = db.query(CatalogCategory).count()
        inserted_categories = seed_categories(db)
        after_categories = db.query(CatalogCategory).count()
        print(
            f"  Categories: {after_categories} ({inserted_categories} new, {before_categories} before seed).",
        )

        before_brands = db.query(CatalogBrand).count()
        inserted_brands = seed_brands(db)
        after_brands = db.query(CatalogBrand).count()
        print(
            f"  Brands: {after_brands} ({inserted_brands} new, {before_brands} before seed).",
        )

        before_collections = db.query(CatalogCollection).count()
        inserted_collections = seed_collections(db)
        after_collections = db.query(CatalogCollection).count()
        print(
            f"  Collections: {after_collections} ({inserted_collections} new, {before_collections} before seed).",
        )

        before_filters = db.query(CatalogFilter).count()
        inserted_filters = seed_filters(db)
        after_filters = db.query(CatalogFilter).count()
        print(
            f"  Filters: {after_filters} ({inserted_filters} new, {before_filters} before seed).",
        )

        before_cfg_profiles = db.query(ConfiguratorProfile).count()
        inserted_cfg_profiles = seed_configurator_profiles(db)
        after_cfg_profiles = db.query(ConfiguratorProfile).count()
        print(
            f"  Configurator profiles: {after_cfg_profiles} ({inserted_cfg_profiles} new, {before_cfg_profiles} before seed).",
        )

        before_cfg_categories = db.query(ConfiguratorCategory).count()
        inserted_cfg_categories = seed_configurator_categories(db)
        after_cfg_categories = db.query(ConfiguratorCategory).count()
        print(
            f"  Configurator categories: {after_cfg_categories} ({inserted_cfg_categories} new, {before_cfg_categories} before seed).",
        )

        before_cfg_templates = db.query(ConfiguratorTemplate).count()
        inserted_cfg_templates = seed_configurator_templates(db)
        after_cfg_templates = db.query(ConfiguratorTemplate).count()
        print(
            f"  Configurator templates: {after_cfg_templates} ({inserted_cfg_templates} new, {before_cfg_templates} before seed).",
        )

        before_cfg_builds = db.query(ConfiguratorBuild).count()
        inserted_cfg_builds = seed_configurator_builds(db)
        after_cfg_builds = db.query(ConfiguratorBuild).count()
        print(
            f"  Configurator builds: {after_cfg_builds} ({inserted_cfg_builds} new, {before_cfg_builds} before seed).",
        )

        linked = link_product_taxonomy(db)
        if linked:
            print(f"  Linked taxonomy on {linked} product(s).")

        before_profiles = db.query(CatalogAttributeProfile).count()
        inserted_profiles = seed_attribute_profiles(db)
        after_profiles = db.query(CatalogAttributeProfile).count()
        print(
            f"  Attribute profiles: {after_profiles} ({inserted_profiles} new, {before_profiles} before seed).",
        )

        before_variants = db.query(CatalogProductVariant).count()
        inserted_variants = seed_variants(db)
        after_variants = db.query(CatalogProductVariant).count()
        print(
            f"  Variants: {after_variants} ({inserted_variants} new, {before_variants} before seed).",
        )

        before_media = db.query(Media).count()
        inserted_media = seed_media(db)
        after_media = db.query(Media).count()
        print(
            f"  Media: {after_media} ({inserted_media} new, {before_media} before seed).",
        )

        before_warehouses = db.query(InventoryWarehouse).count()
        inserted_warehouses = seed_warehouses(db)
        after_warehouses = db.query(InventoryWarehouse).count()
        print(
            f"  Warehouses: {after_warehouses} ({inserted_warehouses} new, {before_warehouses} before seed).",
        )

        before_stock = db.query(InventoryStockLevel).count()
        inserted_stock = seed_stock_levels(db)
        after_stock = db.query(InventoryStockLevel).count()
        print(
            f"  Stock levels: {after_stock} ({inserted_stock} new, {before_stock} before seed).",
        )

        before_orders = db.query(CommerceOrder).count()
        inserted_orders = seed_orders(db)
        after_orders = db.query(CommerceOrder).count()
        print(
            f"  Orders: {after_orders} ({inserted_orders} new, {before_orders} before seed).",
        )

        before_customers = db.query(CommerceCustomer).count()
        inserted_customers = seed_customers(db)
        after_customers = db.query(CommerceCustomer).count()
        print(
            f"  Customers: {after_customers} ({inserted_customers} new, {before_customers} before seed).",
        )

        before_suppliers = db.query(CommerceSupplier).count()
        inserted_suppliers = seed_suppliers(db)
        after_suppliers = db.query(CommerceSupplier).count()
        print(
            f"  Suppliers: {after_suppliers} ({inserted_suppliers} new, {before_suppliers} before seed).",
        )

        before_returns = db.query(CommerceOrderReturn).count()
        inserted_returns = seed_returns(db)
        after_returns = db.query(CommerceOrderReturn).count()
        print(
            f"  Order returns: {after_returns} ({inserted_returns} new, {before_returns} before seed).",
        )

        before_refunds = db.query(CommerceOrderRefund).count()
        inserted_refunds = seed_refunds(db)
        after_refunds = db.query(CommerceOrderRefund).count()
        print(
            f"  Order refunds: {after_refunds} ({inserted_refunds} new, {before_refunds} before seed).",
        )

        before_approvals = db.query(AiApproval).count()
        inserted_approvals = seed_ai_approvals(db)
        after_approvals = db.query(AiApproval).count()
        print(
            f"  AI approvals: {after_approvals} ({inserted_approvals} new, {before_approvals} before seed).",
        )

        before_audit_logs = db.query(AiAuditLog).count()
        inserted_audit_logs = seed_ai_audit_logs(db)
        after_audit_logs = db.query(AiAuditLog).count()
        print(
            f"  AI audit logs: {after_audit_logs} ({inserted_audit_logs} new, {before_audit_logs} before seed).",
        )

        before_providers = db.query(AiProvider).count()
        inserted_providers = seed_ai_providers(db)
        after_providers = db.query(AiProvider).count()
        print(
            f"  AI providers: {after_providers} ({inserted_providers} new, {before_providers} before seed).",
        )

        before_connections = db.query(AiApiConnection).count()
        inserted_connections = seed_ai_connections(db)
        after_connections = db.query(AiApiConnection).count()
        print(
            f"  AI API connections: {after_connections} ({inserted_connections} new, {before_connections} before seed).",
        )
        inserted_cloudflare = seed_cloudflare_plugin(db)
        print(f"  Cloudflare plugin: {inserted_cloudflare} new row(s).")
        openai_sync = sync_env_openai_connection(db, test_connect=True)
        print(f"  OpenAI env sync: {openai_sync}")

        before_agents = db.query(AiAgent).count()
        inserted_agents = seed_ai_agents(db)
        after_agents = db.query(AiAgent).count()
        print(
            f"  AI agents: {after_agents} ({inserted_agents} new, {before_agents} before seed).",
        )

        before_tools = db.query(AiTool).count()
        inserted_tools = seed_ai_tools(db)
        after_tools = db.query(AiTool).count()
        print(
            f"  AI tools: {after_tools} ({inserted_tools} new, {before_tools} before seed).",
        )

        before_journeys = db.query(MarketingJourney).count()
        inserted_journeys = seed_journeys(db)
        after_journeys = db.query(MarketingJourney).count()
        print(
            f"  Journeys: {after_journeys} ({inserted_journeys} new, {before_journeys} before seed).",
        )

        before_audiences = db.query(MarketingAudience).count()
        inserted_audiences = seed_audiences(db)
        after_audiences = db.query(MarketingAudience).count()
        print(
            f"  Audiences: {after_audiences} ({inserted_audiences} new, {before_audiences} before seed).",
        )

        before_campaigns = db.query(MarketingCampaign).count()
        inserted_campaigns = seed_campaigns(db)
        after_campaigns = db.query(MarketingCampaign).count()
        print(
            f"  Campaigns: {after_campaigns} ({inserted_campaigns} new, {before_campaigns} before seed).",
        )

        before_coupons = db.query(MarketingCoupon).count()
        inserted_coupons = seed_coupons(db)
        after_coupons = db.query(MarketingCoupon).count()
        print(f"  Coupons: {after_coupons} ({inserted_coupons} new, {before_coupons} before seed).")

        before_meta = db.query(SeoMetaRecord).count()
        inserted_meta = seed_seo_meta(db)
        after_meta = db.query(SeoMetaRecord).count()
        print(f"  SEO meta: {after_meta} ({inserted_meta} new, {before_meta} before seed).")

        before_users = db.query(AuthUser).count()
        inserted_users = seed_auth_users(db)
        after_users = db.query(AuthUser).count()
        print(f"  Auth users: {after_users} ({inserted_users} new, {before_users} before seed).")
    finally:
        db.close()

    print("Done.")


if __name__ == "__main__":
    main()
