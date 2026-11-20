import uuid
from datetime import datetime
from typing import Annotated, Any, Literal

from pydantic import (
    AwareDatetime,
    BaseModel,
    ConfigDict,
    Field,
    HttpUrl,
    StringConstraints,
    field_validator,
    model_validator,
)


class ResourceCreate(BaseModel):
    kind: Literal["url", "upload"]
    submitted_url: HttpUrl | None = None
    title: str | None = Field(default=None, max_length=500)
    metadata: dict[str, Any] = Field(default_factory=dict)

    @model_validator(mode="after")
    def validate_kind_url(self) -> "ResourceCreate":
        if (self.kind == "url") != (self.submitted_url is not None):
            raise ValueError("URL resources require submitted_url; uploads must omit it")
        return self


class ResourceVersionCreate(BaseModel):
    version_number: int = Field(gt=0)
    content_hash: Annotated[
        str, StringConstraints(strip_whitespace=True, min_length=1, max_length=128)
    ]
    fetched_at: AwareDatetime | None = None
    storage_object_path: str | None = Field(default=None, max_length=2048)
    extracted_text: str | None = None
    metadata: dict[str, Any] = Field(default_factory=dict)

    @field_validator("storage_object_path")
    @classmethod
    def require_private_object_path(cls, value: str | None) -> str | None:
        if value is not None and ("://" in value or value.startswith("/")):
            raise ValueError("storage_object_path must be a private bucket-relative object path")
        return value


class ResourceUpdate(BaseModel):
    title: str | None = Field(default=None, max_length=500)
    metadata: dict[str, Any] | None = None

    @model_validator(mode="after")
    def require_an_update(self) -> "ResourceUpdate":
        if not self.model_fields_set:
            raise ValueError("at least one resource field must be supplied")
        if "metadata" in self.model_fields_set and self.metadata is None:
            raise ValueError("metadata cannot be null")
        return self


class ProcessingRunCreate(BaseModel):
    status: Literal["queued"] = "queued"
    model_metadata: dict[str, Any] = Field(default_factory=dict)


class ArtifactVersionCreate(BaseModel):
    version_number: int = Field(gt=0)
    content: dict[str, Any]
    originating_run_id: uuid.UUID | None = None


class ConversationCreate(BaseModel):
    title: str | None = Field(default=None, max_length=500)
    artifact_version_ids: list[uuid.UUID] = Field(default_factory=list, max_length=100)

    @field_validator("artifact_version_ids")
    @classmethod
    def require_unique_versions(cls, value: list[uuid.UUID]) -> list[uuid.UUID]:
        if len(set(value)) != len(value):
            raise ValueError("artifact_version_ids must be unique")
        return value


class ConversationAttachmentsUpdate(BaseModel):
    artifact_version_ids: list[uuid.UUID] = Field(max_length=100)


class ChatMessageCreate(BaseModel):
    role: Literal["user"] = "user"
    content: Annotated[
        str, StringConstraints(strip_whitespace=True, min_length=1, max_length=50_000)
    ]


class PresentationCreate(BaseModel):
    artifact_version_id: uuid.UUID
    snapshot: dict[str, Any]


class PresentationShareCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    expires_at: AwareDatetime


class PresentationShareIssued(BaseModel):
    id: uuid.UUID
    token: Annotated[str, StringConstraints(min_length=32)]
    expires_at: AwareDatetime


class ResourceRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    owner_id: uuid.UUID
    kind: Literal["url", "upload"]
    submitted_url: str | None
    title: str | None
    created_at: datetime
    updated_at: datetime


class ProfileRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    auth_user_id: uuid.UUID
    display_name: str | None
    avatar_url: str | None
    created_at: datetime
    updated_at: datetime


class ArtifactCreate(BaseModel):
    title: str = Field(min_length=1, max_length=500)
    content: dict[str, Any]


class ArtifactRead(BaseModel):
    id: uuid.UUID
    title: str
    lifecycle_status: str
    latest_version: "ArtifactVersionRead | None"


class ConversationRead(BaseModel):
    id: uuid.UUID
    title: str | None
    artifact_version_ids: list[uuid.UUID]
    messages: list["ChatMessageRead"]


class ChatMessageRead(BaseModel):
    id: uuid.UUID
    role: Literal["user", "assistant", "system"]
    content: str
    created_at: datetime


class PresentationRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    artifact_version_id: uuid.UUID
    snapshot: dict[str, Any]
    created_at: datetime


class PublicPresentationRead(BaseModel):
    snapshot: dict[str, Any]


class ArtifactVersionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    artifact_id: uuid.UUID
    version_number: int
    originating_run_id: uuid.UUID | None
    content: dict[str, Any]
    created_at: datetime
