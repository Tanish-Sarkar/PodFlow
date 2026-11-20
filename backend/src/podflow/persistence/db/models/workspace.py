import uuid

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from podflow.persistence.db.base import Base, TimestampMixin
from podflow.persistence.db.models.user import UserProfile


class Workspace(Base, TimestampMixin):
    """
    Workspace model. Represents an isolated environment for resources and workflows.
    """

    __tablename__ = "workspaces"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String, nullable=False)

    members: Mapped[list["WorkspaceMember"]] = relationship(
        "WorkspaceMember", back_populates="workspace", cascade="all, delete-orphan"
    )


class WorkspaceMember(Base):
    """
    Workspace Member model. Associates users with workspaces with a specific role.
    """

    __tablename__ = "workspace_members"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("user_profiles.id", ondelete="CASCADE"), nullable=False, index=True
    )
    workspace_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False, index=True
    )
    role: Mapped[str] = mapped_column(String, nullable=False)

    user: Mapped["UserProfile"] = relationship("UserProfile")
    workspace: Mapped["Workspace"] = relationship("Workspace", back_populates="members")
