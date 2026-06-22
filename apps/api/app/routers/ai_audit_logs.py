from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.ai_audit_log import AiAuditLog
from app.schemas.ai_audit_log import (
    AiAuditLogListMeta,
    AiAuditLogListResponse,
    AiAuditLogRead,
    AiAuditLogResponse,
)

router = APIRouter(prefix="/audit-logs", tags=["ai-audit-logs"])


def _to_read(row: AiAuditLog) -> AiAuditLogRead:
    return AiAuditLogRead(
        id=row.id,
        company_id=row.company_id,
        action=row.action,
        agent=row.agent,
        user=row.user,
        summary=row.summary,
        tokens=row.tokens,
        logged_at=row.logged_at,
        created_at=row.created_at,
    )


@router.get("", response_model=AiAuditLogListResponse)
def list_audit_logs(
    db: Session = Depends(get_db),
    action: Optional[str] = Query(default=None),
    agent: Optional[str] = Query(default=None),
) -> AiAuditLogListResponse:
    query = db.query(AiAuditLog).order_by(AiAuditLog.logged_at.desc())

    if action:
        query = query.filter(AiAuditLog.action == action)
    if agent:
        query = query.filter(AiAuditLog.agent == agent)

    rows = query.all()
    data = [_to_read(row) for row in rows]
    return AiAuditLogListResponse(
        data=data,
        meta=AiAuditLogListMeta(count=len(data)),
    )


@router.get("/{log_id}", response_model=AiAuditLogResponse)
def get_audit_log(log_id: str, db: Session = Depends(get_db)) -> AiAuditLogResponse:
    row = db.get(AiAuditLog, log_id)
    if not row:
        raise HTTPException(status_code=404, detail="Audit log not found")
    return AiAuditLogResponse(data=_to_read(row))
