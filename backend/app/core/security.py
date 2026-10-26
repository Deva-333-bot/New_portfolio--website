import secrets
import hashlib
import hmac
import time
from typing import Tuple, Optional
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

def generate_reset_token(email: str) -> str:
    """Generates a secure signed password reset token with 1-hour expiration."""
    expires_at = int(time.time()) + 3600
    payload = f"{email}:{expires_at}"
    signature = hmac.new(
        settings.PASSWORD_RESET_SECRET.encode("utf-8"),
        payload.encode("utf-8"),
        hashlib.sha256
    ).hexdigest()
    return f"{payload}:{signature}"

def verify_reset_token(token: str) -> Optional[str]:
    """Verifies the password reset token and returns the email if valid."""
    parts = token.split(":")
    if len(parts) != 3:
        return None
    email, expires_at_str, signature = parts
    try:
        expires_at = int(expires_at_str)
    except ValueError:
        return None

    if time.time() > expires_at:
        return None  # Expired

    expected_payload = f"{email}:{expires_at}"
    expected_sig = hmac.new(
        settings.PASSWORD_RESET_SECRET.encode("utf-8"),
        expected_payload.encode("utf-8"),
        hashlib.sha256
    ).hexdigest()

    if secrets.compare_digest(signature, expected_sig):
        return email
    return None
