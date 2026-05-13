"""
Application configuration — reads from .env or environment variables.
"""
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator
from functools import lru_cache
import os
from typing import Any


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(__file__), "../../../.env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # App
    APP_NAME: str = "PortfolioRisk"
    APP_ENV: str = "development"
    DEBUG: bool = True
    SECRET_KEY: str = "changeme"

    # DB
    DATABASE_URL: str = "postgresql://portfolio:portfolio@localhost:5432/portfolio_db"

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # Paths (relative to backend/)
    CACHE_DIR: str = "./data_cache"
    MODELS_DIR: str = "./trained_models"
    DATASETS_DIR: str = "./datasets"

    # Market data
    HISTORICAL_YEARS: int = 5

    # ML
    SYNTHETIC_N: int = 50000

    # CORS — comma-separated string or JSON list
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"

    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def parse_origins(cls, v: Any) -> Any:
        if isinstance(v, list):
            return ",".join(v)
        return v

    @property
    def CORS_ORIGINS(self) -> list[str]:
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",") if o.strip()]

    @property
    def NIFTY_SYMBOL(self) -> str:
        return "^NSEI"

    @property
    def ASSET_MASTER_PATH(self) -> str:
        return os.path.join(self.DATASETS_DIR, "asset_master.csv")

    @property
    def SYNTHETIC_PATH(self) -> str:
        return os.path.join(self.DATASETS_DIR, "synthetic_portfolios.parquet")


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
