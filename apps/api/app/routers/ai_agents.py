from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.ai_agent import AiAgent
from app.schemas.ai_agent import (
    AiAgentListMeta,
    AiAgentListResponse,
    AiAgentRead,
    AiAgentResponse,
)

router = APIRouter(prefix="/agents", tags=["ai-agents"])


def _to_read(row: AiAgent) -> AiAgentRead:
    return AiAgentRead(
        id=row.id,
        company_id=row.company_id,
        name=row.name,
        domain=row.domain,
        status=row.status,
        tools=row.tools,
        runs_today=row.runs_today,
        model=row.model,
        description=row.description,
        created_at=row.created_at,
        updated_at=row.updated_at,
    )


@router.get("", response_model=AiAgentListResponse)
def list_agents(
    db: Session = Depends(get_db),
    status: Optional[str] = Query(default=None),
    domain: Optional[str] = Query(default=None),
) -> AiAgentListResponse:
    query = db.query(AiAgent).order_by(AiAgent.name.asc())

    if status:
        query = query.filter(AiAgent.status == status)
    if domain:
        query = query.filter(AiAgent.domain == domain)

    rows = query.all()
    data = [_to_read(row) for row in rows]
    return AiAgentListResponse(
        data=data,
        meta=AiAgentListMeta(count=len(data)),
    )


@router.get("/{agent_id}", response_model=AiAgentResponse)
def get_agent(agent_id: str, db: Session = Depends(get_db)) -> AiAgentResponse:
    row = db.get(AiAgent, agent_id)
    if not row:
        raise HTTPException(status_code=404, detail="Agent not found")
    return AiAgentResponse(data=_to_read(row))
