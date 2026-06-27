from functools import lru_cache

from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "MoharazNX API"
    app_env: str = "development"
    app_debug: bool = True

    database_url: str = "postgresql+psycopg://moharaznx:moharaznx@127.0.0.1:5433/moharaznx"

    api_host: str = "127.0.0.1"
    api_port: int = 8000
    api_reload: bool = True

    cors_origins: str = (
        "http://localhost:3000,http://127.0.0.1:3000,"
        "http://localhost:3002,http://127.0.0.1:3002,"
        "http://localhost:3003,http://127.0.0.1:3003"
    )

    cloudflare_oauth_client_id: str = ""
    cloudflare_oauth_client_secret: str = ""
    cloudflare_oauth_redirect_uri: str = "http://127.0.0.1:8000/api/v1/plugins/cloudflare/oauth/callback"
    cloudflare_oauth_scopes: str = "account.read account.r2.read"
    cloudflare_oauth_success_redirect: str = "http://localhost:3000/settings/plugins/cloudflare"

    # OpenAI — wired when real AI provider step lands (AgainERP-aligned)
    openai_api_key: str = ""

    @model_validator(mode="after")
    def normalize_database_url(self) -> "Settings":
        url = self.database_url
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql+psycopg://", 1)
        elif url.startswith("postgresql://"):
            url = url.replace("postgresql://", "postgresql+psycopg://", 1)
        # Railway public proxy requires SSL; internal *.railway.internal does not
        if ".railway.app" in url and "sslmode=" not in url:
            url += "&sslmode=require" if "?" in url else "?sslmode=require"
        object.__setattr__(self, "database_url", url)
        return self


@lru_cache
def get_settings() -> Settings:
    return Settings()
