import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.all_models import Profile, SocialLink, AdminUser
from app.schemas.all_schemas import (
    ProfileResponse, ProfileUpdate,
    SocialLinkSchema, SocialLinkCreate, SocialLinkUpdate
)
from app.services.auth_service import get_current_admin
from app.services.audit_service import log_audit_event

router = APIRouter(prefix="/admin", tags=["Admin Profile & Links"])

@router.get("/profile", response_model=ProfileResponse)
def get_admin_profile(
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin)
):
    profile = db.query(Profile).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile record missing.")
    return ProfileResponse.model_validate(profile)

@router.put("/profile", response_model=ProfileResponse)
def update_admin_profile(
    req: ProfileUpdate,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin)
):
    profile = db.query(Profile).first()
    if not profile:
        profile = Profile(
            display_name=req.display_name or "Oduor Daivine Oluoch",
            full_name=req.full_name or "Oduor Daivine Oluoch",
            headline=req.headline or "Founder & Software Engineer",
            short_bio=req.short_bio or "",
            full_bio=req.full_bio or "",
            location=req.location or "Kenya",
            availability_status=req.availability_status or "Available for opportunities"
        )
        db.add(profile)
    else:
        update_data = req.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(profile, key, value)

    db.commit()
    db.refresh(profile)

    log_audit_event(db, action="profile.updated", admin_user_id=admin.id, entity_type="Profile", entity_id=profile.id)
    return ProfileResponse.model_validate(profile)

# --- Social Links CRUD ---
@router.get("/social-links", response_model=List[SocialLinkSchema])
def list_social_links(
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin)
):
    links = db.query(SocialLink).order_by(SocialLink.display_order.asc()).all()
    return [SocialLinkSchema.model_validate(link) for link in links]

@router.post("/social-links", response_model=SocialLinkSchema, status_code=status.HTTP_201_CREATED)
def create_social_link(
    req: SocialLinkCreate,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin)
):
    link = SocialLink(**req.model_dump())
    db.add(link)
    db.commit()
    db.refresh(link)
    log_audit_event(db, action="social_link.created", admin_user_id=admin.id, entity_type="SocialLink", entity_id=link.id)
    return SocialLinkSchema.model_validate(link)

@router.patch("/social-links/{id}", response_model=SocialLinkSchema)
def update_social_link(
    id: uuid.UUID,
    req: SocialLinkUpdate,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin)
):
    link = db.query(SocialLink).filter(SocialLink.id == id).first()
    if not link:
        raise HTTPException(status_code=404, detail="Social link not found.")

    for key, value in req.model_dump(exclude_unset=True).items():
        setattr(link, key, value)

    db.commit()
    db.refresh(link)
    log_audit_event(db, action="social_link.updated", admin_user_id=admin.id, entity_type="SocialLink", entity_id=link.id)
    return SocialLinkSchema.model_validate(link)

@router.delete("/social-links/{id}")
def delete_social_link(
    id: uuid.UUID,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin)
):
    link = db.query(SocialLink).filter(SocialLink.id == id).first()
    if not link:
        raise HTTPException(status_code=404, detail="Social link not found.")
    db.delete(link)
    db.commit()
    log_audit_event(db, action="social_link.deleted", admin_user_id=admin.id, entity_type="SocialLink", entity_id=id)
    return {"message": "Social link deleted successfully"}
