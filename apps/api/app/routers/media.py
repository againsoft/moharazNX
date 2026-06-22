from __future__ import annotations

import re
import uuid
from pathlib import Path
from typing import List, Optional

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile
from sqlalchemy.orm import Session

from app.services.media_storage import save_media_bytes, get_cloudflare_plugin
from app.services.cloudflare_client import delete_from_r2
from app.deps.auth import require_write_access
from app.database import get_db
from app.models.media import Media
from app.schemas.media import (
    MediaBatchCreateRequest,
    MediaCreate,
    MediaListMeta,
    MediaListResponse,
    MediaRead,
    MediaResponse,
    MediaUpdate,
    derive_labels_from_file_name,
)

router = APIRouter(prefix="/media", tags=["media"])

UPLOAD_DIR = Path(__file__).resolve().parents[2] / "uploads" / "media"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_IMAGE = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".avif", ".bmp"}
ALLOWED_VIDEO = {".mp4", ".webm", ".mov", ".m4v", ".ogv"}
ALLOWED_DOC = {".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".txt", ".csv", ".rtf", ".odt", ".ods"}


def _to_read(row: Media) -> MediaRead:
    return MediaRead.model_validate(row)


def _apply_patch(row: Media, payload: MediaUpdate) -> None:
    changes = payload.model_dump(exclude_unset=True)
    if not changes:
        return

    if "name" in changes and changes["name"] != row.name:
        new_name = changes["name"]
        title, alt = derive_labels_from_file_name(new_name)
        if row.title_linked_to_name:
            row.title = title
        if row.alt_linked_to_name:
            row.alt = alt
        if row.local_path:
            slash = row.local_path.rfind("/")
            row.local_path = (
                f"{row.local_path[: slash + 1]}{new_name}" if slash >= 0 else new_name
            )
        row.name = new_name
        changes.pop("name", None)

    if "title" in changes:
        row.title = changes["title"]
        row.title_linked_to_name = False
        changes.pop("title", None)

    if "alt" in changes:
        row.alt = changes["alt"]
        row.alt_linked_to_name = False
        changes.pop("alt", None)

    for key, value in changes.items():
        setattr(row, key, value)


def _classify_filename(filename: str, mime: str) -> str:
    ext = Path(filename).suffix.lower()
    if ext in ALLOWED_VIDEO or mime.startswith("video/"):
        return "video"
    if ext in ALLOWED_DOC or mime.startswith("application/") or mime.startswith("text/"):
        return "document"
    return "image"


def _public_upload_url(filename: str) -> str:
    from app.config import get_settings

    settings = get_settings()
    return f"http://{settings.api_host}:{settings.api_port}/uploads/media/{filename}"


@router.get("", response_model=MediaListResponse)
def list_media(
    db: Session = Depends(get_db),
    query: Optional[str] = Query(None),
    media_type: Optional[str] = Query(None, alias="type"),
) -> MediaListResponse:
    q = db.query(Media).order_by(Media.created_at.desc())
    if media_type:
        q = q.filter(Media.media_type == media_type)
    if query:
        term = f"%{query.strip()}%"
        q = q.filter(
            (Media.name.ilike(term))
            | (Media.title.ilike(term))
            | (Media.alt.ilike(term))
        )
    rows = q.all()
    return MediaListResponse(
        data=[_to_read(r) for r in rows],
        meta=MediaListMeta(count=len(rows)),
    )


@router.get("/{media_id}", response_model=MediaResponse)
def get_media(media_id: str, db: Session = Depends(get_db)) -> MediaResponse:
    row = db.get(Media, media_id)
    if not row:
        raise HTTPException(status_code=404, detail="Media not found")
    return MediaResponse(data=_to_read(row))


@router.post("", response_model=MediaResponse, status_code=201)
def create_media(
    payload: MediaCreate,
    db: Session = Depends(get_db),
    _: object = Depends(require_write_access),
) -> MediaResponse:
    row = Media(**payload.model_dump())
    db.add(row)
    db.commit()
    db.refresh(row)
    return MediaResponse(data=_to_read(row))


@router.post("/batch", response_model=MediaListResponse, status_code=201)
def create_media_batch(
    payload: MediaBatchCreateRequest,
    db: Session = Depends(get_db),
    _: object = Depends(require_write_access),
) -> MediaListResponse:
    rows: List[Media] = []
    for item in payload.items:
        row = Media(**item.model_dump())
        db.add(row)
        rows.append(row)
    db.commit()
    for row in rows:
        db.refresh(row)
    data = [_to_read(r) for r in rows]
    return MediaListResponse(data=data, meta=MediaListMeta(count=len(data)))


@router.post("/upload", response_model=MediaListResponse, status_code=201)
async def upload_media(
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
    _: object = Depends(require_write_access),
) -> MediaListResponse:
    if not files:
        raise HTTPException(status_code=400, detail="No files provided")

    created: List[Media] = []
    for upload in files:
        filename = upload.filename or "upload.bin"
        ext = Path(filename).suffix.lower()
        allowed = ALLOWED_IMAGE | ALLOWED_VIDEO | ALLOWED_DOC
        if ext not in allowed:
            continue

        safe_name = re.sub(r"[^a-zA-Z0-9._-]", "_", filename)
        stored = f"{uuid.uuid4().hex}_{safe_name}"
        content = await upload.read()

        mime = upload.content_type or "application/octet-stream"
        media_type = _classify_filename(filename, mime)
        title, alt = derive_labels_from_file_name(filename)
        public_url, local_path, provider = save_media_bytes(db, stored, content, mime)
        row = Media(
            name=filename,
            title=title,
            folder="Documents" if media_type == "document" else "Uploads",
            url=public_url,
            media_type=media_type,
            mime_type=mime,
            size_kb=max(1, len(content) // 1024),
            alt=alt if media_type != "document" else title,
            local_path=local_path,
            imported_by="file",
            provider=provider,
            uploaded_by="You",
            title_linked_to_name=True,
            alt_linked_to_name=media_type != "document",
        )
        db.add(row)
        created.append(row)

    if not created:
        raise HTTPException(status_code=400, detail="No allowed files in upload")

    db.commit()
    for row in created:
        db.refresh(row)

    data = [_to_read(r) for r in created]
    return MediaListResponse(data=data, meta=MediaListMeta(count=len(data)))


@router.patch("/{media_id}", response_model=MediaResponse)
def update_media(
    media_id: str,
    payload: MediaUpdate,
    db: Session = Depends(get_db),
    _: object = Depends(require_write_access),
) -> MediaResponse:
    row = db.get(Media, media_id)
    if not row:
        raise HTTPException(status_code=404, detail="Media not found")
    _apply_patch(row, payload)
    db.commit()
    db.refresh(row)
    return MediaResponse(data=_to_read(row))


def _delete_media_row(row: Media, db: Session) -> None:
    if row.provider == "r2" and row.local_path and row.local_path.startswith("r2://"):
        try:
            cf = get_cloudflare_plugin(db)
            if cf:
                key = row.local_path.split("/", 2)[-1]
                delete_from_r2(cf, key)
        except Exception:
            pass
    db.delete(row)


@router.delete("/bulk", status_code=204)
def delete_media_bulk(
    ids: List[str],
    db: Session = Depends(get_db),
    _: object = Depends(require_write_access),
) -> None:
    for media_id in ids:
        row = db.get(Media, media_id)
        if row:
            _delete_media_row(row, db)
    db.commit()


@router.delete("/{media_id}", status_code=204)
def delete_media(
    media_id: str,
    db: Session = Depends(get_db),
    _: object = Depends(require_write_access),
) -> None:
    row = db.get(Media, media_id)
    if not row:
        raise HTTPException(status_code=404, detail="Media not found")
    _delete_media_row(row, db)
    db.commit()
