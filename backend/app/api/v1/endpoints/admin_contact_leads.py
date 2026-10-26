import io
import csv
import uuid
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.all_models import ContactMessage, Lead, AdminUser
from app.schemas.all_schemas import (
    ContactMessageAdminResponse, ContactMessageUpdate,
    LeadAdminResponse, LeadCreate, LeadUpdate
)
from app.services.auth_service import get_current_admin
from app.services.audit_service import log_audit_event

router = APIRouter(prefix="/admin", tags=["Admin Inquiries & Leads"])

# --- Contact Messages ---
@router.get("/messages", response_model=List[ContactMessageAdminResponse])
def list_contact_messages(
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin)
):
    query = db.query(ContactMessage)
    if status_filter and status_filter != "All":
        query = query.filter(ContactMessage.status == status_filter)

    messages = query.order_by(ContactMessage.created_at.desc()).all()
    return [ContactMessageAdminResponse.model_validate(m) for m in messages]

@router.get("/messages/{id}", response_model=ContactMessageAdminResponse)
def get_contact_message(
    id: uuid.UUID,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin)
):
    msg = db.query(ContactMessage).filter(ContactMessage.id == id).first()
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found.")
    return ContactMessageAdminResponse.model_validate(msg)

@router.patch("/messages/{id}", response_model=ContactMessageAdminResponse)
def update_contact_message(
    id: uuid.UUID,
    req: ContactMessageUpdate,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin)
):
    msg = db.query(ContactMessage).filter(ContactMessage.id == id).first()
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found.")

    for key, value in req.model_dump(exclude_unset=True).items():
        setattr(msg, key, value)

    msg.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(msg)

    log_audit_event(db, action="message.updated", admin_user_id=admin.id, entity_type="ContactMessage", entity_id=msg.id)
    return ContactMessageAdminResponse.model_validate(msg)

@router.delete("/messages/{id}")
def delete_contact_message(
    id: uuid.UUID,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin)
):
    msg = db.query(ContactMessage).filter(ContactMessage.id == id).first()
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found.")

    db.delete(msg)
    db.commit()

    log_audit_event(db, action="message.deleted", admin_user_id=admin.id, entity_type="ContactMessage", entity_id=id)
    return {"message": "Message deleted successfully"}

# --- Leads Pipeline ---
@router.get("/leads", response_model=List[LeadAdminResponse])
def list_leads(
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin)
):
    query = db.query(Lead)
    if status_filter and status_filter != "All":
        query = query.filter(Lead.pipeline_status == status_filter)

    leads = query.order_by(Lead.created_at.desc()).all()
    return [LeadAdminResponse.model_validate(l) for l in leads]

@router.post("/leads", response_model=LeadAdminResponse, status_code=status.HTTP_201_CREATED)
def create_lead(
    req: LeadCreate,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin)
):
    lead = Lead(**req.model_dump())
    db.add(lead)
    db.commit()
    db.refresh(lead)

    log_audit_event(db, action="lead.created", admin_user_id=admin.id, entity_type="Lead", entity_id=lead.id)
    return LeadAdminResponse.model_validate(lead)

@router.get("/leads/{id}", response_model=LeadAdminResponse)
def get_lead_by_id(
    id: uuid.UUID,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin)
):
    lead = db.query(Lead).filter(Lead.id == id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found.")
    return LeadAdminResponse.model_validate(lead)

@router.patch("/leads/{id}", response_model=LeadAdminResponse)
def update_lead(
    id: uuid.UUID,
    req: LeadUpdate,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin)
):
    lead = db.query(Lead).filter(Lead.id == id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found.")

    for key, value in req.model_dump(exclude_unset=True).items():
        setattr(lead, key, value)

    lead.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(lead)

    log_audit_event(db, action="lead.updated", admin_user_id=admin.id, entity_type="Lead", entity_id=lead.id)
    return LeadAdminResponse.model_validate(lead)

@router.delete("/leads/{id}")
def delete_lead(
    id: uuid.UUID,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin)
):
    lead = db.query(Lead).filter(Lead.id == id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found.")

    db.delete(lead)
    db.commit()

    log_audit_event(db, action="lead.deleted", admin_user_id=admin.id, entity_type="Lead", entity_id=id)
    return {"message": "Lead deleted successfully"}

@router.get("/leads-export/csv")
def export_leads_csv(
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin)
):
    leads = db.query(Lead).order_by(Lead.created_at.desc()).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Lead ID", "Name", "Email", "Organization", "Inquiry Type",
        "Pipeline Status", "Estimated Value", "Currency", "Next Follow Up", "Created At"
    ])

    for l in leads:
        writer.writerow([
            str(l.id),
            l.name,
            l.email,
            l.organization or "",
            l.inquiry_type,
            l.pipeline_status,
            l.estimated_value or "",
            l.currency,
            l.next_follow_up_at.isoformat() if l.next_follow_up_at else "",
            l.created_at.isoformat()
        ])

    log_audit_event(db, action="leads.exported_csv", admin_user_id=admin.id)
    output.seek(0)
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=leads_export.csv"}
    )
