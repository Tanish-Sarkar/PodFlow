from pydantic import Field, SecretStr, field_validator
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
    database_url: SecretStr = SecretStr("postgresql+psycopg://podflow_app@localhost:5432/podflow")

    @field_validator("database_url", mode="before")
    @classmethod
    def validate_database_url(cls, v: str | SecretStr | None) -> SecretStr:
        if not v or not str(v).strip():
            return SecretStr("postgresql+psycopg://podflow_app@localhost:5432/podflow")
        return v if isinstance(v, SecretStr) else SecretStr(str(v).strip())

    @property
    def database_dsn(self) -> str:
        return self.database_url.get_secret_value()

    # Supabase
    supabase_url: str | None = None
    supabase_anon_key: SecretStr | None = None
    supabase_jwks_url: str | None = None

    # Google / OAuth
    google_client_id: str | None = None
    google_client_secret: SecretStr | None = None

    # AI
    gemini_api_key: SecretStr | None = None


def get_settings() -> Settings:
    """
    Return the application settings.
    """
    return Settings()


class AlembicSettings(BaseSettings):
    """Migration-only configuration. Never instantiate from FastAPI runtime code."""

    model_config = SettingsConfigDict(
        env_file=(".env", "../.env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    admin_database_url: SecretStr = Field(validation_alias="ALEMBIC_DATABASE_URL")

    @property
    def database_dsn(self) -> str:
        return self.admin_database_url.get_secret_value()


def get_alembic_settings() -> AlembicSettings:
    """Read admin credentials only in the migration environment."""
    return AlembicSettings()
