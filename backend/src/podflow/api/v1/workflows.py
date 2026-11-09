import hashlib
import uuid
from datetime import UTC, datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy import delete, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import aliased

from podflow.api.dependencies.auth import get_current_user
from podflow.persistence.db.models.knowledge import (
    ArtifactVersion,
    ChatMessage,
    Conversation,
    ConversationArtifact,
    KnowledgeArtifact,
    MessageArtifactVersion,
    Presentation,
    PresentationShare,
    Resource,
)
from podflow.persistence.db.models.user import UserProfile
from podflow.persistence.db.session import get_db
from podflow.schemas.database import (
    ArtifactCreate,
    ArtifactRead,
    ArtifactVersionCreate,
    ArtifactVersionRead,
    ChatMessageCreate,
    ChatMessageRead,
    ConversationAttachmentsUpdate,
    ConversationCreate,
    ConversationRead,
    PresentationCreate,
    PresentationRead,
    PresentationShareIssued,
    ProfileRead,
    PublicPresentationRead,
    ResourceCreate,
    ResourceRead,
)
from podflow.security.presentation_shares import generate_share_token

router = APIRouter(prefix="/api/v1", tags=["workflows"])
private_router = APIRouter(dependencies=[Depends(get_current_user)])


@private_router.get("/auth/me", response_model=ProfileRead)
async def profile_me(user: UserProfile = Depends(get_current_user)) -> ProfileRead:
    return ProfileRead.model_validate(user)


@private_router.post("/resources", response_model=ResourceRead, status_code=201)
async def create_resource(
    body: ResourceCreate,
    user: UserProfile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Resource:
    if body.kind == "upload":
        raise HTTPException(status.HTTP_501_NOT_IMPLEMENTED, "File storage is not configured")
    resource = Resource(
        owner_id=user.auth_user_id,
        kind=body.kind,
        submitted_url=str(body.submitted_url) if body.submitted_url else None,
        title=body.title,
        metadata_json=body.metadata,
    )
    db.add(resource)
    await db.flush()
    return resource


@private_router.delete("/resources/{resource_id}", status_code=204)
async def delete_resource(
    resource_id: uuid.UUID,
    user: UserProfile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    result = await db.execute(
        delete(Resource).where(Resource.id == resource_id, Resource.owner_id == user.auth_user_id)
    )
    if not result.rowcount:
        raise HTTPException(404, "Resource not found")


@private_router.get("/resources", response_model=list[ResourceRead])
async def list_resources(
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    user: UserProfile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[Resource]:
    result = await db.execute(
        select(Resource)
        .where(Resource.owner_id == user.auth_user_id)
        .order_by(Resource.created_at.desc())
        .limit(limit)
        .offset(offset)
    )
    return list(result.scalars())


@private_router.get("/resources/{resource_id}", response_model=ResourceRead)
async def get_resource(
    resource_id: uuid.UUID,
    user: UserProfile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Resource:
    result = await db.execute(
        select(Resource).where(Resource.id == resource_id, Resource.owner_id == user.auth_user_id)
    )
    return _not_found(result.scalar_one_or_none(), "Resource")


@private_router.get("/artifacts", response_model=list[ArtifactRead])
async def list_artifacts(
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    user: UserProfile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[ArtifactRead]:
    latest_versions = select(
        ArtifactVersion,
        func.row_number()
        .over(
            partition_by=ArtifactVersion.artifact_id,
            order_by=(ArtifactVersion.version_number.desc(), ArtifactVersion.created_at.desc()),
        )
        .label("version_rank"),
    ).subquery()
    latest_version = aliased(ArtifactVersion, latest_versions)
    result = await db.execute(
        select(KnowledgeArtifact, latest_version)
        .outerjoin(
            latest_versions,
            (latest_versions.c.artifact_id == KnowledgeArtifact.id)
            & (latest_versions.c.version_rank == 1),
        )
        .where(KnowledgeArtifact.owner_id == user.auth_user_id)
        .order_by(KnowledgeArtifact.updated_at.desc())
        .limit(limit)
        .offset(offset)
    )
    return [
        ArtifactRead(
            id=artifact.id,
            title=artifact.title,
            lifecycle_status=artifact.lifecycle_status,
            latest_version=ArtifactVersionRead.model_validate(version)
            if version is not None and version.id is not None
            else None,
        )
        for artifact, version in result.all()
    ]


@private_router.get("/artifacts/{artifact_id}", response_model=ArtifactRead)
async def get_artifact(
    artifact_id: uuid.UUID,
    user: UserProfile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ArtifactRead:
    result = await db.execute(
        select(KnowledgeArtifact).where(
            KnowledgeArtifact.id == artifact_id,
            KnowledgeArtifact.owner_id == user.auth_user_id,
        )
    )
    artifact = _not_found(result.scalar_one_or_none(), "Artifact")
    version_result = await db.execute(
        select(ArtifactVersion)
        .where(ArtifactVersion.artifact_id == artifact.id)
        .order_by(ArtifactVersion.version_number.desc())
        .limit(1)
    )
    version = version_result.scalar_one_or_none()
    return ArtifactRead(
        id=artifact.id,
        title=artifact.title,
        lifecycle_status=artifact.lifecycle_status,
        latest_version=ArtifactVersionRead.model_validate(version) if version else None,
    )


@private_router.post("/artifacts", response_model=ArtifactRead, status_code=201)
async def create_artifact(
    body: ArtifactCreate,
    user: UserProfile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ArtifactRead:
    artifact = KnowledgeArtifact(owner_id=user.auth_user_id, title=body.title)
    db.add(artifact)
    await db.flush()
    version = ArtifactVersion(artifact_id=artifact.id, version_number=1, content=body.content)
    db.add(version)
    await db.flush()
    return ArtifactRead(
        id=artifact.id,
        title=artifact.title,
        lifecycle_status=artifact.lifecycle_status,
        latest_version=ArtifactVersionRead.model_validate(version),
    )


@private_router.post(
    "/artifacts/{artifact_id}/versions", response_model=ArtifactVersionRead, status_code=201
)
async def create_artifact_version(
    artifact_id: uuid.UUID,
    body: ArtifactVersionCreate,
    user: UserProfile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ArtifactVersion:
    result = await db.execute(
        select(KnowledgeArtifact)
        .where(
            KnowledgeArtifact.id == artifact_id,
            KnowledgeArtifact.owner_id == user.auth_user_id,
        )
        .with_for_update()
    )
    artifact = _not_found(result.scalar_one_or_none(), "Artifact")
    latest = await db.execute(
        select(ArtifactVersion.version_number)
        .where(ArtifactVersion.artifact_id == artifact.id)
        .order_by(ArtifactVersion.version_number.desc())
        .limit(1)
    )
    next_number = (latest.scalar_one_or_none() or 0) + 1
    if body.version_number != next_number:
        raise HTTPException(409, f"Next version_number must be {next_number}")
    if body.originating_run_id is not None:
        raise HTTPException(status.HTTP_501_NOT_IMPLEMENTED, "Processing runs are not available")
    version = ArtifactVersion(
        artifact_id=artifact.id,
        version_number=next_number,
        content=body.content,
    )
    db.add(version)
    await db.flush()
    return version


@private_router.get("/artifacts/{artifact_id}/versions", response_model=list[ArtifactVersionRead])
async def list_artifact_versions(
    artifact_id: uuid.UUID,
    user: UserProfile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[ArtifactVersion]:
    result = await db.execute(
        select(ArtifactVersion)
        .join(KnowledgeArtifact, KnowledgeArtifact.id == ArtifactVersion.artifact_id)
        .where(
            ArtifactVersion.artifact_id == artifact_id,
            KnowledgeArtifact.owner_id == user.auth_user_id,
        )
        .order_by(ArtifactVersion.version_number.desc())
    )
    versions = list(result.scalars())
    if not versions:
        raise HTTPException(404, "Artifact not found")
    return versions


@private_router.get(
    "/artifacts/{artifact_id}/versions/{version_id}", response_model=ArtifactVersionRead
)
async def get_artifact_version(
    artifact_id: uuid.UUID,
    version_id: uuid.UUID,
    user: UserProfile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ArtifactVersion:
    result = await db.execute(
        select(ArtifactVersion)
        .join(KnowledgeArtifact, KnowledgeArtifact.id == ArtifactVersion.artifact_id)
        .where(
            ArtifactVersion.id == version_id,
            ArtifactVersion.artifact_id == artifact_id,
            KnowledgeArtifact.owner_id == user.auth_user_id,
        )
    )
    return _not_found(result.scalar_one_or_none(), "Artifact version")


@private_router.post("/conversations", response_model=ConversationRead, status_code=201)
async def create_conversation(
    body: ConversationCreate,
    user: UserProfile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ConversationRead:
    conversation = Conversation(owner_id=user.auth_user_id, title=body.title)
    db.add(conversation)
    await db.flush()
    if body.artifact_version_ids:
        versions = await db.execute(
            select(ArtifactVersion.id)
            .join(KnowledgeArtifact, KnowledgeArtifact.id == ArtifactVersion.artifact_id)
            .where(
                ArtifactVersion.id.in_(body.artifact_version_ids),
                KnowledgeArtifact.owner_id == user.auth_user_id,
            )
        )
        owned_ids = set(versions.scalars())
        if owned_ids != set(body.artifact_version_ids):
            raise HTTPException(404, "One or more artifact versions were not found")
        db.add_all(
            ConversationArtifact(conversation_id=conversation.id, artifact_version_id=version_id)
            for version_id in owned_ids
        )
    return ConversationRead(
        id=conversation.id,
        title=conversation.title,
        artifact_version_ids=body.artifact_version_ids,
        messages=[],
    )


@private_router.get("/conversations", response_model=list[ConversationRead])
async def list_conversations(
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    user: UserProfile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[ConversationRead]:
    result = await db.execute(
        select(Conversation)
        .where(Conversation.owner_id == user.auth_user_id)
        .order_by(Conversation.updated_at.desc())
        .limit(limit)
        .offset(offset)
    )
    conversations = list(result.scalars())
    output = []
    for conversation in conversations:
        attachment_result = await db.execute(
            select(ConversationArtifact.artifact_version_id).where(
                ConversationArtifact.conversation_id == conversation.id
            )
        )
        output.append(
            ConversationRead(
                id=conversation.id,
                title=conversation.title,
                artifact_version_ids=list(attachment_result.scalars()),
                messages=[],
            )
        )
    return output


@private_router.post(
    "/conversations/{conversation_id}/messages", response_model=ChatMessageRead, status_code=201
)
async def create_user_message(
    conversation_id: uuid.UUID,
    body: ChatMessageCreate,
    user: UserProfile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ChatMessage:
    conversation = await _owned_conversation(db, conversation_id, user.auth_user_id)
    attached = await db.execute(
        select(ConversationArtifact.artifact_version_id).where(
            ConversationArtifact.conversation_id == conversation.id
        )
    )
    message = ChatMessage(conversation_id=conversation.id, role="user", content=body.content)
    db.add(message)
    await db.flush()
    # Persist the user turn and its artifact scope. No assistant generation service exists yet.
    db.add_all(
        MessageArtifactVersion(message_id=message.id, artifact_version_id=version_id)
        for version_id in attached.scalars()
    )
    return message


@private_router.get("/conversations/{conversation_id}", response_model=ConversationRead)
async def get_conversation(
    conversation_id: uuid.UUID,
    user: UserProfile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ConversationRead:
    conversation = await _owned_conversation(db, conversation_id, user.auth_user_id)
    attachment_result = await db.execute(
        select(ConversationArtifact.artifact_version_id).where(
            ConversationArtifact.conversation_id == conversation.id
        )
    )
    message_result = await db.execute(
        select(ChatMessage)
        .where(ChatMessage.conversation_id == conversation.id)
        .order_by(ChatMessage.created_at)
    )
    return ConversationRead(
        id=conversation.id,
        title=conversation.title,
        artifact_version_ids=list(attachment_result.scalars()),
        messages=[ChatMessageRead.model_validate(message) for message in message_result.scalars()],
    )


@private_router.put("/conversations/{conversation_id}/attachments", response_model=ConversationRead)
async def replace_conversation_attachments(
    conversation_id: uuid.UUID,
    body: ConversationAttachmentsUpdate,
    user: UserProfile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ConversationRead:
    conversation = await _owned_conversation(db, conversation_id, user.auth_user_id)
    ids = set(body.artifact_version_ids)
    if len(ids) != len(body.artifact_version_ids):
        raise HTTPException(422, "Artifact version IDs must be unique")
    versions = (
        await db.execute(
            select(ArtifactVersion.id)
            .join(KnowledgeArtifact, KnowledgeArtifact.id == ArtifactVersion.artifact_id)
            .where(ArtifactVersion.id.in_(ids), KnowledgeArtifact.owner_id == user.auth_user_id)
        )
        if ids
        else None
    )
    if versions is not None and set(versions.scalars()) != ids:
        raise HTTPException(404, "One or more artifact versions were not found")
    await db.execute(
        delete(ConversationArtifact).where(ConversationArtifact.conversation_id == conversation.id)
    )
    db.add_all(
        ConversationArtifact(conversation_id=conversation.id, artifact_version_id=version_id)
        for version_id in ids
    )
    await db.flush()
    return await get_conversation(conversation.id, user, db)


@private_router.post("/presentations", response_model=PresentationRead, status_code=201)
async def create_presentation(
    body: PresentationCreate,
    user: UserProfile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Presentation:
    version = await _owned_version(db, body.artifact_version_id, user.auth_user_id)
    presentation = Presentation(
        owner_id=user.auth_user_id,
        artifact_version_id=version.id,
        snapshot=body.snapshot,
    )
    db.add(presentation)
    await db.flush()
    return presentation


@private_router.post(
    "/presentations/{presentation_id}/shares",
    response_model=PresentationShareIssued,
    status_code=201,
)
async def create_share(
    presentation_id: uuid.UUID,
    user: UserProfile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> PresentationShareIssued:
    result = await db.execute(
        select(Presentation).where(
            Presentation.id == presentation_id, Presentation.owner_id == user.auth_user_id
        )
    )
    presentation = _not_found(result.scalar_one_or_none(), "Presentation")
    generated = generate_share_token()
    expires_at = datetime.now(UTC) + timedelta(hours=24)
    share = PresentationShare(
        presentation_id=presentation.id,
        token_hash=generated.token_hash,
        expires_at=expires_at,
    )
    db.add(share)
    await db.flush()
    return PresentationShareIssued(id=share.id, token=generated.bearer_token, expires_at=expires_at)


@private_router.get("/presentations/{presentation_id}", response_model=PresentationRead)
async def get_presentation(
    presentation_id: uuid.UUID,
    user: UserProfile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Presentation:
    result = await db.execute(
        select(Presentation).where(
            Presentation.id == presentation_id, Presentation.owner_id == user.auth_user_id
        )
    )
    return _not_found(result.scalar_one_or_none(), "Presentation")


@private_router.delete("/presentations/{presentation_id}/shares/{share_id}", status_code=204)
async def revoke_share(
    presentation_id: uuid.UUID,
    share_id: uuid.UUID,
    user: UserProfile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    result = await db.execute(
        select(PresentationShare)
        .join(Presentation, Presentation.id == PresentationShare.presentation_id)
        .where(
            PresentationShare.id == share_id,
            Presentation.id == presentation_id,
            Presentation.owner_id == user.auth_user_id,
        )
    )
    share = _not_found(result.scalar_one_or_none(), "Share")
    share.revoked_at = datetime.now(UTC)


@router.get("/shares/{token}", response_model=PublicPresentationRead)
async def resolve_share(
    token: str,
    response: Response,
    db: AsyncSession = Depends(get_db),
) -> PublicPresentationRead:
    response.headers.update(
        {
            "Cache-Control": "private, no-store, no-cache, max-age=0, must-revalidate",
            "Pragma": "no-cache",
            "Expires": "0",
            "Surrogate-Control": "no-store",
        }
    )
    token_hash = hashlib.sha256(token.encode("utf-8")).hexdigest()
    result = await db.execute(select(func.resolve_presentation_share(token_hash)))
    snapshot = result.scalar_one_or_none()
    if snapshot is None:
        raise HTTPException(
            404,
            "Share not found or expired",
            headers={
                "Cache-Control": "private, no-store, no-cache, max-age=0, must-revalidate",
                "Pragma": "no-cache",
                "Expires": "0",
                "Surrogate-Control": "no-store",
            },
        )
    return PublicPresentationRead(snapshot=snapshot)


router.include_router(private_router)


async def _owned_version(
    db: AsyncSession, version_id: uuid.UUID, owner_id: uuid.UUID
) -> ArtifactVersion:
    result = await db.execute(
        select(ArtifactVersion)
        .join(KnowledgeArtifact, KnowledgeArtifact.id == ArtifactVersion.artifact_id)
        .where(ArtifactVersion.id == version_id, KnowledgeArtifact.owner_id == owner_id)
    )
    return _not_found(result.scalar_one_or_none(), "Artifact version")


async def _owned_conversation(
    db: AsyncSession, conversation_id: uuid.UUID, owner_id: uuid.UUID
) -> Conversation:
    result = await db.execute(
        select(Conversation).where(
            Conversation.id == conversation_id, Conversation.owner_id == owner_id
        )
    )
    return _not_found(result.scalar_one_or_none(), "Conversation")


def _not_found(value, resource: str):
    if value is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, f"{resource} not found")
    return value
