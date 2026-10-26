import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.all_models import Skill, AdminUser
from app.schemas.all_schemas import SkillSchema, SkillCreate, SkillUpdate
from app.services.auth_service import get_current_admin
from app.services.audit_service import log_audit_event

router = APIRouter(prefix="/admin/skills", tags=["Admin Skills"])

@router.get("", response_model=List[SkillSchema])
def list_skills(
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin)
):
    skills = db.query(Skill).order_by(Skill.category.asc(), Skill.display_order.asc()).all()
    return [SkillSchema.model_validate(s) for s in skills]

@router.post("", response_model=SkillSchema, status_code=status.HTTP_201_CREATED)
def create_skill(
    req: SkillCreate,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin)
):
    skill = Skill(**req.model_dump())
    db.add(skill)
    db.commit()
    db.refresh(skill)

    log_audit_event(db, action="skill.created", admin_user_id=admin.id, entity_type="Skill", entity_id=skill.id)
    return SkillSchema.model_validate(skill)

@router.patch("/{id}", response_model=SkillSchema)
def update_skill(
    id: uuid.UUID,
    req: SkillUpdate,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin)
):
    skill = db.query(Skill).filter(Skill.id == id).first()
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found.")

    for key, value in req.model_dump(exclude_unset=True).items():
        setattr(skill, key, value)

    db.commit()
    db.refresh(skill)

    log_audit_event(db, action="skill.updated", admin_user_id=admin.id, entity_type="Skill", entity_id=skill.id)
    return SkillSchema.model_validate(skill)

@router.delete("/{id}")
def delete_skill(
    id: uuid.UUID,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin)
):
    skill = db.query(Skill).filter(Skill.id == id).first()
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found.")

    db.delete(skill)
    db.commit()

    log_audit_event(db, action="skill.deleted", admin_user_id=admin.id, entity_type="Skill", entity_id=id)
    return {"message": "Skill deleted successfully"}
