from fastapi import APIRouter

from app.config import get_settings
from app.database import check_database_connection
from app.schemas.product import HealthResponse

router = APIRouter(tags=["health"])
settings = get_settings()


@router.get("/health", response_model=HealthResponse)
def health_check() -> HealthResponse:
    db = check_database_connection()
    return HealthResponse(
        status="ok" if db.get("ok") else "degraded",
        app=settings.app_name,
        env=settings.app_env,
        database=db,
    )
