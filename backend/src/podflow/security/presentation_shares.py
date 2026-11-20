import hashlib
import secrets
from dataclasses import dataclass


@dataclass(frozen=True)
class NewShareToken:
    bearer_token: str
    token_hash: str


def generate_share_token() -> NewShareToken:
    """Generate the one-time bearer value and its persistence-safe SHA-256 digest."""
    bearer_token = secrets.token_urlsafe(32)
    token_hash = hashlib.sha256(bearer_token.encode("ascii")).hexdigest()
    return NewShareToken(bearer_token=bearer_token, token_hash=token_hash)
