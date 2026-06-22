from collections.abc import Generator

from sqlalchemy import create_engine, text
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.config import get_settings


def _normalize_database_url(url: str) -> str:
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql+psycopg://", 1)
    elif url.startswith("postgresql://"):
        url = url.replace("postgresql://", "postgresql+psycopg://", 1)
    return url


class Base(DeclarativeBase):
    pass


settings = get_settings()
database_url = _normalize_database_url(settings.database_url)

engine = create_engine(
    database_url,
    pool_pre_ping=True,
    pool_recycle=3600,
)

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def check_database_connection() -> dict:
    """Ping database — used by /health and test script."""
    try:
        with engine.connect() as conn:
            row = conn.execute(text("SELECT 1 AS ok")).mappings().one()
            version = conn.execute(text("SELECT version() AS version")).mappings().one()
        return {"ok": row["ok"] == 1, "version": version["version"]}
    except Exception as exc:
        return {"ok": False, "error": str(exc)}
