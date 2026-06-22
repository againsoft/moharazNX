from pathlib import Path
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import get_settings
from app.database import SessionLocal
from app.deps.auth import get_current_user, require_admin_user
from app.services.ai_connection_sync import sync_env_openai_connection
from app.routers import (
    ai_approvals,
    ai_audit_logs,
    ai_connections,
    ai_dashboard,
    ai_providers,
    ai_agents,
    ai_tools,
    auth,
    auth_users,
    catalog_attribute_profiles,
    catalog_brands,
    catalog_categories,
    catalog_collections,
    catalog_filters,
    catalog_products,
    catalog_variants,
    catalog_reviews,
    commerce_orders,
    commerce_customers,
    commerce_suppliers,
    commerce_returns,
    commerce_refunds,
    configurator_builds,
    configurator_categories,
    configurator_profiles,
    configurator_templates,
    health,
    inventory_stock,
    inventory_warehouses,
    marketing_journeys,
    marketing_audiences,
    marketing_campaigns,
    marketing_coupons,
    media,
    plugins_cloudflare,
    seo_meta,
    storefront_cart,
    storefront_chat,
    storefront_checkout,
    storefront_products,
)

settings = get_settings()

require_admin = [Depends(get_current_user)]


def _bootstrap() -> None:
    db = SessionLocal()
    try:
        import scripts.init_db  # noqa: F401 — register all models
        from app.database import Base, engine
        from app.models.auth_user import AuthUser
        from scripts.init_db import (
            ensure_auth_user_columns,
            ensure_cloudflare_plugin_columns,
            ensure_product_columns,
            main as seed_database,
        )

        Base.metadata.create_all(bind=engine)
        ensure_cloudflare_plugin_columns()
        ensure_product_columns()
        ensure_auth_user_columns()

        if db.query(AuthUser).count() == 0:
            db.close()
            seed_database()
            db = SessionLocal()

        sync_env_openai_connection(db, test_connect=False)
    except Exception:
        pass
    finally:
        db.close()


@asynccontextmanager
async def lifespan(_app: FastAPI):
    import threading
    threading.Thread(target=_bootstrap, daemon=True).start()
    yield


app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

origins = [o.strip() for o in settings.cors_origins.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(auth.router, prefix="/api/v1")
app.include_router(
    auth_users.router,
    prefix="/api/v1/auth",
    dependencies=[Depends(require_admin_user)],
)
app.include_router(catalog_products.router, prefix="/api/v1/catalog", dependencies=require_admin)
app.include_router(catalog_categories.router, prefix="/api/v1/catalog", dependencies=require_admin)
app.include_router(catalog_collections.router, prefix="/api/v1/catalog", dependencies=require_admin)
app.include_router(catalog_filters.router, prefix="/api/v1/catalog", dependencies=require_admin)
app.include_router(catalog_brands.router, prefix="/api/v1/catalog", dependencies=require_admin)
app.include_router(catalog_attribute_profiles.router, prefix="/api/v1/catalog", dependencies=require_admin)
app.include_router(catalog_variants.router, prefix="/api/v1/catalog", dependencies=require_admin)
app.include_router(catalog_reviews.router, prefix="/api/v1/catalog", dependencies=require_admin)
app.include_router(commerce_orders.router, prefix="/api/v1/commerce", dependencies=require_admin)
app.include_router(commerce_customers.router, prefix="/api/v1/commerce", dependencies=require_admin)
app.include_router(commerce_suppliers.router, prefix="/api/v1/commerce", dependencies=require_admin)
app.include_router(commerce_returns.router, prefix="/api/v1/commerce", dependencies=require_admin)
app.include_router(commerce_refunds.router, prefix="/api/v1/commerce", dependencies=require_admin)
app.include_router(ai_approvals.router, prefix="/api/v1/ai", dependencies=require_admin)
app.include_router(ai_connections.router, prefix="/api/v1/ai", dependencies=require_admin)
app.include_router(ai_audit_logs.router, prefix="/api/v1/ai", dependencies=require_admin)
app.include_router(ai_dashboard.router, prefix="/api/v1/ai", dependencies=require_admin)
app.include_router(ai_providers.router, prefix="/api/v1/ai", dependencies=require_admin)
app.include_router(ai_agents.router, prefix="/api/v1/ai", dependencies=require_admin)
app.include_router(ai_tools.router, prefix="/api/v1/ai", dependencies=require_admin)
app.include_router(plugins_cloudflare.router, prefix="/api/v1")
app.include_router(media.router, prefix="/api/v1", dependencies=require_admin)
app.include_router(inventory_warehouses.router, prefix="/api/v1/inventory", dependencies=require_admin)
app.include_router(inventory_stock.router, prefix="/api/v1/inventory", dependencies=require_admin)
app.include_router(marketing_journeys.router, prefix="/api/v1/marketing", dependencies=require_admin)
app.include_router(marketing_audiences.router, prefix="/api/v1/marketing", dependencies=require_admin)
app.include_router(marketing_campaigns.router, prefix="/api/v1/marketing", dependencies=require_admin)
app.include_router(marketing_coupons.router, prefix="/api/v1/marketing", dependencies=require_admin)
app.include_router(seo_meta.router, prefix="/api/v1/seo", dependencies=require_admin)
app.include_router(configurator_profiles.router, prefix="/api/v1/configurator", dependencies=require_admin)
app.include_router(configurator_categories.router, prefix="/api/v1/configurator", dependencies=require_admin)
app.include_router(configurator_templates.router, prefix="/api/v1/configurator", dependencies=require_admin)
app.include_router(configurator_builds.router, prefix="/api/v1/configurator", dependencies=require_admin)
app.include_router(storefront_products.router, prefix="/api/v1/storefront")
app.include_router(storefront_cart.router, prefix="/api/v1/storefront")
app.include_router(storefront_checkout.router, prefix="/api/v1/storefront")
app.include_router(storefront_chat.router, prefix="/api/v1/storefront")

UPLOAD_ROOT = Path(__file__).resolve().parent / "uploads"
UPLOAD_ROOT.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_ROOT)), name="uploads")


@app.get("/")
def root() -> dict:
    return {
        "app": settings.app_name,
        "docs": "/docs",
        "health": "/health",
        "catalog": {
            "products": "/api/v1/catalog/products",
            "categories": "/api/v1/catalog/categories",
            "brands": "/api/v1/catalog/brands",
            "attribute_profiles": "/api/v1/catalog/attribute-profiles",
            "variants": "/api/v1/catalog/variants",
            "reviews": "/api/v1/catalog/reviews",
        },
        "media": "/api/v1/media",
        "inventory": {
            "warehouses": "/api/v1/inventory/warehouses",
            "stock": "/api/v1/inventory/stock",
        },
        "commerce": {
            "orders": "/api/v1/commerce/orders",
            "customers": "/api/v1/commerce/customers",
            "suppliers": "/api/v1/commerce/suppliers",
            "returns": "/api/v1/commerce/returns",
            "refunds": "/api/v1/commerce/refunds",
        },
        "marketing": {
            "journeys": "/api/v1/marketing/journeys",
            "audiences": "/api/v1/marketing/audiences",
            "campaigns": "/api/v1/marketing/campaigns",
            "coupons": "/api/v1/marketing/coupons",
        },
        "seo": {
            "meta": "/api/v1/seo/meta",
        },
        "auth": {
            "login": "/api/v1/auth/login",
            "me": "/api/v1/auth/me",
            "logout": "/api/v1/auth/logout",
        },
        "storefront": {
            "products": "/api/v1/storefront/products",
            "cart": "/api/v1/storefront/cart",
            "checkout": "/api/v1/storefront/checkout",
            "chat": "/api/v1/storefront/chat",
        },
        "ai": {
            "approvals": "/api/v1/ai/approvals",
            "audit_logs": "/api/v1/ai/audit-logs",
            "dashboard": "/api/v1/ai/dashboard",
            "providers": "/api/v1/ai/providers",
            "agents": "/api/v1/ai/agents",
            "tools": "/api/v1/ai/tools",
        },
    }
