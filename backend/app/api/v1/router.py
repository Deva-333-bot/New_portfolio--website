from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth,
    public,
    admin_profile,
    admin_projects,
    admin_skills,
    admin_blog,
    admin_testimonials,
    admin_media_cv,
    admin_contact_leads,
    admin_analytics,
    admin_settings_audit_github
)

api_v1_router = APIRouter(prefix="/api/v1")

# Mount public & auth endpoints
api_v1_router.include_router(auth.router)
api_v1_router.include_router(public.router)

# Mount admin CMS endpoints
api_v1_router.include_router(admin_profile.router)
api_v1_router.include_router(admin_projects.router)
api_v1_router.include_router(admin_skills.router)
api_v1_router.include_router(admin_blog.router)
api_v1_router.include_router(admin_testimonials.router)
api_v1_router.include_router(admin_media_cv.router)
api_v1_router.include_router(admin_contact_leads.router)
api_v1_router.include_router(admin_analytics.router)
api_v1_router.include_router(admin_settings_audit_github.router)
