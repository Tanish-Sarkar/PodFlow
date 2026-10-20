from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Application configuration via environment variables.
    """

    model_config = SettingsConfigDict(
        env_file=(".env", "../.env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_env: str = "development"
    app_url: str = "http://localhost:3000"
    api_url: str = "http://localhost:8000"
    database_url: str = "postgresql+psycopg://postgres:postgres@localhost:5432/podflow"

    @field_validator("database_url", mode="before")
    @classmethod
    def validate_database_url(cls, v: str | None) -> str:
        if not v or not str(v).strip():
            return "postgresql+psycopg://postgres:postgres@localhost:5432/podflow"
        return str(v).strip()

    # Supabase
    supabase_url: str | None = None
    supabase_anon_key: str | None = None
    supabase_service_role_key: str | None = None
    supabase_jwt_secret: str | None = None

    # Google / OAuth
    google_client_id: str | None = None
    google_client_secret: str | None = None

    # AI
    gemini_api_key: str | None = None



def get_settings() -> Settings:
    """
    Return the application settings.
    """
    return Settings()

