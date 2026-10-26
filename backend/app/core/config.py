
import os
from typing import List, Optional

from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=os.path.join(
            os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
            ".env",
        ),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    APP_ENV: str = "development"
    DEBUG: bool = True
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    CANONICAL_SITE_URL: str = "http://localhost:3000"
    API_BASE_URL: str = "http://localhost:8000"

    DATABASE_URL: str = "sqlite:///./portfolio.db"

    SESSION_SECRET: str = ""
    PASSWORD_RESET_SECRET: str = ""
    SESSION_EXPIRE_HOURS: int = 24

    FRONTEND_ORIGINS: str = (
        "http://localhost:3000,http://127.0.0.1:3000"
    )

    ADMIN_BOOTSTRAP_EMAIL: str = "admin@florante.tech"
    ADMIN_BOOTSTRAP_PASSWORD: str = ""

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
        return [
            origin.strip().rstrip("/")
            for origin in self.FRONTEND_ORIGINS.split(",")
            if origin.strip()
        ]

    @model_validator(mode="after")
    def validate_production_secrets(self):
        if self.APP_ENV.lower() == "production":
            secrets_to_check = {
                "SESSION_SECRET": self.SESSION_SECRET,
                "PASSWORD_RESET_SECRET": self.PASSWORD_RESET_SECRET,
            }

            for name, value in secrets_to_check.items():
                normalized = (value or "").strip().lower()
                if (
                    len(value or "") < 32
                    or normalized.startswith(("change_me", "replace_", "your_", "example", "dev-only", "local-dev", "test-", "insecure"))
                    or "placeholder" in normalized
                ):
                    raise ValueError(
                        f"{name} must be a unique, non-placeholder secret of at least "
                        "32 characters in production."
                    )

            if self.SESSION_SECRET == self.PASSWORD_RESET_SECRET:
                raise ValueError("SESSION_SECRET and PASSWORD_RESET_SECRET must be different.")

            if self.DEBUG:
                raise ValueError("DEBUG must be False in production.")

            origins = self.cors_origins
            if not origins or "*" in origins or any(not origin.startswith("https://") for origin in origins):
                raise ValueError("FRONTEND_ORIGINS must contain explicit HTTPS origins in production.")

            if not self.CANONICAL_SITE_URL.startswith("https://"):
                raise ValueError("CANONICAL_SITE_URL must be an HTTPS frontend URL in production.")
            if not self.API_BASE_URL.startswith("https://"):
                raise ValueError("API_BASE_URL must be an HTTPS backend URL in production.")

            password = self.ADMIN_BOOTSTRAP_PASSWORD
            if (
                not password
                or len(password) < 14
                or password.strip().lower().startswith(("replace_", "change_me", "your_", "example"))
                or "placeholder" in password.strip().lower()
            ):
                raise ValueError(
                    "ADMIN_BOOTSTRAP_PASSWORD must be set to a strong "
                    "password of at least 14 characters in production."
                )

        return self


settings = Settings()
