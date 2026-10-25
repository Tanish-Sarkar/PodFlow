import hashlib
import os
import uuid
from datetime import UTC, datetime, timedelta
from urllib.parse import urlsplit

import pytest
from sqlalchemy import create_engine, text


@pytest.mark.skipif(
    not os.getenv("PODFLOW_TEST_RUNTIME_DATABASE_URL")
    or not os.getenv("PODFLOW_TEST_ADMIN_DATABASE_URL"),
    reason="Requires runtime and admin URIs for an explicitly disposable local PostgreSQL database",
)
def test_share_resolution_enforces_hash_expiry_revocation_and_snapshot_scope():
    runtime_url = os.environ["PODFLOW_TEST_RUNTIME_DATABASE_URL"]
    admin_url = os.environ["PODFLOW_TEST_ADMIN_DATABASE_URL"]
    for url in (runtime_url, admin_url):
        assert urlsplit(url).hostname in {"localhost", "127.0.0.1", "::1"}, (
            "Share integration tests are restricted to local disposable databases"
        )
    admin_engine = create_engine(admin_url, echo=False)
    runtime_engine = create_engine(runtime_url, echo=False)
    artifact_id, version_id, presentation_id = uuid.uuid4(), uuid.uuid4(), uuid.uuid4()
    valid_hash, expired_hash, revoked_hash = (
        hashlib.sha256(uuid.uuid4().bytes).hexdigest() for _ in range(3)
    )
    share_ids = [uuid.uuid4() for _ in range(3)]
    owner_id = None
    seeded = False
    try:
        with admin_engine.connect() as admin:
            owner_id = admin.execute(text("SELECT id FROM auth.users LIMIT 1")).scalar_one_or_none()
        if owner_id is None:
            pytest.skip("The disposable test database needs one auth.users row")

        with admin_engine.begin() as admin:
            admin.execute(
                text(
                    "INSERT INTO public.knowledge_artifacts(id, owner_id, title) "
                    "VALUES (:id, :owner, 'share integration fixture')"
                ),
                {"id": artifact_id, "owner": owner_id},
            )
            admin.execute(
                text(
                    "INSERT INTO public.artifact_versions "
                    "(id, artifact_id, version_number, content) "
                    "VALUES (:id, :artifact, 1, '{}'::jsonb)"
                ),
                {"id": version_id, "artifact": artifact_id},
            )
            admin.execute(
                text(
                    "INSERT INTO public.presentations(id, owner_id, artifact_version_id, snapshot) "
                    'VALUES (:id, :owner, :version, \'{"heading":"snapshot only"}\'::jsonb)'
                ),
                {"id": presentation_id, "owner": owner_id, "version": version_id},
            )
            now = datetime.now(UTC)
            for share_id, token_hash, expires_at, revoked_at in (
                (share_ids[0], valid_hash, now + timedelta(hours=1), None),
                (share_ids[1], expired_hash, now - timedelta(seconds=1), None),
                (share_ids[2], revoked_hash, now + timedelta(hours=1), now),
            ):
                admin.execute(
                    text(
                        "INSERT INTO public.presentation_shares "
                        "(id, presentation_id, token_hash, expires_at, revoked_at) "
                        "VALUES (:id, :presentation, :token_hash, :expires_at, :revoked_at)"
                    ),
                    {
                        "id": share_id,
                        "presentation": presentation_id,
                        "token_hash": token_hash,
                        "expires_at": expires_at,
                        "revoked_at": revoked_at,
                    },
                )
        seeded = True

        with runtime_engine.begin() as runtime:
            runtime.execute(text("SET LOCAL ROLE podflow_runtime"))
            valid_snapshot = runtime.execute(
                text("SELECT public.resolve_presentation_share(:hash)"), {"hash": valid_hash}
            ).scalar_one()
            assert valid_snapshot == {"heading": "snapshot only"}
            assert (
                runtime.execute(
                    text("SELECT public.resolve_presentation_share(:hash)"), {"hash": expired_hash}
                ).scalar_one_or_none()
                is None
            )
            assert (
                runtime.execute(
                    text("SELECT public.resolve_presentation_share(:hash)"), {"hash": revoked_hash}
                ).scalar_one_or_none()
                is None
            )
            assert (
                runtime.execute(
                    text("SELECT public.resolve_presentation_share(:hash)"),
                    {"hash": "0" * 64},
                ).scalar_one_or_none()
                is None
            )
    finally:
        if seeded:
            with admin_engine.begin() as admin:
                admin.execute(
                    text("DELETE FROM public.presentation_shares WHERE id = ANY(:ids)"),
                    {"ids": share_ids},
                )
                admin.execute(
                    text("DELETE FROM public.presentations WHERE id=:id"),
                    {"id": presentation_id},
                )
                admin.execute(
                    text("DELETE FROM public.artifact_versions WHERE id=:id"),
                    {"id": version_id},
                )
                admin.execute(
                    text("DELETE FROM public.knowledge_artifacts WHERE id=:id"),
                    {"id": artifact_id},
                )
        runtime_engine.dispose()
        admin_engine.dispose()
