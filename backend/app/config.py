import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = os.environ.get("DATABASE_URL", "sqlite:///./gaintrack.db")
    secret_key: str = os.environ.get("SECRET_KEY", "change-me-in-production")
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 14  # 14 days, it's a personal app
    cors_origins: list[str] = os.environ.get("CORS_ORIGINS", "*").split(",")


settings = Settings()
