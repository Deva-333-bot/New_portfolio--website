from datetime import datetime, timezone
from fastapi import Request, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import hash_token
from app.models.all_models import AdminSession, AdminUser

def get_current_admin(
    request: Request,
    db: Session = Depends(get_db)
) -> AdminUser:
    """
    Extracts session token from HttpOnly cookie or Authorization header,
    validates the hash in the database, checks expiration and revocation.
    """
    token = None
    # 1. Check HttpOnly cookie
    if "portfolio_session" in request.cookies:
        token = request.cookies.get("portfolio_session")
    # 2. Check Authorization header
    elif "Authorization" in request.headers:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:].strip()

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials were not provided."
        )

    token_hash = hash_token(token)
    now = datetime.now(timezone.utc)

    session_rec = db.query(AdminSession).filter(
        AdminSession.session_token_hash == token_hash,
        AdminSession.revoked_at.is_(None)
    ).first()

    if not session_rec:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session is invalid or has expired."
        )

    # Convert session_rec.expires_at to timezone-aware if needed
    expires_at = session_rec.expires_at
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)

    if expires_at < now:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session has expired. Please sign in again."
        )

    user = db.query(AdminUser).filter(AdminUser.id == session_rec.admin_user_id).first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account is inactive or disabled."
        )

    # Update last activity
    session_rec.last_activity_at = now
    db.commit()

    return user
