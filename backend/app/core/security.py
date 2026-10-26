import secrets
import hashlib
import hmac
import time
from typing import Tuple, Optional
from datetime import datetime, timezone
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError, VerificationError
from app.core.config import settings

# Initialize Argon2id Password Hasher
import argon2

ph = PasswordHasher(
    time_cost=2,
    memory_cost=19456,  # 19 MiB
    parallelism=1,
    hash_len=32,
    type=argon2.Type.ID
)

def hash_password(password: str) -> str:
    """Hashes a password using Argon2id."""
    return ph.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain password against an Argon2id hash."""
    try:
        return ph.verify(hashed_password, plain_password)
    except (VerifyMismatchError, VerificationError, Exception):
        return False

def generate_session_token() -> Tuple[str, str]:
    """
    Generates a secure random opaque session token.
    Returns:
        (raw_token, token_hash)
    The raw token is delivered to the client cookie/header,
    while only the SHA-256 token_hash is stored in the database.
    """
    raw_token = secrets.token_urlsafe(48)
    token_hash = hash_token(raw_token)
    return raw_token, token_hash

def hash_token(raw_token: str) -> str:
    """Computes a SHA-256 hash of a session or reset token."""
    return hashlib.sha256(f"{raw_token}:{settings.SESSION_SECRET}".encode("utf-8")).hexdigest()

def _password_version(updated_at: Optional[datetime]) -> str:
    if updated_at is None:
        return "0"
    if updated_at.tzinfo is None:
        updated_at = updated_at.replace(tzinfo=timezone.utc)
    return str(int(updated_at.timestamp() * 1_000_000))


def generate_reset_token(email: str, password_updated_at: Optional[datetime] = None) -> str:
    """Create a one-hour reset token invalidated by a subsequent password change."""
    expires_at = int(time.time()) + 3600
    version = _password_version(password_updated_at)
    payload = f"{email}:{expires_at}:{version}"
    signature = hmac.new(
        settings.PASSWORD_RESET_SECRET.encode("utf-8"),
        payload.encode("utf-8"),
        hashlib.sha256
    ).hexdigest()
    return f"{payload}:{signature}"


def verify_reset_token(
    token: str,
    current_password_updated_at: Optional[datetime] = None,
) -> Optional[str]:
    """Verify expiry/signature and optionally bind the token to the current password version."""
    parts = token.split(":", 3)
    if len(parts) != 4:
        return None
    email, expires_at_str, version, signature = parts
    try:
        expires_at = int(expires_at_str)
    except ValueError:
        return None

    if time.time() > expires_at:
        return None

    expected_payload = f"{email}:{expires_at}:{version}"
    expected_sig = hmac.new(
        settings.PASSWORD_RESET_SECRET.encode("utf-8"),
        expected_payload.encode("utf-8"),
        hashlib.sha256
    ).hexdigest()

    if not secrets.compare_digest(signature, expected_sig):
        return None
    if current_password_updated_at is not None and version != _password_version(current_password_updated_at):
        return None
    return email
