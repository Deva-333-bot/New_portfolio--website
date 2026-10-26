import os
from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field, field_validator

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

    APP_ENV: str = "development"
    DEBUG: bool = True
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    CANONICAL_SITE_URL: str = "http://localhost:3000"
    API_BASE_URL: str = "http://localhost:8000"

    DATABASE_URL: str = "sqlite:///./portfolio.db"

    SESSION_SECRET: str = "super_secret_session_token_portfolio_enterprise_key"
    PASSWORD_RESET_SECRET: str = "super_secret_password_reset_token_portfolio_key"
    SESSION_EXPIRE_HOURS: int = 24

    FRONTEND_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"

    ADMIN_BOOTSTRAP_EMAIL: str = "admin@florante.tech"
    ADMIN_BOOTSTRAP_PASSWORD: str = "AdminPass2026!"

    EMAIL_PROVIDER: str = "console"
    EMAIL_FROM_ADDRESS: str = "hello@florante.tech"
    EMAIL_PROVIDER_API_KEY: Optional[str] = None
    SMTP_HOST: Optional[str] = None
    SMTP_PORT: int = 587
    SMTP_USER: Optional[str] = None
    SMTP_PASS: Optional[str] = None

    GITHUB_TOKEN: Optional[str] = None
    GITHUB_USERNAME: Optional[str] = "florantetech"

    STORAGE_BACKEND: str = "local"
    LOCAL_STORAGE_DIR: str = "./uploads"
    MAX_UPLOAD_SIZE_BYTES: int = 10485760

    RATE_LIMIT_LOGIN_PER_MINUTE: int = 20
    RATE_LIMIT_CONTACT_PER_MINUTE: int = 10
    RATE_LIMIT_ANALYTICS_PER_MINUTE: int = 120

    @property
    def cors_origins(self) -> List[str]:
        return [origin.strip() for origin in self.FRONTEND_ORIGINS.split(",") if origin.strip()]

settings = Settings()
