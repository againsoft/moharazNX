# MoharazNX API

FastAPI backend for MoharazNX ecommerce — catalog, orders, storefront (Phase 2).

## Stack (AgainERP-aligned)

Per [TECHNOLOGY_CONSTITUTION](../../againerp/docs/00-foundation/TECHNOLOGY_CONSTITUTION.md) and [ADR-001 PostgreSQL](../../againerp/docs/01-architecture/decisions/ADR-001-postgresql.md):

- **FastAPI** + **SQLAlchemy 2**
- **PostgreSQL 16** (Docker Compose — local dev)
- **Forbidden:** MySQL, MariaDB, SQLite (production)

API prefix: `/api/v1/catalog/`

## Quick start

```bash
# 1. Start PostgreSQL (from repo root)
cd /Applications/XAMPP/xamppfiles/htdocs/moharaznx
docker compose up -d

# 2. Python venv + deps
cd apps/api
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# 3. Env
cp .env.example .env

# 4. Wait for postgres healthy, then init
docker compose ps   # postgres should be healthy
PYTHONPATH=. python scripts/init_db.py
PYTHONPATH=. python scripts/test_connection.py

# 5. Run API
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

## Endpoints

| Method | URL | Description |
|--------|-----|-------------|
| GET | `/health` | App + DB health |
| GET | `/api/v1/catalog/products` | List products |
| GET | `/api/v1/catalog/products/{id}` | Get product |
| POST | `/api/v1/catalog/products` | Create product |
| GET | `/docs` | Swagger UI |

## Environment

```
DATABASE_URL=postgresql+psycopg://moharaznx:moharaznx@127.0.0.1:5433/moharaznx
```

## Spec reference

- AgainERP: `docs/03-business-modules/ecommerce/catalog/ARCHITECTURE.md`
- Table: `catalog_products`
