import uuid
from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, HttpUrl

# Base Config
class SchemaBase(BaseModel):
    model_config = {"from_attributes": True}

# --- Auth Schemas ---
class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    remember_me: bool = False

class LoginResponse(BaseModel):
    expires_at: datetime
    user: "UserResponse"

class UserResponse(SchemaBase):
    id: uuid.UUID
    email: EmailStr
    is_active: bool
    mfa_enabled: bool
    last_login_at: Optional[datetime] = None

class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=14)

class PasswordForgotRequest(BaseModel):
    email: EmailStr

class PasswordResetRequest(BaseModel):
    token: str
    new_password: str = Field(..., min_length=14)

# --- Profile & Social Links ---
class ProfileResponse(SchemaBase):
    id: uuid.UUID
    display_name: str
    full_name: str
    headline: str
    short_bio: str
    full_bio: str
    location: str
    availability_status: str
    public_email: Optional[str] = None
    avatar_url: Optional[str] = None
    company_name: Optional[str] = None
    education_summary: Optional[str] = None
    expected_graduation: Optional[str] = None
    years_experience: str
    projects_completed: str
    happy_clients: str
    client_satisfaction: str
    updated_at: datetime

class ProfileUpdate(BaseModel):
    display_name: Optional[str] = None
    full_name: Optional[str] = None
    headline: Optional[str] = None
    short_bio: Optional[str] = None
    full_bio: Optional[str] = None
    location: Optional[str] = None
    availability_status: Optional[str] = None
    public_email: Optional[str] = None
    avatar_url: Optional[str] = None
    company_name: Optional[str] = None
    education_summary: Optional[str] = None
    expected_graduation: Optional[str] = None
    years_experience: Optional[str] = None
    projects_completed: Optional[str] = None
    happy_clients: Optional[str] = None
    client_satisfaction: Optional[str] = None

class SocialLinkSchema(SchemaBase):
    id: uuid.UUID
    platform: str
    label: str
    url: str
    icon_name: Optional[str] = None
    display_order: int
    is_visible: bool

class SocialLinkCreate(BaseModel):
    platform: str
    label: str
    url: str
    icon_name: Optional[str] = None
    display_order: int = 0
    is_visible: bool = True

class SocialLinkUpdate(BaseModel):
    platform: Optional[str] = None
    label: Optional[str] = None
    url: Optional[str] = None
    icon_name: Optional[str] = None
    display_order: Optional[int] = None
    is_visible: Optional[bool] = None

# --- Skill Schemas ---
class SkillSchema(SchemaBase):
    id: uuid.UUID
    name: str
    category: str
    description: Optional[str] = None
    proficiency_label: Optional[str] = None
    proficiency_value: Optional[int] = None
    icon_name: Optional[str] = None
    display_order: int
    is_visible: bool

class SkillCreate(BaseModel):
    name: str
    category: str
    description: Optional[str] = None
    proficiency_label: Optional[str] = None
    proficiency_value: Optional[int] = Field(None, ge=0, le=100)
    icon_name: Optional[str] = None
    display_order: int = 0
    is_visible: bool = True

class SkillUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    proficiency_label: Optional[str] = None
    proficiency_value: Optional[int] = Field(None, ge=0, le=100)
    icon_name: Optional[str] = None
    display_order: Optional[int] = None
    is_visible: Optional[bool] = None

# --- Project Schemas ---
class ProjectPublicResponse(SchemaBase):
    id: uuid.UUID
    title: str
    slug: str
    summary: str
    description: str
    category: str
    status: str
    featured: bool
    cover_image_url: Optional[str] = None
    live_url: Optional[str] = None
    repository_url: Optional[str] = None
    technologies: List[str]
    published_at: Optional[datetime] = None

class ProjectDetailResponse(ProjectPublicResponse):
    problem_statement: Optional[str] = None
    solution: Optional[str] = None
    architecture: Optional[str] = None
    implementation_details: Optional[str] = None
    challenges: Optional[str] = None
    outcomes: Optional[str] = None
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None

class ProjectAdminResponse(ProjectDetailResponse):
    visibility: str
    display_order: int
    created_at: datetime
    updated_at: datetime

class ProjectCreate(BaseModel):
    title: str
    slug: Optional[str] = None
    summary: str
    description: str
    category: str = "Full Stack"
    problem_statement: Optional[str] = None
    solution: Optional[str] = None
    architecture: Optional[str] = None
    implementation_details: Optional[str] = None
    challenges: Optional[str] = None
    outcomes: Optional[str] = None
    status: str = "In progress"
    visibility: str = "Draft"
    featured: bool = False
    cover_image_url: Optional[str] = None
    live_url: Optional[str] = None
    repository_url: Optional[str] = None
    technologies_csv: str = ""
    display_order: int = 0
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None

class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    summary: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    problem_statement: Optional[str] = None
    solution: Optional[str] = None
    architecture: Optional[str] = None
    implementation_details: Optional[str] = None
    challenges: Optional[str] = None
    outcomes: Optional[str] = None
    status: Optional[str] = None
    visibility: Optional[str] = None
    featured: Optional[bool] = None
    cover_image_url: Optional[str] = None
    live_url: Optional[str] = None
    repository_url: Optional[str] = None
    technologies_csv: Optional[str] = None
    display_order: Optional[int] = None
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None

# --- Blog Schemas ---
class BlogPostPublicResponse(SchemaBase):
    id: uuid.UUID
    title: str
    slug: str
    excerpt: str
    cover_image_url: Optional[str] = None
    category: str
    tags: List[str]
    author_name: str
    reading_time_minutes: int
    published_at: Optional[datetime] = None

class BlogPostDetailResponse(BlogPostPublicResponse):
    content: str
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None
    canonical_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime

class BlogPostAdminResponse(BlogPostDetailResponse):
    status: str
    scheduled_at: Optional[datetime] = None

class BlogPostCreate(BaseModel):
    title: str
    slug: Optional[str] = None
    excerpt: str
    content: str
    cover_image_url: Optional[str] = None
    category: str = "Engineering"
    tags: str = ""
    author_name: str = "Oduor Daivine Oluoch"
    reading_time_minutes: int = 5
    status: str = "Draft"
    scheduled_at: Optional[datetime] = None
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None
    canonical_url: Optional[str] = None

class BlogPostUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    excerpt: Optional[str] = None
    content: Optional[str] = None
    cover_image_url: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[str] = None
    author_name: Optional[str] = None
    reading_time_minutes: Optional[int] = None
    status: Optional[str] = None
    scheduled_at: Optional[datetime] = None
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None
    canonical_url: Optional[str] = None

# --- Testimonial Schemas ---
class TestimonialPublicResponse(SchemaBase):
    id: uuid.UUID
    author_name: str
    author_role: Optional[str] = None
    organization: Optional[str] = None
    content: str
    image_url: Optional[str] = None

class TestimonialAdminResponse(TestimonialPublicResponse):
    permission_confirmed: bool
    approved: bool
    is_visible: bool
    display_order: int
    created_at: datetime

class TestimonialCreate(BaseModel):
    author_name: str
    author_role: Optional[str] = None
    organization: Optional[str] = None
    content: str
    image_url: Optional[str] = None
    permission_confirmed: bool = False
    approved: bool = False
    is_visible: bool = False
    display_order: int = 0

class TestimonialUpdate(BaseModel):
    author_name: Optional[str] = None
    author_role: Optional[str] = None
    organization: Optional[str] = None
    content: Optional[str] = None
    image_url: Optional[str] = None
    permission_confirmed: Optional[bool] = None
    approved: Optional[bool] = None
    is_visible: Optional[bool] = None
    display_order: Optional[int] = None

# --- Media & CV Schemas ---
class MediaAssetResponse(SchemaBase):
    id: uuid.UUID
    storage_key: str
    original_filename: str
    mime_type: str
    size_bytes: int
    alt_text: str
    caption: Optional[str] = None
    visibility: str
    uploaded_at: datetime

class CVDocumentResponse(SchemaBase):
    id: uuid.UUID
    file_path: str
    public_filename: str
    is_published: bool
    version: str
    uploaded_at: datetime
    published_at: Optional[datetime] = None

# --- Contact & Leads ---
class ContactSubmitRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=150)
    email: EmailStr
    organization: Optional[str] = Field(None, max_length=150)
    inquiry_type: str = "General"
    subject: str = Field(..., min_length=3, max_length=255)
    message: str = Field(..., min_length=10, max_length=5000)
    budget_range: Optional[str] = None
    timeline: Optional[str] = None
    consent: bool = False
    honeypot: Optional[str] = None  # Anti-spam: must remain empty

class ContactSubmitResponse(BaseModel):
    success: bool
    message: str
    reference_id: uuid.UUID

class ContactMessageAdminResponse(SchemaBase):
    id: uuid.UUID
    name: str
    email: EmailStr
    organization: Optional[str] = None
    inquiry_type: str
    subject: str
    message: str
    budget_range: Optional[str] = None
    timeline: Optional[str] = None
    consent_record: bool
    status: str
    internal_notes: Optional[str] = None
    follow_up_date: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

class ContactMessageUpdate(BaseModel):
    status: Optional[str] = None
    internal_notes: Optional[str] = None
    follow_up_date: Optional[datetime] = None

class LeadAdminResponse(SchemaBase):
    id: uuid.UUID
    contact_message_id: Optional[uuid.UUID] = None
    name: str
    email: EmailStr
    organization: Optional[str] = None
    source: str
    inquiry_type: str
    pipeline_status: str
    estimated_value: Optional[float] = None
    currency: str
    next_follow_up_at: Optional[datetime] = None
    internal_notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

class LeadCreate(BaseModel):
    contact_message_id: Optional[uuid.UUID] = None
    name: str
    email: EmailStr
    organization: Optional[str] = None
    source: str = "Direct"
    inquiry_type: str = "Consulting"
    pipeline_status: str = "Lead"
    estimated_value: Optional[float] = None
    currency: str = "USD"
    next_follow_up_at: Optional[datetime] = None
    internal_notes: Optional[str] = None

class LeadUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    organization: Optional[str] = None
    source: Optional[str] = None
    inquiry_type: Optional[str] = None
    pipeline_status: Optional[str] = None
    estimated_value: Optional[float] = None
    currency: Optional[str] = None
    next_follow_up_at: Optional[datetime] = None
    internal_notes: Optional[str] = None

# --- Analytics Schemas ---
class AnalyticsEventCreate(BaseModel):
    event_name: str = Field(..., max_length=100)
    page_path: str = Field(..., max_length=255)
    content_type: Optional[str] = None
    content_id: Optional[str] = None
    session_reference: Optional[str] = None
    referrer_domain: Optional[str] = None
    consent_state: str = "unspecified"

class AnalyticsOverviewResponse(BaseModel):
    total_page_views: int
    unique_visitors: int
    cv_downloads: int
    contact_inquiries: int
    qualified_leads: int
    conversion_rate_percent: float
    pipeline_total_value: float
    views_by_date: List[Dict[str, Any]]
    traffic_sources: List[Dict[str, Any]]
    top_pages: List[Dict[str, Any]]
    top_projects: List[Dict[str, Any]]

# --- Settings & Audit ---
class SiteSettingSchema(SchemaBase):
    id: uuid.UUID
    key: str
    value_json: str
    updated_at: datetime

class AuditLogResponse(SchemaBase):
    id: uuid.UUID
    admin_user_id: Optional[uuid.UUID] = None
    action: str
    entity_type: Optional[str] = None
    entity_id: Optional[str] = None
    request_id: Optional[str] = None
    metadata_json: Optional[str] = None
    created_at: datetime

# --- GitHub Integration ---
class GitHubRepoResponse(BaseModel):
    name: str
    full_name: str
    description: Optional[str] = None
    html_url: str
    language: Optional[str] = None
    stargazers_count: int = 0
    forks_count: int = 0
    updated_at: Optional[str] = None
    is_pinned: bool = False
