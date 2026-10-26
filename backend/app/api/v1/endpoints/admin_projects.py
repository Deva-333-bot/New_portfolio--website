import uuid
import re
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.all_models import Project, AdminUser
from app.schemas.all_schemas import (
    ProjectAdminResponse, ProjectCreate, ProjectUpdate
)
from app.services.auth_service import get_current_admin
from app.services.audit_service import log_audit_event

router = APIRouter(prefix="/admin/projects", tags=["Admin Projects"])

def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_-]+", "-", text)
    return text.strip("-")

def format_project_response(p: Project) -> ProjectAdminResponse:
    tech_list = [t.strip() for t in p.technologies_csv.split(",") if t.strip()] if p.technologies_csv else []
    return ProjectAdminResponse(
        id=p.id,
        title=p.title,
        slug=p.slug,
        summary=p.summary,
        description=p.description,
        category=p.category,
        problem_statement=p.problem_statement,
        solution=p.solution,
        architecture=p.architecture,
        implementation_details=p.implementation_details,
        challenges=p.challenges,
        outcomes=p.outcomes,
        status=p.status,
        visibility=p.visibility,
        featured=p.featured,
        cover_image_url=p.cover_image_url,
        live_url=p.live_url,
        repository_url=p.repository_url,
        technologies=tech_list,
        display_order=p.display_order,
        published_at=p.published_at,
        seo_title=p.seo_title,
        seo_description=p.seo_description,
        created_at=p.created_at,
        updated_at=p.updated_at
    )

@router.get("", response_model=List[ProjectAdminResponse])
def list_admin_projects(
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin)
):
    projects = db.query(Project).order_by(Project.display_order.asc(), Project.created_at.desc()).all()
    return [format_project_response(p) for p in projects]

@router.post("", response_model=ProjectAdminResponse, status_code=status.HTTP_201_CREATED)
def create_project(
    req: ProjectCreate,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin)
):
    slug = req.slug or slugify(req.title)
    # Ensure unique slug
    base_slug = slug
    counter = 1
    while db.query(Project).filter(Project.slug == slug).first():
        slug = f"{base_slug}-{counter}"
        counter += 1

    published_at = datetime.now(timezone.utc) if req.visibility == "Published" else None

    project = Project(
        title=req.title,
        slug=slug,
        summary=req.summary,
        description=req.description,
        category=req.category,
        problem_statement=req.problem_statement,
        solution=req.solution,
        architecture=req.architecture,
        implementation_details=req.implementation_details,
        challenges=req.challenges,
        outcomes=req.outcomes,
        status=req.status,
        visibility=req.visibility,
        featured=req.featured,
        cover_image_url=req.cover_image_url,
        live_url=req.live_url,
        repository_url=req.repository_url,
        technologies_csv=req.technologies_csv,
        display_order=req.display_order,
        published_at=published_at,
        seo_title=req.seo_title,
        seo_description=req.seo_description
    )
    db.add(project)
    db.commit()
    db.refresh(project)

    log_audit_event(db, action="project.created", admin_user_id=admin.id, entity_type="Project", entity_id=project.id)
    return format_project_response(project)

@router.get("/{id}", response_model=ProjectAdminResponse)
def get_project_by_id(
    id: uuid.UUID,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin)
):
    p = db.query(Project).filter(Project.id == id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Project not found.")
    return format_project_response(p)

@router.patch("/{id}", response_model=ProjectAdminResponse)
def update_project(
    id: uuid.UUID,
    req: ProjectUpdate,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin)
):
    p = db.query(Project).filter(Project.id == id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Project not found.")

    update_dict = req.model_dump(exclude_unset=True)
    if "slug" in update_dict and update_dict["slug"] != p.slug:
        existing = db.query(Project).filter(Project.slug == update_dict["slug"], Project.id != id).first()
        if existing:
            raise HTTPException(status_code=400, detail="A project with this slug already exists.")

    if update_dict.get("visibility") == "Published" and not p.published_at:
        p.published_at = datetime.now(timezone.utc)

    for key, value in update_dict.items():
        setattr(p, key, value)

    p.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(p)

    log_audit_event(db, action="project.updated", admin_user_id=admin.id, entity_type="Project", entity_id=p.id)
    return format_project_response(p)

@router.post("/{id}/publish", response_model=ProjectAdminResponse)
def publish_project(
    id: uuid.UUID,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin)
):
    p = db.query(Project).filter(Project.id == id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Project not found.")

    p.visibility = "Published"
    p.published_at = datetime.now(timezone.utc)
    p.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(p)

    log_audit_event(db, action="project.published", admin_user_id=admin.id, entity_type="Project", entity_id=p.id)
    return format_project_response(p)

@router.post("/{id}/unpublish", response_model=ProjectAdminResponse)
def unpublish_project(
    id: uuid.UUID,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin)
):
    p = db.query(Project).filter(Project.id == id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Project not found.")

    p.visibility = "Draft"
    p.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(p)

    log_audit_event(db, action="project.unpublished", admin_user_id=admin.id, entity_type="Project", entity_id=p.id)
    return format_project_response(p)

@router.post("/{id}/archive", response_model=ProjectAdminResponse)
def archive_project(
    id: uuid.UUID,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin)
):
    p = db.query(Project).filter(Project.id == id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Project not found.")

    p.visibility = "Archived"
    p.status = "Archived"
    p.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(p)

    log_audit_event(db, action="project.archived", admin_user_id=admin.id, entity_type="Project", entity_id=p.id)
    return format_project_response(p)

@router.delete("/{id}")
def delete_project(
    id: uuid.UUID,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin)
):
    p = db.query(Project).filter(Project.id == id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Project not found.")

    db.delete(p)
    db.commit()

    log_audit_event(db, action="project.deleted", admin_user_id=admin.id, entity_type="Project", entity_id=id)
    return {"message": "Project deleted successfully"}
