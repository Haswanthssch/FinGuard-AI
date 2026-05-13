from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=BACKEND_DIR / ".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    APP_NAME: str = "FinGuard AI Hub"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = "local"
    DEBUG: bool = True

    DATABASE_URL: str = "sqlite:///./finguard_aihub.db"

    JWT_SECRET_KEY: str = "CHANGE_ME_FOR_PRODUCTION"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "llama-3.3-70b-versatile"
    GROQ_TIMEOUT_SECONDS: float = 30.0

    AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT: str = ""
    AZURE_DOCUMENT_INTELLIGENCE_KEY: str = ""
    AZURE_DOCUMENT_INTELLIGENCE_API_VERSION: str = "2024-11-30"

    AZURE_BLOB_CONTAINER_URL: str = ""
    AZURE_BLOB_SAS_TOKEN: str = ""
    AZURE_BLOB_PDF_PREFIX: str = ""
    AZURE_BLOB_UPLOAD_PREFIX: str = "portfolio-uploads"

    AZURE_SEARCH_ENDPOINT: str = ""
    AZURE_SEARCH_ADMIN_KEY: str = ""
    AZURE_SEARCH_INDEX_NAME: str = "finguard-regulatory-rag"
    AZURE_SEARCH_API_VERSION: str = "2024-07-01"
    AZURE_SEARCH_SEMANTIC_CONFIG: str = ""

    AZURE_OPENAI_ENDPOINT: str = ""
    AZURE_OPENAI_API_KEY: str = ""
    AZURE_OPENAI_EMBEDDING_DEPLOYMENT: str = ""
    AZURE_OPENAI_API_VERSION: str = "2024-02-01"
    RAG_EMBEDDING_DIMENSIONS: int = 1536
    RAG_TOP_K: int = 5

    CORS_ORIGINS_RAW: str = Field(
        default="http://localhost:5173,http://127.0.0.1:5173,https://finguard-ai-hxgbabhpcqare4aa.koreacentral-01.azurewebsites.net",
        alias="CORS_ORIGINS",
    )

    @property
    def CORS_ORIGINS(self) -> list[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS_RAW.split(",") if origin.strip()]


    @property
    def MODELS_DIR(self) -> Path:
        return BACKEND_DIR / "app" / "ml_models"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
