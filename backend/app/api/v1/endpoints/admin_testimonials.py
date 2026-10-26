import uuid
from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.all_models import Testimonial, AdminUser
from app.schemas.all_schemas import (
    TestimonialAdminResponse, TestimonialCreate, TestimonialUpdate
)
from app.services.auth_service import get_current_admin
from app.services.audit_service import log_audit_event

router = APIRouter(prefix="/admin/testimonials", tags=["Admin Testimonials"])

@router.get("", response_model=List[TestimonialAdminResponse])
def list_testimonials(
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin)
):
    testimonials = db.query(Testimonial).order_by(Testimonial.display_order.asc(), Testimonial.created_at.desc()).all()
    return [TestimonialAdminResponse.model_validate(t) for t in testimonials]

@router.post("", response_model=TestimonialAdminResponse, status_code=status.HTTP_201_CREATED)
def create_testimonial(
    req: TestimonialCreate,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin)
):
    t = Testimonial(**req.model_dump())
    db.add(t)
    db.commit()
    db.refresh(t)

    log_audit_event(db, action="testimonial.created", admin_user_id=admin.id, entity_type="Testimonial", entity_id=t.id)
    return TestimonialAdminResponse.model_validate(t)

@router.patch("/{id}", response_model=TestimonialAdminResponse)
def update_testimonial(
    id: uuid.UUID,
    req: TestimonialUpdate,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin)
):
    t = db.query(Testimonial).filter(Testimonial.id == id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Testimonial not found.")

    for key, value in req.model_dump(exclude_unset=True).items():
        setattr(t, key, value)

    t.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(t)

    log_audit_event(db, action="testimonial.updated", admin_user_id=admin.id, entity_type="Testimonial", entity_id=t.id)
    return TestimonialAdminResponse.model_validate(t)

@router.post("/{id}/approve", response_model=TestimonialAdminResponse)
def approve_testimonial(
    id: uuid.UUID,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin)
):
    t = db.query(Testimonial).filter(Testimonial.id == id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Testimonial not found.")

    t.approved = True
    t.is_visible = True
    t.permission_confirmed = True
    t.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(t)

    log_audit_event(db, action="testimonial.approved", admin_user_id=admin.id, entity_type="Testimonial", entity_id=t.id)
    return TestimonialAdminResponse.model_validate(t)

@router.delete("/{id}")
def delete_testimonial(
    id: uuid.UUID,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin)
):
    t = db.query(Testimonial).filter(Testimonial.id == id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Testimonial not found.")

    db.delete(t)
    db.commit()

    log_audit_event(db, action="testimonial.deleted", admin_user_id=admin.id, entity_type="Testimonial", entity_id=id)
    return {"message": "Testimonial deleted successfully"}
