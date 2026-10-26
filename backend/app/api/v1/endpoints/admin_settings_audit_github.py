import json
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.all_models import SiteSetting, AuditLog, AdminUser
from app.schemas.all_schemas import (
    SiteSettingSchema, AuditLogResponse, GitHubRepoResponse
)
from app.services.auth_service import get_current_admin
from app.services.audit_service import log_audit_event
from app.services.github_service import get_github_repositories

router = APIRouter(prefix="/admin", tags=["Admin Settings, Audit & GitHub"])

# --- Site Settings ---
@router.get("/settings", response_model=List[SiteSettingSchema])
def list_site_settings(
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin)
):
    settings_list = db.query(SiteSetting).all()
    return [SiteSettingSchema.model_validate(s) for s in settings_list]

@router.patch("/settings/{key}", response_model=SiteSettingSchema)
def update_site_setting(
    key: str,
    value: Dict[str, Any],
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin)
):
    setting = db.query(SiteSetting).filter(SiteSetting.key == key).first()
    val_json = json.dumps(value)
    if not setting:
        setting = SiteSetting(key=key, value_json=val_json)
        db.add(setting)
    else:
        setting.value_json = val_json

    db.commit()
    db.refresh(setting)

    log_audit_event(db, action="settings.updated", admin_user_id=admin.id, entity_type="SiteSetting", entity_id=setting.id)
    return SiteSettingSchema.model_validate(setting)

# --- Audit Logs ---
@router.get("/audit-logs", response_model=List[AuditLogResponse])
def get_audit_logs(
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin)
):
    logs = db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(limit).all()
    return [AuditLogResponse.model_validate(l) for l in logs]

# --- GitHub Integration ---
@router.get("/integrations/github/repositories", response_model=List[GitHubRepoResponse])
async def list_github_repos(
    admin: AdminUser = Depends(get_current_admin)
):
    repos = await get_github_repositories(force_refresh=False)
    return [GitHubRepoResponse(**r) for r in repos]

@router.post("/integrations/github/refresh", response_model=List[GitHubRepoResponse])
async def refresh_github_repos(
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin)
):
    repos = await get_github_repositories(force_refresh=True)
    log_audit_event(db, action="github.refreshed", admin_user_id=admin.id)
    return [GitHubRepoResponse(**r) for r in repos]
