from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, HTTPException, Response, Request, status
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import get_db
from app.core.security import (
    verify_password,
    hash_password,
    generate_session_token,
    hash_token,
    generate_reset_token,
    verify_reset_token
)
from app.core.middleware import rate_limiter, get_client_ip
from app.models.all_models import AdminUser, AdminSession
from app.schemas.all_schemas import (
    LoginRequest,
    LoginResponse,
    UserResponse,
    PasswordChangeRequest,
    PasswordForgotRequest,
    PasswordResetRequest
)
from app.services.auth_service import get_current_admin
from app.services.audit_service import log_audit_event
from app.services.email_service import send_notification_email

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=LoginResponse)
def login(
    req: LoginRequest,
    request: Request,
    response: Response,
    db: Session = Depends(get_db)
):
    client_ip = get_client_ip(request)
    rate_limiter.check_rate_limit(client_ip, settings.RATE_LIMIT_LOGIN_PER_MINUTE)

    user = db.query(AdminUser).filter(AdminUser.email == req.email.lower()).first()
    if not user or not verify_password(req.password, user.password_hash):
        log_audit_event(
            db, action="auth.login_failed",
            request_id=getattr(request.state, "request_id", None),
            metadata={"email": req.email, "ip": client_ip}
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is disabled."
        )

    # Invalidate older sessions if needed or issue new session
    raw_token, token_hash = generate_session_token()
    duration_hours = 24 * 7 if req.remember_me else settings.SESSION_EXPIRE_HOURS
    expires_at = datetime.now(timezone.utc) + timedelta(hours=duration_hours)

    session_rec = AdminSession(
        admin_user_id=user.id,
        session_token_hash=token_hash,
        expires_at=expires_at
    )
    db.add(session_rec)
    user.last_login_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(session_rec)

    # Set secure HttpOnly cookie
    is_prod = settings.APP_ENV == "production"
    response.set_cookie(
        key="portfolio_session",
        value=raw_token,
        httponly=True,
        secure=is_prod,
        samesite="lax",
        max_age=duration_hours * 3600,
        path="/"
    )

    log_audit_event(
        db, action="auth.login_success",
        admin_user_id=user.id,
        request_id=getattr(request.state, "request_id", None),
        metadata={"ip": client_ip}
    )

    return LoginResponse(
        token=raw_token,
        token_type="Bearer",
        expires_at=expires_at,
        user=UserResponse.model_validate(user)
    )

@router.post("/logout")
def logout(
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin)
):
    token = request.cookies.get("portfolio_session")
    if not token and "Authorization" in request.headers:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:].strip()

    if token:
        token_hash = hash_token(token)
        db.query(AdminSession).filter(AdminSession.session_token_hash == token_hash).update({
            "revoked_at": datetime.now(timezone.utc)
        })
        db.commit()

    response.delete_cookie(key="portfolio_session", path="/")
    log_audit_event(
        db, action="auth.logout",
        admin_user_id=admin.id,
        request_id=getattr(request.state, "request_id", None)
    )
    return {"message": "Successfully logged out"}

@router.get("/me", response_model=UserResponse)
def get_me(admin: AdminUser = Depends(get_current_admin)):
    return UserResponse.model_validate(admin)

@router.post("/password/change")
def change_password(
    req: PasswordChangeRequest,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin)
):
    if not verify_password(req.current_password, admin.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password verification failed."
        )

    admin.password_hash = hash_password(req.new_password)
    admin.updated_at = datetime.now(timezone.utc)
    # Invalidate all existing sessions
    db.query(AdminSession).filter(AdminSession.admin_user_id == admin.id).update({
        "revoked_at": datetime.now(timezone.utc)
    })
    db.commit()

    log_audit_event(db, action="auth.password_changed", admin_user_id=admin.id)
    return {"message": "Password changed successfully. Please log in again."}

@router.post("/password/forgot")
def forgot_password(
    req: PasswordForgotRequest,
    db: Session = Depends(get_db)
):
    user = db.query(AdminUser).filter(AdminUser.email == req.email.lower()).first()
    if user:
        reset_token = generate_reset_token(user.email)
        reset_url = f"{settings.CANONICAL_SITE_URL}/admin/reset-password?token={reset_token}"
        send_notification_email(
            subject="Password Reset Request - Portfolio CMS",
            body_text=f"A password reset was requested for your administrator account.\n\nClick the link below to reset your password (valid for 1 hour):\n{reset_url}\n\nIf you did not request this, please ignore this email.",
            to_address=user.email
        )
        log_audit_event(db, action="auth.password_reset_requested", metadata={"email": user.email})

    # Return identical generic response to prevent user enumeration
    return {"message": "If this email is registered, a password reset link has been dispatched."}

@router.post("/password/reset")
def reset_password(
    req: PasswordResetRequest,
    db: Session = Depends(get_db)
):
    email = verify_reset_token(req.token)
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Reset token is invalid or has expired."
        )

    user = db.query(AdminUser).filter(AdminUser.email == email.lower()).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    user.password_hash = hash_password(req.new_password)
    user.updated_at = datetime.now(timezone.utc)
    db.query(AdminSession).filter(AdminSession.admin_user_id == user.id).update({
        "revoked_at": datetime.now(timezone.utc)
    })
    db.commit()

    log_audit_event(db, action="auth.password_reset_completed", admin_user_id=user.id)
    return {"message": "Password has been successfully reset. You may now sign in."}
