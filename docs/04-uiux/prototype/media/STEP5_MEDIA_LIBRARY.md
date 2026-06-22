# Step 5 — Media Library (API + Admin)

**Status:** Done  
**Route:** `/media`  
**API:** `/api/v1/media`

## Goal

Wire the media library admin UI to PostgreSQL with file upload support.

## Backend

| Item | Detail |
|------|--------|
| Table | `media` — name, title, folder, url, type, mime, size, alt, metadata |
| Seed | 24 sample assets (images, videos, documents) |
| Endpoints | `GET/POST/PATCH/DELETE /media`, `POST /batch`, `POST /upload` |
| Storage | Files saved to `apps/api/uploads/media/` served at `/uploads/media/` |

## Frontend

| Item | Detail |
|------|--------|
| Hook | `useCatalogMedia` |
| Page | Browse, edit metadata, file upload, URL import → API |
| Store | `setItems` syncs API data for pickers across admin |

## Daily test

```bash
docker compose up -d
cd apps/api && source .venv/bin/activate && PYTHONPATH=. python scripts/init_db.py
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
cd apps/web && npm run dev
# → http://localhost:3000/media
curl http://127.0.0.1:8000/api/v1/media
```

## Next

**Step 6 — Inventory**
