#!/usr/bin/env python3
"""Sync OPENAI_API_KEY from apps/api/.env into ai_api_connections and test connect."""

from app.database import SessionLocal
from app.services.ai_connection_sync import sync_env_openai_connection


def main() -> None:
    db = SessionLocal()
    try:
        result = sync_env_openai_connection(db, test_connect=True)
        print(f"OpenAI connection sync: {result}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
