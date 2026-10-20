import uuid

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from podflow.persistence.db.base import Base, TimestampMixin


class UserProfile(Base, TimestampMixin):
    """
    User profile model for ownership and basic user details.
    """

    __tablename__ = "user_profiles"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    auth_user_id: Mapped[uuid.UUID] = mapped_column(unique=True, index=True, nullable=False)
    display_name: Mapped[str | None] = mapped_column(String, nullable=True)
    avatar_url: Mapped[str | None] = mapped_column(String, nullable=True)
