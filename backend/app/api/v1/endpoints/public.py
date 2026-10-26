import os
import uuid
import hashlib
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import get_db
from app.core.middleware import rate_limiter, get_client_ip
from app.models.all_models import (
    Profile, SocialLink, Skill, Project, BlogPost,
    Testimonial, CVDocument, ContactMessage, Lead, AnalyticsEvent
)
from app.schemas.all_schemas import (
    ProfileResponse, SocialLinkSchema, SkillSchema,
    ProjectPublicResponse, ProjectDetailResponse,
    BlogPostPublicResponse, BlogPostDetailResponse,
    TestimonialPublicResponse, CVDocumentResponse,
    ContactSubmitRequest, ContactSubmitResponse,
    AnalyticsEventCreate
)
from app.services.email_service import send_notification_email

router = APIRouter(prefix="/public", tags=["Public Content"])

@router.get("/profile")
def get_public_profile(db: Session = Depends(get_db)):
    profile = db.query(Profile).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not configured.")
    social_links = (
        db.query(SocialLink)
        .filter(SocialLink.is_visible == True)
        .order_by(SocialLink.display_order.asc())
        .all()
    )
    return {
        "profile": ProfileResponse.model_validate(profile),
        "social_links": [SocialLinkSchema.model_validate(s) for s in social_links]
    }

@router.get("/skills", response_model=List[SkillSchema])
def get_public_skills(db: Session = Depends(get_db)):
    skills = (
        db.query(Skill)
        .filter(Skill.is_visible == True)
        .order_by(Skill.category.asc(), Skill.display_order.asc())
        .all()
    )
    return [SkillSchema.model_validate(s) for s in skills]

@router.get("/projects", response_model=List[ProjectPublicResponse])
def get_public_projects(category: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Project).filter(Project.visibility == "Published")
    if category and category != "All":
        query = query.filter(Project.category == category)

    projects = query.order_by(Project.display_order.asc(), Project.created_at.desc()).all()
    results = []
    for p in projects:
        tech_list = [t.strip() for t in p.technologies_csv.split(",") if t.strip()] if p.technologies_csv else []
        results.append(ProjectPublicResponse(
            id=p.id,
            title=p.title,
            slug=p.slug,
            summary=p.summary,
            description=p.description,
            category=p.category,
            status=p.status,
            featured=p.featured,
            cover_image_url=p.cover_image_url,
            live_url=p.live_url,
            repository_url=p.repository_url,
            technologies=tech_list,
            published_at=p.published_at
        ))
    return results

@router.get("/projects/{slug}", response_model=ProjectDetailResponse)
def get_public_project_detail(slug: str, db: Session = Depends(get_db)):
    p = db.query(Project).filter(Project.slug == slug, Project.visibility == "Published").first()
    if not p:
        raise HTTPException(status_code=404, detail="Project not found or not published.")

    tech_list = [t.strip() for t in p.technologies_csv.split(",") if t.strip()] if p.technologies_csv else []
    return ProjectDetailResponse(
        id=p.id,
        title=p.title,
        slug=p.slug,
        summary=p.summary,
        description=p.description,
        category=p.category,
        status=p.status,
        featured=p.featured,
        cover_image_url=p.cover_image_url,
        live_url=p.live_url,
        repository_url=p.repository_url,
        technologies=tech_list,
        published_at=p.published_at,
        problem_statement=p.problem_statement,
        solution=p.solution,
        architecture=p.architecture,
        implementation_details=p.implementation_details,
        challenges=p.challenges,
        outcomes=p.outcomes,
        seo_title=p.seo_title,
        seo_description=p.seo_description
    )

@router.get("/posts", response_model=List[BlogPostPublicResponse])
def get_public_posts(db: Session = Depends(get_db)):
    posts = (
        db.query(BlogPost)
        .filter(BlogPost.status == "Published")
        .order_by(BlogPost.published_at.desc(), BlogPost.created_at.desc())
        .all()
    )
    results = []
    for post in posts:
        tags_list = [t.strip() for t in post.tags.split(",") if t.strip()] if post.tags else []
        results.append(BlogPostPublicResponse(
            id=post.id,
            title=post.title,
            slug=post.slug,
            excerpt=post.excerpt,
            cover_image_url=post.cover_image_url,
            category=post.category,
            tags=tags_list,
            author_name=post.author_name,
            reading_time_minutes=post.reading_time_minutes,
            published_at=post.published_at
        ))
    return results

@router.get("/posts/{slug}", response_model=BlogPostDetailResponse)
def get_public_post_detail(slug: str, db: Session = Depends(get_db)):
    post = db.query(BlogPost).filter(BlogPost.slug == slug, BlogPost.status == "Published").first()
    if not post:
        raise HTTPException(status_code=404, detail="Article not found or not published.")

    tags_list = [t.strip() for t in post.tags.split(",") if t.strip()] if post.tags else []
    return BlogPostDetailResponse(
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
        published_at=post.published_at,
        seo_title=post.seo_title,
        seo_description=post.seo_description,
        canonical_url=post.canonical_url,
        created_at=post.created_at,
        updated_at=post.updated_at
    )

@router.get("/testimonials", response_model=List[TestimonialPublicResponse])
def get_public_testimonials(db: Session = Depends(get_db)):
    testimonials = (
        db.query(Testimonial)
        .filter(Testimonial.approved == True, Testimonial.is_visible == True)
        .order_by(Testimonial.display_order.asc())
        .all()
    )
    return [TestimonialPublicResponse.model_validate(t) for t in testimonials]

@router.get("/cv")
def download_public_cv(db: Session = Depends(get_db)):
    cv = db.query(CVDocument).filter(CVDocument.is_published == True).order_by(CVDocument.uploaded_at.desc()).first()
    if not cv or not os.path.exists(cv.file_path):
        raise HTTPException(status_code=404, detail="CV document is currently unavailable.")

    return FileResponse(
        path=cv.file_path,
        filename=cv.public_filename,
        media_type="application/pdf"
    )

@router.post("/contact", response_model=ContactSubmitResponse)
def submit_contact_form(
    req: ContactSubmitRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    client_ip = get_client_ip(request)
    rate_limiter.check_rate_limit(client_ip, settings.RATE_LIMIT_CONTACT_PER_MINUTE)

    # Honeypot Anti-Spam Check: must be empty
    if req.honeypot:
        # Silently reject bot
        return ContactSubmitResponse(
            success=True,
            message="Your inquiry has been received.",
            reference_id=uuid.uuid4()
        )

    # Save contact message
    msg = ContactMessage(
        name=req.name.strip(),
        email=req.email.lower().strip(),
        organization=req.organization.strip() if req.organization else None,
        inquiry_type=req.inquiry_type,
        subject=req.subject.strip(),
        message=req.message.strip(),
        budget_range=req.budget_range,
        timeline=req.timeline,
        consent_record=req.consent,
        status="New"
    )
    db.add(msg)
    db.flush()

    # Create associated Lead in pipeline automatically
    lead = Lead(
        contact_message_id=msg.id,
        name=msg.name,
        email=msg.email,
        organization=msg.organization,
        source="Website Contact Form",
        inquiry_type=msg.inquiry_type,
        pipeline_status="Lead",
        estimated_value=None,
        currency="USD"
    )
    db.add(lead)
    db.commit()

    # Record analytics event
    event = AnalyticsEvent(
        event_name="contact_form_submit",
        page_path="/contact",
        content_type="lead",
        content_id=str(lead.id),
        session_reference=hashlib.sha256(f"{client_ip}:{datetime.now().strftime('%Y-%m-%d')}".encode()).hexdigest()[:16]
    )
    db.add(event)
    db.commit()

    # Send email notification to site owner
    send_notification_email(
        subject=f"New Lead / Inquiry: {msg.subject} ({msg.name})",
        body_text=(
            f"You received a new inquiry from {msg.name} ({msg.email}):\n\n"
            f"Type: {msg.inquiry_type}\n"
            f"Organization: {msg.organization or 'N/A'}\n"
            f"Budget: {msg.budget_range or 'N/A'}\n"
            f"Timeline: {msg.timeline or 'N/A'}\n\n"
            f"Message:\n{msg.message}\n\n"
            f"View and manage in Admin CMS at: {settings.CANONICAL_SITE_URL}/admin/messages"
        )
    )

    return ContactSubmitResponse(
        success=True,
        message="Thank you! Your message has been sent successfully. I will get back to you shortly.",
        reference_id=msg.id
    )

@router.post("/analytics/events")
def record_analytics_event(
    req: AnalyticsEventCreate,
    request: Request,
    db: Session = Depends(get_db)
):
    client_ip = get_client_ip(request)
    rate_limiter.check_rate_limit(client_ip, settings.RATE_LIMIT_ANALYTICS_PER_MINUTE)

    # Privacy-conscious daily pseudonymized session reference
    session_ref = req.session_reference
    if not session_ref:
        today_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        session_ref = hashlib.sha256(f"{client_ip}:{today_str}".encode()).hexdigest()[:16]

    event = AnalyticsEvent(
        event_name=req.event_name,
        page_path=req.page_path,
        content_type=req.content_type,
        content_id=req.content_id,
        session_reference=session_ref,
        referrer_domain=req.referrer_domain,
        consent_state=req.consent_state
    )
    db.add(event)
    db.commit()

    return {"status": "ok"}
