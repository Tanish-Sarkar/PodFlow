from podflow.core.config import AlembicSettings, Settings


def test_admin_database_setting_is_migration_only():
    runtime_url = "postgresql+psycopg://podflow_app@localhost:5432/podflow"
    admin_url = "postgresql+psycopg://migration_user@localhost:5432/podflow"

    application_settings = Settings(DATABASE_URL=runtime_url, ALEMBIC_DATABASE_URL=admin_url)
    migration_settings = AlembicSettings(ALEMBIC_DATABASE_URL=admin_url)

    assert "admin_database_url" not in Settings.model_fields
    assert application_settings.database_dsn == runtime_url
    assert migration_settings.database_dsn == admin_url
