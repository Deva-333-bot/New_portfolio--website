import uuid
import re
from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.all_models import BlogPost, AdminUser
from app.schemas.all_schemas import (
    BlogPostAdminResponse, BlogPostCreate, BlogPostUpdate
)
from app.services.auth_service import get_current_admin
from app.services.audit_service import log_audit_event

router = APIRouter(prefix="/admin/posts", tags=["Admin Blog"])

def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_-]+", "-", text)
    return text.strip("-")

def format_post_response(post: BlogPost) -> BlogPostAdminResponse:
    tags_list = [t.strip() for t in post.tags.split(",") if t.strip()] if post.tags else []
    return BlogPostAdminResponse(
        id=post.id,
        title=post.title,
        slug=post.slug,
        excerpt=post.excerpt,
        content=post.content,
        cover_image_url=post.cover_image_url,
        category=post.category,
        tags=tags_list,
        author_name=post.author_name,
        reading_time_minutes=post.reading_time_minutes,
        status=post.status,
        published_at=post.published_at,
        scheduled_at=post.scheduled_at,
        seo_title=post.seo_title,
        seo_description=post.seo_description,
        canonical_url=post.canonical_url,
        created_at=post.created_at,
        updated_at=post.updated_at
    )

@router.get("", response_model=List[BlogPostAdminResponse])
def list_admin_posts(
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin)
):
    posts = db.query(BlogPost).order_by(BlogPost.created_at.desc()).all()
    return [format_post_response(p) for p in posts]

@router.post("", response_model=BlogPostAdminResponse, status_code=status.HTTP_201_CREATED)
def create_post(
    req: BlogPostCreate,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin)
):
    slug = req.slug or slugify(req.title)
    base_slug = slug
    counter = 1
    while db.query(BlogPost).filter(BlogPost.slug == slug).first():
        slug = f"{base_slug}-{counter}"
        counter += 1

    published_at = datetime.now(timezone.utc) if req.status == "Published" else None

    # Estimate reading time based on word count (~200 wpm)
    word_count = len(req.content.split())
    reading_time = max(1, round(word_count / 200))

    post = BlogPost(
        title=req.title,
        slug=slug,
        excerpt=req.excerpt,
        content=req.content,
        cover_image_url=req.cover_image_url,
        category=req.category,
        tags=req.tags,
        author_name=req.author_name,
        reading_time_minutes=reading_time,
        status=req.status,
        published_at=published_at,
        scheduled_at=req.scheduled_at,
        seo_title=req.seo_title,
        seo_description=req.seo_description,
        canonical_url=req.canonical_url
    )
    db.add(post)
    db.commit()
    db.refresh(post)

    log_audit_event(db, action="post.created", admin_user_id=admin.id, entity_type="BlogPost", entity_id=post.id)
    return format_post_response(post)

@router.get("/{id}", response_model=BlogPostAdminResponse)
def get_post_by_id(
    id: uuid.UUID,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin)
):
    post = db.query(BlogPost).filter(BlogPost.id == id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found.")
    return format_post_response(post)

@router.patch("/{id}", response_model=BlogPostAdminResponse)
def update_post(
    id: uuid.UUID,
    req: BlogPostUpdate,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin)
):
    post = db.query(BlogPost).filter(BlogPost.id == id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found.")

    update_dict = req.model_dump(exclude_unset=True)
    if "slug" in update_dict and update_dict["slug"] != post.slug:
        existing = db.query(BlogPost).filter(BlogPost.slug == update_dict["slug"], BlogPost.id != id).first()
        if existing:
            raise HTTPException(status_code=400, detail="A post with this slug already exists.")

    if update_dict.get("status") == "Published" and not post.published_at:
        post.published_at = datetime.now(timezone.utc)

    if "content" in update_dict:
        word_count = len(update_dict["content"].split())
        post.reading_time_minutes = max(1, round(word_count / 200))

    for key, value in update_dict.items():
        setattr(post, key, value)

    post.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(post)

    log_audit_event(db, action="post.updated", admin_user_id=admin.id, entity_type="BlogPost", entity_id=post.id)
    return format_post_response(post)

@router.post("/{id}/publish", response_model=BlogPostAdminResponse)
def publish_post(
    id: uuid.UUID,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin)
):
    post = db.query(BlogPost).filter(BlogPost.id == id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found.")

    post.status = "Published"
    post.published_at = datetime.now(timezone.utc)
    post.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(post)

    log_audit_event(db, action="post.published", admin_user_id=admin.id, entity_type="BlogPost", entity_id=post.id)
    return format_post_response(post)

@router.post("/{id}/unpublish", response_model=BlogPostAdminResponse)
def unpublish_post(
    id: uuid.UUID,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin)
):
    post = db.query(BlogPost).filter(BlogPost.id == id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found.")

    post.status = "Draft"
    post.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(post)

    log_audit_event(db, action="post.unpublished", admin_user_id=admin.id, entity_type="BlogPost", entity_id=post.id)
    return format_post_response(post)

@router.delete("/{id}")
def delete_post(
    id: uuid.UUID,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin)
):
    post = db.query(BlogPost).filter(BlogPost.id == id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found.")

    db.delete(post)
    db.commit()

    log_audit_event(db, action="post.deleted", admin_user_id=admin.id, entity_type="BlogPost", entity_id=id)
    return {"message": "Blog post deleted successfully"}
