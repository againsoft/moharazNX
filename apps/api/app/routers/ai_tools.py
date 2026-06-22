from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.ai_tool import AiTool
from app.schemas.ai_tool import (
    AiToolListMeta,
    AiToolListResponse,
    AiToolRead,
    AiToolResponse,
)

router = APIRouter(prefix="/tools", tags=["ai-tools"])


def _to_read(row: AiTool) -> AiToolRead:
    return AiToolRead(
        id=row.id,
        company_id=row.company_id,
        name=row.name,
        agent=row.agent,
        category=row.category,
        risk=row.risk,
        description=row.description,
        created_at=row.created_at,
        updated_at=row.updated_at,
    )


@router.get("", response_model=AiToolListResponse)
def list_tools(
    db: Session = Depends(get_db),
    category: Optional[str] = Query(default=None),
    agent: Optional[str] = Query(default=None),
    risk: Optional[str] = Query(default=None),
) -> AiToolListResponse:
    query = db.query(AiTool).order_by(AiTool.category.asc(), AiTool.name.asc())

    if category:
        query = query.filter(AiTool.category == category)
    if agent:
        query = query.filter(AiTool.agent == agent)
    if risk:
        query = query.filter(AiTool.risk == risk)

    rows = query.all()
    data = [_to_read(row) for row in rows]
    return AiToolListResponse(
        data=data,
        meta=AiToolListMeta(count=len(data)),
    )


@router.get("/{tool_id}", response_model=AiToolResponse)
def get_tool(tool_id: str, db: Session = Depends(get_db)) -> AiToolResponse:
    row = db.get(AiTool, tool_id)
    if not row:
        raise HTTPException(status_code=404, detail="Tool not found")
    return AiToolResponse(data=_to_read(row))
