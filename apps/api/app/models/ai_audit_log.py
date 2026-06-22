from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import DateTime, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class AiAuditLog(Base):
    __tablename__ = "ai_audit_logs"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    company_id: Mapped[str] = mapped_column(String(36), nullable=False, default="default")
    action: Mapped[str] = mapped_column(String(80), nullable=False, index=True)
    agent: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    user: Mapped[str] = mapped_column(String(255), nullable=False)
    summary: Mapped[str] = mapped_column(Text, nullable=False)
    tokens: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    logged_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=func.now(),
    )
