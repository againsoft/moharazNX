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

Railway injects `DATABASE_URL` automatically when PostgreSQL is linked (converted to `postgresql+psycopg` in `app/config.py`).

## Deploy on Railway (API + PostgreSQL)

Repo: [github.com/againsoft/moharazNX](https://github.com/againsoft/moharazNX)

### 1. Create project

1. [railway.app](https://railway.app) → **New Project**
2. **Deploy from GitHub repo** → select `againsoft/moharazNX`

### 2. Add PostgreSQL

1. Project → **+ New** → **Database** → **PostgreSQL**
2. Wait until the database is running

### 3. Add API service

1. **+ New** → **GitHub Repo** → same repo (or duplicate service)
2. Service **Settings**:

| Setting | Value |
|---------|-------|
| **Root Directory** | `apps/api` |
| **Start Command** | `uvicorn main:app --host 0.0.0.0 --port $PORT` |

(`apps/api/railway.toml` already defines build/start/pre-deploy.)

### 4. Connect database to API

1. Open **API service** → **Variables**
2. **+ New Variable** → **Add Reference** → select PostgreSQL → `DATABASE_URL`
3. Add manually:

```env
APP_ENV=production
APP_DEBUG=false
CORS_ORIGINS=https://your-app.vercel.app,http://localhost:3000
```

4. **Settings** → **Networking** → **Generate Domain** (public URL, e.g. `moharaznx-api.up.railway.app`)

### 5. Verify

- Health: `https://YOUR-RAILWAY-URL/health`
- Swagger: `https://YOUR-RAILWAY-URL/docs`
- Login seed: `admin@moharaznx.com` / `admin123` (from `init_db.py`, runs on pre-deploy)

### 6. Connect Vercel UI

Vercel env:

```env
NEXT_PUBLIC_API_URL=https://YOUR-RAILWAY-URL
```

### CLI (optional)

```bash
npm i -g @railway/cli
railway login
cd apps/api
railway link
railway run PYTHONPATH=. python scripts/init_db.py
```

## Spec reference

- AgainERP: `docs/03-business-modules/ecommerce/catalog/ARCHITECTURE.md`
- Table: `catalog_products`
