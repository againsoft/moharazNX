from collections.abc import Generator

from sqlalchemy import create_engine, text
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.config import get_settings


class Base(DeclarativeBase):
    pass


def _coerce_psycopg3_url(url: str) -> str:
    """Normalise a Postgres connection URL to use the psycopg3 SQLAlchemy dialect.

    Railway (and many other platforms) supply DATABASE_URL with the plain
    ``postgresql://`` or ``postgresql+psycopg2://`` scheme.  SQLAlchemy maps
    those to the psycopg2 driver, which is not installed.  Rewrite them to
    ``postgresql+psycopg://`` so SQLAlchemy uses the psycopg3 driver that
    *is* installed via ``psycopg[binary]`` in requirements.txt.
    """
    for old_prefix in (
        "postgresql+psycopg2://",
        "postgres+psycopg2://",
        "postgresql://",
        "postgres://",
    ):
        if url.startswith(old_prefix):
            return "postgresql+psycopg://" + url[len(old_prefix):]
    return url


settings = get_settings()

engine = create_engine(
    _coerce_psycopg3_url(settings.database_url),
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
    with engine.connect() as conn:
        row = conn.execute(text("SELECT 1 AS ok")).mappings().one()
        version = conn.execute(text("SELECT VERSION() AS version")).mappings().one()
    return {"ok": row["ok"] == 1, "version": version["version"]}
