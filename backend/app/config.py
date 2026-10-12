"""
Configuration settings for MtaaClean FastAPI backend.
Reads from environment variables or backend/.env file.
"""

from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    CLERK_SECRET_KEY: str = ""
    CLERK_PUBLISHABLE_KEY: str = ""
    CLERK_WEBHOOK_SECRET: str = ""
    SUPABASE_URL: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    ALLOWED_ORIGINS: str = "http://localhost:5173"

    @property
    def cors_origins(self) -> List[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


settings = Settings()
