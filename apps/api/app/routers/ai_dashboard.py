from __future__ import annotations

from datetime import datetime, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.ai_agent import AiAgent
from app.models.ai_approval import AiApproval
from app.models.ai_audit_log import AiAuditLog
from app.schemas.ai_dashboard import (
    AiDashboardAgentActivity,
    AiDashboardData,
    AiDashboardKpi,
    AiDashboardResponse,
    AiDashboardTokenDay,
)

router = APIRouter(prefix="/dashboard", tags=["ai-dashboard"])

TOKEN_BUDGET = 2_000_000
DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]


def _format_tokens(value: int) -> str:
    if value >= 1_000_000:
        return f"{value / 1_000_000:.2f}M"
    if value >= 1_000:
        return f"{round(value / 1_000)}k"
    return str(value)


def _agent_short_name(name: str) -> str:
    return name.replace(" Agent", "")


@router.get("", response_model=AiDashboardResponse)
def get_dashboard(db: Session = Depends(get_db)) -> AiDashboardResponse:
    now = datetime.utcnow()
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    yesterday_start = today_start - timedelta(days=1)
    week_start = today_start - timedelta(days=6)

    token_spend_month = (
        db.query(func.coalesce(func.sum(AiAuditLog.tokens), 0))
        .filter(AiAuditLog.logged_at >= month_start)
        .scalar()
    ) or 0

    pending_count = (
        db.query(func.count(AiApproval.id))
        .filter(AiApproval.status == "pending")
        .scalar()
    ) or 0

    high_risk_pending = (
        db.query(func.count(AiApproval.id))
        .filter(
            AiApproval.status == "pending",
            AiApproval.risk.in_(["high", "critical"]),
        )
        .scalar()
    ) or 0

    active_agents = (
        db.query(func.count(AiAgent.id))
        .filter(AiAgent.status == "active")
        .scalar()
    ) or 0

    idle_agents = (
        db.query(func.count(AiAgent.id))
        .filter(AiAgent.status == "idle")
        .scalar()
    ) or 0

    runs_today = (
        db.query(func.coalesce(func.sum(AiAgent.runs_today), 0))
        .scalar()
    ) or 0

    audit_runs_today = (
        db.query(func.count(AiAuditLog.id))
        .filter(AiAuditLog.logged_at >= today_start)
        .scalar()
    ) or 0

    audit_runs_yesterday = (
        db.query(func.count(AiAuditLog.id))
        .filter(
            AiAuditLog.logged_at >= yesterday_start,
            AiAuditLog.logged_at < today_start,
        )
        .scalar()
    ) or 0

    spend_pct = round(token_spend_month / TOKEN_BUDGET * 100) if TOKEN_BUDGET else 0

    runs_sub = "No prior day data"
    runs_up: bool | None = None
    if audit_runs_yesterday > 0:
        delta_pct = round((audit_runs_today - audit_runs_yesterday) / audit_runs_yesterday * 100)
        runs_up = delta_pct >= 0
        sign = "+" if delta_pct >= 0 else ""
        runs_sub = f"{sign}{delta_pct}% vs yesterday"

    kpis = [
        AiDashboardKpi(
            label="Token spend (month)",
            value=_format_tokens(int(token_spend_month)),
            sub=f"{spend_pct}% of 2M budget",
            pct=min(spend_pct, 100),
        ),
        AiDashboardKpi(
            label="Pending approvals",
            value=str(pending_count),
            sub=f"{high_risk_pending} high-risk" if high_risk_pending else "None high-risk",
            alert=high_risk_pending > 0,
        ),
        AiDashboardKpi(
            label="Active agents",
            value=str(active_agents),
            sub=f"{idle_agents} idle" if idle_agents else "All active",
        ),
        AiDashboardKpi(
            label="Agent runs (today)",
            value=str(int(runs_today)),
            sub=runs_sub,
            up=runs_up,
        ),
    ]

    daily_rows = (
        db.query(
            func.date(AiAuditLog.logged_at).label("day"),
            func.coalesce(func.sum(AiAuditLog.tokens), 0).label("tokens"),
        )
        .filter(AiAuditLog.logged_at >= week_start)
        .group_by(func.date(AiAuditLog.logged_at))
        .all()
    )
    tokens_by_date = {row.day: int(row.tokens) for row in daily_rows}

    token_usage_chart: list[AiDashboardTokenDay] = []
    for offset in range(7):
        day = week_start + timedelta(days=offset)
        day_key = day.date()
        token_usage_chart.append(
            AiDashboardTokenDay(
                day=DAY_LABELS[day.weekday()],
                tokens=tokens_by_date.get(day_key, 0),
            )
        )

    agent_rows = (
        db.query(AiAgent)
        .order_by(AiAgent.runs_today.desc(), AiAgent.name.asc())
        .limit(6)
        .all()
    )
    agent_activity_chart = [
        AiDashboardAgentActivity(
            agent=_agent_short_name(row.name),
            runs=row.runs_today,
        )
        for row in agent_rows
        if row.runs_today > 0
    ]

    return AiDashboardResponse(
        data=AiDashboardData(
            kpis=kpis,
            token_usage_chart=token_usage_chart,
            agent_activity_chart=agent_activity_chart,
        )
    )
