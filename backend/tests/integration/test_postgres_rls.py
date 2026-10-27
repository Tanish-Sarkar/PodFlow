import os
import uuid
from urllib.parse import urlsplit

import pytest
from sqlalchemy import create_engine, text
from sqlalchemy.exc import DBAPIError


@pytest.mark.skipif(
    not os.getenv("PODFLOW_TEST_RUNTIME_DATABASE_URL")
    or not os.getenv("PODFLOW_TEST_ADMIN_DATABASE_URL"),
    reason=(
        "Requires runtime and admin URIs for an explicitly disposable local PostgreSQL database"
    ),
)
def test_restricted_runtime_login_can_use_role_and_rls_scopes_rows():
    runtime_url = os.environ["PODFLOW_TEST_RUNTIME_DATABASE_URL"]
    admin_url = os.environ["PODFLOW_TEST_ADMIN_DATABASE_URL"]
    for url in (runtime_url, admin_url):
        assert urlsplit(url).hostname in {"localhost", "127.0.0.1", "::1"}, (
            "RLS integration tests are restricted to local disposable databases"
        )
    runtime_engine = create_engine(runtime_url, echo=False)
    admin_engine = create_engine(admin_url, echo=False)
    owner_one = owner_two = None
    try:
        with admin_engine.connect() as admin_connection:
            users = (
                admin_connection.execute(text("SELECT id FROM auth.users ORDER BY id LIMIT 2"))
                .scalars()
                .all()
            )
            if len(users) != 2:
                pytest.skip("The disposable Supabase test database needs two auth.users rows")
            owner_one, owner_two = users

        with runtime_engine.connect() as connection:
            login = connection.execute(
                text(
                    "SELECT session_user, current_user, pg_has_role(session_user, "
                    "'podflow_runtime', 'MEMBER')"
                )
            ).one()
            assert login[0] == login[1]
            assert login[2] is True
            login_flags = connection.execute(
                text(
                    "SELECT r.rolsuper, r.rolbypassrls, r.rolcreatedb, r.rolcreaterole, "
                    "r.rolinherit, r.rolreplication, "
                    "EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace "
                    "WHERE n.nspname='public' AND c.relname='resources' AND c.relowner=r.oid) "
                    "FROM pg_roles r WHERE r.rolname=session_user"
                )
            ).one()
            assert login_flags == (False, False, False, False, False, False, False)
            unexpected_memberships = connection.execute(
                text(
                    "SELECT count(*) FROM pg_auth_members m "
                    "JOIN pg_roles r ON r.oid=m.roleid "
                    "WHERE m.member=(SELECT oid FROM pg_roles WHERE rolname=session_user) "
                    "AND r.rolname <> 'podflow_runtime'"
                )
            ).scalar_one()
            assert unexpected_memberships == 0
            transaction = connection.begin() if not connection.in_transaction() else None
            try:
                connection.execute(text("SET LOCAL ROLE podflow_runtime"))
                role_flags = connection.execute(
                    text(
                        "SELECT r.rolsuper, r.rolbypassrls, r.rolcreatedb, "
                        "r.rolcreaterole, r.rolinherit, "
                        "EXISTS (SELECT 1 FROM pg_class c "
                        "JOIN pg_namespace n ON n.oid=c.relnamespace "
                        "WHERE n.nspname='public' AND c.relname='resources' AND c.relowner=r.oid) "
                        "FROM pg_roles r WHERE r.rolname=current_user"
                    )
                ).one()
                assert role_flags == (False, False, False, False, False, False)

                without_context = connection.execute(
                    text("SELECT count(*) FROM public.resources")
                ).scalar_one()
                assert without_context == 0
                with pytest.raises(DBAPIError) as no_context_error:
                    connection.execute(
                        text(
                            "INSERT INTO public.resources(id, owner_id, kind, submitted_url) "
                            "VALUES (:id, :owner_id, 'url', 'https://example.invalid/')"
                        ),
                        {"id": uuid.uuid4(), "owner_id": owner_one},
                    )
                assert getattr(no_context_error.value.orig, "sqlstate", None) == "42501"
                connection.rollback()

                connection.execute(text("SET LOCAL ROLE podflow_runtime"))
                connection.execute(
                    text("SELECT set_config('app.user_id', :owner, true)"),
                    {"owner": str(owner_one)},
                )
                resource_id = uuid.uuid4()
                connection.execute(
                    text(
                        "INSERT INTO public.resources(id, owner_id, kind, submitted_url) "
                        "VALUES (:id, :owner_id, 'url', 'https://example.invalid/')"
                    ),
                    {"id": resource_id, "owner_id": owner_one},
                )
                assert (
                    connection.execute(
                        text("SELECT count(*) FROM public.resources WHERE id=:id"),
                        {"id": resource_id},
                    ).scalar_one()
                    == 1
                )

                connection.execute(
                    text("SELECT set_config('app.user_id', :owner, true)"),
                    {"owner": str(owner_two)},
                )
                assert (
                    connection.execute(
                        text("SELECT count(*) FROM public.resources WHERE id=:id"),
                        {"id": resource_id},
                    ).scalar_one()
                    == 0
                )
                assert (
                    connection.execute(
                        text("UPDATE public.resources SET title='stolen' WHERE id=:id"),
                        {"id": resource_id},
                    ).rowcount
                    == 0
                )
                with pytest.raises(DBAPIError) as cross_user_error:
                    connection.execute(
                        text(
                            "INSERT INTO public.resources(id, owner_id, kind, submitted_url) "
                            "VALUES (:id, :owner_id, 'url', 'https://example.invalid/')"
                        ),
                        {"id": uuid.uuid4(), "owner_id": owner_one},
                    )
                assert getattr(cross_user_error.value.orig, "sqlstate", None) == "42501"
            finally:
                if transaction is not None and transaction.is_active:
                    transaction.rollback()
                else:
                    connection.rollback()
    finally:
        runtime_engine.dispose()
        admin_engine.dispose()
