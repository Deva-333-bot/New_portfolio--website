import os
import json
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.security import hash_password
from app.models.all_models import (
    AdminUser, Profile, SocialLink, Skill, Project,
    BlogPost, Testimonial, CVDocument, SiteSetting
)

def seed_initial_database(db: Session):
    """
    Seeds a minimal starting profile and draft content; review all public content before publication.
    Ensures idempotency (does not duplicate if already initialized).
    """
    # 1. Seed Administrator User
    existing_admin = db.query(AdminUser).filter(AdminUser.email == settings.ADMIN_BOOTSTRAP_EMAIL.lower()).first()
    if not existing_admin:
        bootstrap_password = settings.ADMIN_BOOTSTRAP_PASSWORD
        if bootstrap_password and not bootstrap_password.startswith("REPLACE_"):
            admin = AdminUser(
                email=settings.ADMIN_BOOTSTRAP_EMAIL.lower(),
                password_hash=hash_password(bootstrap_password),
                is_active=True
            )
            db.add(admin)
            print(f"Created bootstrap administrator: {settings.ADMIN_BOOTSTRAP_EMAIL}")
        else:
            print("Skipped bootstrap administrator: configure ADMIN_BOOTSTRAP_PASSWORD first.")

    # 2. Seed Profile
    existing_profile = db.query(Profile).first()
    if not existing_profile:
        profile = Profile(
            display_name="Oduor Daivine Oluoch",
            full_name="Oduor Daivine Oluoch",
            headline="Software Engineering Student | AI & ML Enthusiast | Founder",
            short_bio="Building secure, intelligent software and resilient digital systems for real-world impact across Africa and beyond.",
            full_bio=(
                "I am a software engineering student, AI and machine-learning enthusiast, and technology founder based in Kenya. "
                "I am pursuing a BSc in Software Engineering at Kirinyaga University, with expected graduation in 2028. "
                "My current interests include Python backend development, modern web applications, and applied AI. "
                "As founder of Florante Tech Limited, I am working toward practical software solutions for real-world problems."
            ),
            location="Kenya",
            availability_status="Available for high-impact opportunities & partnerships",
            public_email="hello@florante.tech",
            avatar_url=None,
            company_name="Florante Tech Limited",
            education_summary="BSc Software Engineering, Kirinyaga University",
            expected_graduation="2028",
             
        )
        db.add(profile)
        print("Seeded public profile record.")

    # 3. Seed Social Links
    if db.query(SocialLink).count() == 0:
        links = [
            SocialLink(platform="GitHub", label="GitHub", url="https://github.com/Deva-333-bot", icon_name="github", display_order=1),
            SocialLink(platform="Email", label="Email", url="mailto:hello@florante.tech", icon_name="mail", display_order=2)
        ]
        db.add_all(links)
        print("Seeded social links.")

    # 4. Seed skills from the developer's stated technical skills.
    # Do not display numeric proficiency scores without a defined assessment.
    if db.query(Skill).count() == 0:
        skills = [
            Skill(name="Python", category="Languages", icon_name="python", display_order=1),
            Skill(name="JavaScript", category="Languages", icon_name="javascript", display_order=2),
            Skill(name="React", category="Frontend", icon_name="react", display_order=3),
            Skill(name="FastAPI", category="Backend", icon_name="fastapi", display_order=4),
            Skill(name="Django", category="Backend", icon_name="django", display_order=5),
            Skill(name="PostgreSQL", category="Databases", icon_name="database", display_order=6),
            Skill(name="Git & GitHub", category="Tools", icon_name="git", display_order=7),
            Skill(name="Java", category="Languages", icon_name="java", display_order=8),
        ]
        db.add_all(skills)
        print("Seeded developer skills without unverified proficiency scores.")

    # 5. Seed a small set of known projects with restrained descriptions.
    # External URLs and performance claims are omitted until verified.
    if db.query(Project).count() == 0:
        projects = [
            Project(
                title="Personal Portfolio & CMS",
                slug="personal-portfolio-cms",
                summary="A full-stack portfolio website with a content-management dashboard.",
                description=(
                    "A portfolio application built with a Next.js frontend and a FastAPI backend. "
                    "The project includes public profile and project pages alongside administrator content-management features."
                ),
                category="Full Stack",
                problem_statement="Presenting software projects and professional information in one maintainable website.",
                solution="Building a public portfolio with an administrative interface for managing content.",
                architecture="Next.js frontend, FastAPI API, SQLAlchemy data models, and a relational database.",
                implementation_details="Includes profile, project, skills, blog, contact, and administrator workflows.",
                challenges="Keeping public content, administrative workflows, and deployment configuration maintainable.",
                outcomes="The project is being tested and refined; deployment and feature status should be verified before making production claims.",
                status="In progress",
                visibility="Published",
                featured=True,
                technologies_csv="Next.js, React, TypeScript, Python, FastAPI, SQLAlchemy, PostgreSQL",
                display_order=1,
                published_at=datetime.now(timezone.utc),
                seo_title="Personal Portfolio and CMS",
                seo_description="A full-stack developer portfolio and content-management application."
            ),
            Project(
                title="Hotel Management System",
                slug="hotel-management-system",
                summary="A prototype exploring hotel-management workflows with a React frontend and FastAPI backend.",
                description=(
                    "A software engineering prototype focused on organizing hotel-management workflows "
                    "through a web interface and API."
                ),
                category="Full Stack",
                problem_statement="Hotel operations can require a central place to organize common management workflows.",
                solution="Exploring a web application architecture using React and FastAPI.",
                architecture="React frontend with a FastAPI backend.",
                implementation_details="Prototype built to explore full-stack application structure and API integration.",
                challenges="Refining requirements and validating the workflow before describing it as production-ready.",
                outcomes="Prototype project; functionality and deployment details should be confirmed before publication of further claims.",
                status="Prototype",
                visibility="Published",
                featured=True,
                technologies_csv="React, FastAPI, Python",
                display_order=2,
                published_at=datetime.now(timezone.utc),
                seo_title="Hotel Management System Prototype",
                seo_description="A React and FastAPI prototype exploring hotel-management workflows."
            ),
            Project(
                title="Sales Forecasting",
                slug="sales-forecasting",
                summary="A machine-learning project exploring sales forecasting with Python and TensorFlow.",
                description=(
                    "A data-science project focused on exploring forecasting methods for sales data "
                    "and learning how to evaluate predictive models."
                ),
                category="AI / Machine Learning",
                problem_statement="Understanding patterns in historical sales data can help inform future planning.",
                solution="Exploring a Python-based forecasting workflow using machine-learning tools.",
                architecture="Python data-processing and model-training workflow.",
                implementation_details="Uses Python and TensorFlow as part of the forecasting project.",
                challenges="Data preparation, model selection, and validation of forecasting results.",
                outcomes="Exploratory project; no numerical accuracy or business-impact claim is made without reproducible evaluation.",
                status="Prototype",
                visibility="Published",
                featured=True,
                technologies_csv="Python, TensorFlow, Machine Learning",
                display_order=3,
                published_at=datetime.now(timezone.utc),
                seo_title="Sales Forecasting Machine Learning Project",
                seo_description="An exploratory sales forecasting project using Python and TensorFlow."
            ),
        ]
        db.add_all(projects)
        print("Seeded three project descriptions without unverified URLs or metrics.")

    # 6. Seed Sample Articles
    if db.query(BlogPost).count() == 0:
        posts = [
            BlogPost(
                title="Building Production-Grade APIs with FastAPI and SQLAlchemy 2.0",
                slug="building-production-apis-fastapi-sqlalchemy",
                excerpt="Key architectural patterns, repository separation, and session handling for resilient Python web services.",
                content=(
                    "## Introduction\n\nFastAPI has emerged as the premier choice for Python developers demanding both speed and developer ergonomics. "
                    "When paired with SQLAlchemy 2.0's type-annotated query syntax, you gain a formidable foundation for mission-critical software.\n\n"
                    "### The Repository Pattern\n\nSeparating data access from route handlers prevents tight coupling and makes unit testing effortless. "
                    "Rather than invoking raw queries inside your path operations, encapsulate queries inside service classes.\n\n"
                    "### Session Lifecycle & Connection Pooling\n\nAlways ensure that database sessions are closed promptly through FastAPI dependencies. "
                    "Use pool pre-ping to protect against stale connections when running in serverless or cloud container environments."
                ),
                category="Engineering",
                tags="FastAPI, Python, SQLAlchemy, Architecture",
                author_name="Oduor Daivine Oluoch",
                reading_time_minutes=4,
                status="Draft",
                published_at=None,
                seo_title="Building Production APIs with FastAPI and SQLAlchemy 2.0",
                seo_description="Best practices for structuring scalable, production-ready Python backend services."
            ),
            BlogPost(
                title="Designing for Security: OWASP Top 10 Protections in Modern Full-Stack Web Apps",
                slug="designing-for-security-owasp-top-10",
                excerpt="Practical countermeasures against injection, broken access control, and session hijacking in Next.js and FastAPI.",
                content=(
                    "## Why Security Cannot Be an Afterthought\n\nToo many developers treat security as a checklist item to address right before launch. "
                    "In truth, security is an architectural decision that must be baked into every layer of your software.\n\n"
                    "### Defending Against Broken Access Control\n\nFrontend route guards are cosmetic. Every API endpoint must independently verify "
                    "the authenticity of the requesting user and their authorization to access the specific entity ID requested.\n\n"
                    "### Opaque Server-Validated Sessions\n\nStore only cryptographic hashes of session tokens in your database. "
                    "If a database dump is ever compromised, the attacker cannot forge valid user sessions."
                ),
                category="Cybersecurity",
                tags="Cybersecurity, OWASP, AppSec, Next.js",
                author_name="Oduor Daivine Oluoch",
                reading_time_minutes=6,
                status="Draft",
                published_at=None,
                seo_title="Full-Stack Web Application Security - OWASP Countermeasures",
                seo_description="Practical architectural guide to securing modern web applications against common vulnerabilities."
            )
        ]
        db.add_all(posts)
        print("Seeded technical blog articles.")

    

    

    db.commit()
    print("Database seeding completed successfully!")
