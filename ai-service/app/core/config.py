"""
Centralized Configuration for CapstoneX AI Service.
All environment variables and settings in one place with validation.
"""
import os
from typing import Optional, List
from pydantic_settings import BaseSettings
from pydantic import Field, field_validator


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # ── Service ──
    SERVICE_NAME: str = "capstonex-ai-service"
    SERVICE_VERSION: str = "2.0.0"
    DEBUG: bool = False
    LOG_LEVEL: str = "INFO"

    # ── Security ──
    AI_INTERNAL_SECRET: str = Field(
        ...,
        description="Secret token for backend-to-AI-service authentication. MUST be set.",
    )

    # ── Database (PostgreSQL) ──
    DATABASE_URL: str = Field(
        default="postgresql+asyncpg://capstonex:capstonex_pass@localhost:5432/capstonex_db",
        description="PostgreSQL connection URL for direct data access.",
    )
    DB_POOL_SIZE: int = 5
    DB_MAX_OVERFLOW: int = 10

    # ── Redis (optional — graceful degradation) ──
    REDIS_URL: Optional[str] = None
    REDIS_TTL_SECONDS: int = 3600  # 1 hour default cache TTL

    # ── Embedding Model ──
    EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"
    EMBEDDING_DIMENSION: int = 384

    # ── FAISS ──
    FAISS_INDEX_PATH: str = "data/faiss_index"

    # ── LLM Provider ──
    LLM_PROVIDER: str = Field(
        default="fallback",
        description="'openai' for GPT-4o, 'fallback' for template-based.",
    )
    OPENAI_API_KEY: str = Field(default="", description="API key for OpenAI")
    OPENAI_MODEL: str = Field(default="gpt-4o-mini", description="Model version")
    OPENAI_BASE_URL: str = Field(default="", description="Base URL for OpenAI SDK")
    PORT: int = Field(default=8000, description="Service port")
    OPENAI_FALLBACK_MODEL: str = "gpt-3.5-turbo"
    OPENAI_MAX_TOKENS: int = 2000
    OPENAI_TEMPERATURE: float = 0.7

    # ── Model Training ──
    MODEL_DIR: str = "app/ml/models"
    MIN_TRAINING_SAMPLES: int = 50
    RISK_AUC_THRESHOLD: float = 0.75
    SCORING_R2_THRESHOLD: float = 0.60

    # ── SHAP Explainability ──
    SHAP_ENABLED: bool = True
    SHAP_MAX_SAMPLES: int = 100

    # ── Feature Engineering ──
    FEATURE_CACHE_TTL: int = 1800  # 30 min

    # ── External Services ──
    BACKEND_URL: str = "http://localhost:5000"
    FRONTEND_URL: str = "http://localhost:3000"
    GITHUB_TOKEN: Optional[str] = None

    # ── Monitoring ──
    PROMETHEUS_ENABLED: bool = False
    MODEL_REGISTRY_ENABLED: bool = True

    @field_validator("AI_INTERNAL_SECRET")
    @classmethod
    def validate_secret(cls, v: str) -> str:
        if not v or len(v) < 8:
            raise ValueError(
                "AI_INTERNAL_SECRET must be set and at least 8 characters. "
                "This is required for backend→AI service authentication."
            )
        return v

    @property
    def openai_available(self) -> bool:
        """Check if OpenAI is configured and usable."""
        return self.LLM_PROVIDER == "openai" and bool(self.OPENAI_API_KEY)

    @property
    def redis_available(self) -> bool:
        """Check if Redis is configured."""
        return bool(self.REDIS_URL)

    @property
    def has_sufficient_data(self) -> bool:
        """Placeholder — actual check done by checking DB counts."""
        return True

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


# Singleton settings instance — import this everywhere
_settings: Optional[Settings] = None


def get_settings() -> Settings:
    """Get the singleton Settings instance. Lazy-loaded on first call."""
    global _settings
    if _settings is None:
        _settings = Settings()
    return _settings
