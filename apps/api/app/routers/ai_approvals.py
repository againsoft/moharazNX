from __future__ import annotations

from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.deps.auth import require_write_access
from app.database import get_db
from app.models.ai_approval import AiApproval
from app.models.auth_user import AuthUser
from app.schemas.ai_approval import (
    AiApprovalListMeta,
    AiApprovalListResponse,
    AiApprovalRead,
    AiApprovalResponse,
    AiApprovalUpdate,
)

router = APIRouter(prefix="/approvals", tags=["ai-approvals"])


def _to_read(row: AiApproval) -> AiApprovalRead:
    return AiApprovalRead(
        id=row.id,
        company_id=row.company_id,
        agent=row.agent,
        tool=row.tool,
        summary=row.summary,
        reason=row.reason,
        risk=row.risk,
        status=row.status,
        entity=row.entity,
        requested_at=row.requested_at,
        resolved_at=row.resolved_at,
        resolved_by=row.resolved_by,
        created_at=row.created_at,
        updated_at=row.updated_at,
    )


@router.get("", response_model=AiApprovalListResponse)
def list_approvals(
    db: Session = Depends(get_db),
    status: Optional[str] = Query(default=None),
    risk: Optional[str] = Query(default=None),
) -> AiApprovalListResponse:
    query = db.query(AiApproval).order_by(AiApproval.requested_at.desc())

    if status:
        query = query.filter(AiApproval.status == status)
    if risk:
        query = query.filter(AiApproval.risk == risk)

    rows = query.all()
    data = [_to_read(row) for row in rows]
    pending_count = sum(1 for row in rows if row.status == "pending")
    return AiApprovalListResponse(
        data=data,
        meta=AiApprovalListMeta(count=len(data), pending_count=pending_count),
    )


@router.get("/{approval_id}", response_model=AiApprovalResponse)
def get_approval(approval_id: str, db: Session = Depends(get_db)) -> AiApprovalResponse:
    row = db.get(AiApproval, approval_id)
    if not row:
        raise HTTPException(status_code=404, detail="Approval not found")
    return AiApprovalResponse(data=_to_read(row))


@router.patch("/{approval_id}", response_model=AiApprovalResponse)
def update_approval(
    approval_id: str,
    payload: AiApprovalUpdate,
    db: Session = Depends(get_db),
    user: AuthUser = Depends(require_write_access),
) -> AiApprovalResponse:
    row = db.get(AiApproval, approval_id)
    if not row:
        raise HTTPException(status_code=404, detail="Approval not found")
    if row.status != "pending":
        raise HTTPException(status_code=409, detail="Approval already resolved")

    row.status = payload.status
    row.resolved_at = datetime.utcnow()
    row.resolved_by = user.email

    db.commit()
    db.refresh(row)
    return AiApprovalResponse(data=_to_read(row))
