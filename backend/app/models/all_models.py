import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Text, Boolean, Integer, Float, DateTime, ForeignKey, Table
)
from sqlalchemy.orm import relationship
from app.core.database import Base, GUID

def utcnow():
    return datetime.now(timezone.utc)

class AdminUser(Base):
    __tablename__ = "admin_users"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    mfa_enabled = Column(Boolean, default=False, nullable=False)
    mfa_secret_encrypted = Column(String(255), nullable=True)
    last_login_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)

    sessions = relationship("AdminSession", back_populates="user", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="user")

class AdminSession(Base):
    __tablename__ = "admin_sessions"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    admin_user_id = Column(GUID, ForeignKey("admin_users.id", ondelete="CASCADE"), nullable=False, index=True)
    session_token_hash = Column(String(64), unique=True, nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False, index=True)
    revoked_at = Column(DateTime(timezone=True), nullable=True)
    last_activity_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)

    user = relationship("AdminUser", back_populates="sessions")

class Profile(Base):
    __tablename__ = "profile"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    display_name = Column(String(100), nullable=False)
    full_name = Column(String(150), nullable=False)
    headline = Column(String(255), nullable=False)
    short_bio = Column(Text, nullable=False)
    full_bio = Column(Text, nullable=False)
    location = Column(String(100), nullable=False)
    availability_status = Column(String(100), nullable=False)
    public_email = Column(String(255), nullable=True)
    avatar_url = Column(String(500), nullable=True)
    company_name = Column(String(150), nullable=True)
    education_summary = Column(String(255), nullable=True)
    expected_graduation = Column(String(50), nullable=True)
    years_experience = Column(String(50), default="4+")
    projects_completed = Column(String(50), default="15+")
    happy_clients = Column(String(50), default="10+")
    client_satisfaction = Column(String(50), default="100%")
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)

class SocialLink(Base):
    __tablename__ = "social_links"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    platform = Column(String(50), nullable=False)
    label = Column(String(100), nullable=False)
    url = Column(String(500), nullable=False)
    icon_name = Column(String(50), nullable=True)
    display_order = Column(Integer, default=0, nullable=False)
    is_visible = Column(Boolean, default=True, nullable=False)

class Skill(Base):
    __tablename__ = "skills"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    category = Column(String(50), nullable=False)  # Languages, Frontend, Backend, Databases, AI/ML, DevOps, Tools
    description = Column(Text, nullable=True)
    proficiency_label = Column(String(50), nullable=True)  # Beginner, Developing, Proficient, Advanced
    proficiency_value = Column(Integer, nullable=True)  # 0 to 100
    icon_name = Column(String(100), nullable=True)
    display_order = Column(Integer, default=0, nullable=False)
    is_visible = Column(Boolean, default=True, nullable=False)

class Project(Base):
    __tablename__ = "projects"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    title = Column(String(200), nullable=False)
    slug = Column(String(200), unique=True, nullable=False, index=True)
    summary = Column(String(500), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(100), default="Full Stack", nullable=False)
    problem_statement = Column(Text, nullable=True)
    solution = Column(Text, nullable=True)
    architecture = Column(Text, nullable=True)
    implementation_details = Column(Text, nullable=True)
    challenges = Column(Text, nullable=True)
    outcomes = Column(Text, nullable=True)
    status = Column(String(50), default="In progress", nullable=False)  # Concept, In progress, Prototype, Completed, Deployed, Archived
    visibility = Column(String(50), default="Draft", nullable=False)  # Draft, Published, Archived
    featured = Column(Boolean, default=False, nullable=False)
    cover_image_url = Column(String(500), nullable=True)
    live_url = Column(String(500), nullable=True)
    repository_url = Column(String(500), nullable=True)
    technologies_csv = Column(String(500), nullable=False, default="")  # e.g. "React, FastAPI, PostgreSQL, Tailwind CSS"
    display_order = Column(Integer, default=0, nullable=False)
    published_at = Column(DateTime(timezone=True), nullable=True)
    seo_title = Column(String(255), nullable=True)
    seo_description = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)

class BlogPost(Base):
    __tablename__ = "blog_posts"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, nullable=False, index=True)
    excerpt = Column(Text, nullable=False)
    content = Column(Text, nullable=False)
    cover_image_url = Column(String(500), nullable=True)
    category = Column(String(100), default="Engineering", nullable=False)
    tags = Column(String(500), default="", nullable=False)  # comma-separated
    author_name = Column(String(100), default="Oduor Daivine Oluoch", nullable=False)
    reading_time_minutes = Column(Integer, default=5, nullable=False)
    status = Column(String(50), default="Draft", nullable=False)  # Draft, Published, Scheduled, Archived
    published_at = Column(DateTime(timezone=True), nullable=True)
    scheduled_at = Column(DateTime(timezone=True), nullable=True)
    seo_title = Column(String(255), nullable=True)
    seo_description = Column(String(500), nullable=True)
    canonical_url = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)

class Testimonial(Base):
    __tablename__ = "testimonials"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    author_name = Column(String(150), nullable=False)
    author_role = Column(String(150), nullable=True)
    organization = Column(String(150), nullable=True)
    content = Column(Text, nullable=False)
    image_url = Column(String(500), nullable=True)
    permission_confirmed = Column(Boolean, default=False, nullable=False)
    approved = Column(Boolean, default=False, nullable=False)
    is_visible = Column(Boolean, default=False, nullable=False)
    display_order = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)

class MediaAsset(Base):
    __tablename__ = "media_assets"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    storage_key = Column(String(255), nullable=False)
    original_filename = Column(String(255), nullable=False)
    mime_type = Column(String(100), nullable=False)
    size_bytes = Column(Integer, nullable=False)
    alt_text = Column(String(255), default="", nullable=False)
    caption = Column(String(255), nullable=True)
    visibility = Column(String(50), default="public", nullable=False)
    uploaded_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)

class CVDocument(Base):
    __tablename__ = "cv_documents"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    file_path = Column(String(500), nullable=False)
    public_filename = Column(String(255), default="Oduor_Daivine_Oluoch_CV.pdf", nullable=False)
    is_published = Column(Boolean, default=True, nullable=False)
    version = Column(String(50), default="1.0", nullable=False)
    uploaded_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    published_at = Column(DateTime(timezone=True), default=utcnow, nullable=True)

class ContactMessage(Base):
    __tablename__ = "contact_messages"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    name = Column(String(150), nullable=False)
    email = Column(String(255), nullable=False, index=True)
    organization = Column(String(150), nullable=True)
    inquiry_type = Column(String(100), nullable=False)  # Employment, Consulting, Partnership, Startup/Investment, Speaking, Other
    subject = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    budget_range = Column(String(100), nullable=True)
    timeline = Column(String(100), nullable=True)
    consent_record = Column(Boolean, default=True, nullable=False)
    status = Column(String(50), default="New", nullable=False, index=True)  # New, Read, Qualified, In progress, Replied, Converted, Closed, Spam
    internal_notes = Column(Text, nullable=True)
    follow_up_date = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False, index=True)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)

    lead = relationship("Lead", back_populates="contact_message", uselist=False)

class Lead(Base):
    __tablename__ = "leads"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    contact_message_id = Column(GUID, ForeignKey("contact_messages.id"), nullable=True)
    name = Column(String(150), nullable=False)
    email = Column(String(255), nullable=False, index=True)
    organization = Column(String(150), nullable=True)
    source = Column(String(100), default="Website Contact Form", nullable=False)
    inquiry_type = Column(String(100), nullable=False)
    pipeline_status = Column(String(50), default="Lead", nullable=False, index=True)  # Lead, Qualified, In Discussion, Proposal, Converted, Closed
    estimated_value = Column(Float, nullable=True)
    currency = Column(String(10), default="USD", nullable=False)
    next_follow_up_at = Column(DateTime(timezone=True), nullable=True)
    internal_notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False, index=True)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)

    contact_message = relationship("ContactMessage", back_populates="lead")

class AnalyticsEvent(Base):
    __tablename__ = "analytics_events"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    event_name = Column(String(100), nullable=False, index=True)  # page_view, project_view, project_demo_click, github_click, cv_download, contact_form_submit, etc.
    page_path = Column(String(255), nullable=False, index=True)
    content_type = Column(String(50), nullable=True)  # project, blog, page
    content_id = Column(String(100), nullable=True)
    session_reference = Column(String(100), nullable=True, index=True)  # Pseudonymized daily hash
    referrer_domain = Column(String(255), nullable=True)
    consent_state = Column(String(50), default="granted", nullable=False)
    occurred_at = Column(DateTime(timezone=True), default=utcnow, nullable=False, index=True)

class SiteSetting(Base):
    __tablename__ = "site_settings"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    key = Column(String(100), unique=True, nullable=False, index=True)
    value_json = Column(Text, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    admin_user_id = Column(GUID, ForeignKey("admin_users.id"), nullable=True, index=True)
    action = Column(String(100), nullable=False, index=True)
    entity_type = Column(String(100), nullable=True)
    entity_id = Column(String(100), nullable=True)
    request_id = Column(String(100), nullable=True)
    metadata_json = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False, index=True)

    user = relationship("AdminUser", back_populates="audit_logs")
