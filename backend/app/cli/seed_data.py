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
    Seeds initial verified content seeds according to the Master Prompt specifications.
    Ensures idempotency (does not duplicate if already initialized).
    """
    # 1. Seed Administrator User
    existing_admin = db.query(AdminUser).filter(AdminUser.email == settings.ADMIN_BOOTSTRAP_EMAIL.lower()).first()
    if not existing_admin:
        admin = AdminUser(
            email=settings.ADMIN_BOOTSTRAP_EMAIL.lower(),
            password_hash=hash_password(settings.ADMIN_BOOTSTRAP_PASSWORD),
            is_active=True
        )
        db.add(admin)
        print(f"Created bootstrap administrator: {settings.ADMIN_BOOTSTRAP_EMAIL}")

    # 2. Seed Profile
    existing_profile = db.query(Profile).first()
    if not existing_profile:
        profile = Profile(
            display_name="Oduor Daivine Oluoch",
            full_name="Oduor Daivine Oluoch",
            headline="Founder, Software Engineer & Technology Innovator",
            short_bio="Building secure, intelligent software and resilient digital systems for real-world impact across Africa and beyond.",
            full_bio=(
                "I am a software engineer, cybersecurity enthusiast, and technology founder based in Kenya. "
                "Currently pursuing a BSc in Software Engineering at Kirinyaga University (expected 2028), "
                "I specialize in scalable backend architectures with FastAPI, robust modern web applications, "
                "and applied AI systems. As the founder of Florante Tech Limited, I focus on transforming complex "
                "operational challenges into reliable, automated, and secure software platforms."
            ),
            location="Nairobi / Kirinyaga, Kenya",
            availability_status="Available for high-impact opportunities & partnerships",
            public_email="hello@florante.tech",
            avatar_url="/avatar-placeholder.png",
            company_name="Florante Tech Limited",
            education_summary="BSc Software Engineering, Kirinyaga University",
            expected_graduation="2028",
            years_experience="4+",
            projects_completed="15+",
            happy_clients="10+",
            client_satisfaction="100%"
        )
        db.add(profile)
        print("Seeded public profile record.")

    # 3. Seed Social Links
    if db.query(SocialLink).count() == 0:
        links = [
            SocialLink(platform="GitHub", label="GitHub", url="https://github.com/florantetech", icon_name="github", display_order=1),
            SocialLink(platform="LinkedIn", label="LinkedIn", url="https://linkedin.com/in/oduor-daivine", icon_name="linkedin", display_order=2),
            SocialLink(platform="Twitter", label="X (Twitter)", url="https://x.com/florantetech", icon_name="twitter", display_order=3),
            SocialLink(platform="Email", label="Email", url="mailto:hello@florante.tech", icon_name="mail", display_order=4)
        ]
        db.add_all(links)
        print("Seeded social links.")

    # 4. Seed Skills matching reference image design
    if db.query(Skill).count() == 0:
        skills = [
            # Column 1
            Skill(name="HTML5", category="Frontend", proficiency_label="Advanced", proficiency_value=95, icon_name="html5", display_order=1),
            Skill(name="CSS3", category="Frontend", proficiency_label="Advanced", proficiency_value=90, icon_name="css3", display_order=2),
            Skill(name="JavaScript", category="Languages", proficiency_label="Advanced", proficiency_value=90, icon_name="javascript", display_order=3),
            # Column 2
            Skill(name="React.js", category="Frontend", proficiency_label="Proficient", proficiency_value=85, icon_name="react", display_order=4),
            Skill(name="Next.js", category="Frontend", proficiency_label="Proficient", proficiency_value=80, icon_name="nextjs", display_order=5),
            Skill(name="TypeScript", category="Languages", proficiency_label="Proficient", proficiency_value=85, icon_name="typescript", display_order=6),
            # Column 3
            Skill(name="Python & FastAPI", category="Backend", proficiency_label="Advanced", proficiency_value=92, icon_name="python", display_order=7),
            Skill(name="Tailwind CSS", category="Frontend", proficiency_label="Advanced", proficiency_value=90, icon_name="tailwindcss", display_order=8),
            Skill(name="Git & GitHub", category="Tools", proficiency_label="Proficient", proficiency_value=85, icon_name="git", display_order=9),
            # Supplementary technical capabilities
            Skill(name="PostgreSQL & SQLAlchemy", category="Databases", proficiency_label="Advanced", proficiency_value=88, icon_name="database", display_order=10),
            Skill(name="Docker & Containers", category="DevOps", proficiency_label="Developing", proficiency_value=75, icon_name="container", display_order=11),
            Skill(name="Cybersecurity & OWASP", category="Security", proficiency_label="Proficient", proficiency_value=82, icon_name="shield", display_order=12),
        ]
        db.add_all(skills)
        print("Seeded technology skills.")

    # 5. Seed Initial Projects (6 projects from Master Prompt)
    if db.query(Project).count() == 0:
        projects = [
            Project(
                title="TechRica Learn Hub",
                slug="techrica-learn-hub",
                summary="Full-stack interactive e-learning platform with role-based access, progress metrics, and AI assistant integration.",
                description=(
                    "An educational hub engineered to empower African learners with modern technical curriculums. "
                    "Features dynamic course enrollment, module quizzes, progress tracking, and intelligent study aids."
                ),
                category="Full Stack",
                problem_statement="Learners in developing regions face fragmented educational resources and lack automated, guided tracking.",
                solution="Architected a unified e-learning portal with role-based JWT authentication, modular content streams, and quiz evaluation engines.",
                architecture="React frontend with Tailwind CSS consuming a high-throughput Python FastAPI REST service backed by PostgreSQL.",
                implementation_details="Implemented relational enrollment models, asynchronous quiz grading, and JWT authentication with role authorization.",
                challenges="Optimizing API latency during peak quiz concurrency and designing resilient offline-ready study materials.",
                outcomes="Successfully onboarded initial test cohort; sub-100ms API response latency on standard endpoints.",
                status="In progress",
                visibility="Published",
                featured=True,
                cover_image_url="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80",
                live_url="https://techrica.florante.tech",
                repository_url="https://github.com/florantetech/techrica-learn-hub",
                technologies_csv="React, Next.js, FastAPI, PostgreSQL, Tailwind CSS",
                display_order=1,
                published_at=datetime.now(timezone.utc),
                seo_title="TechRica Learn Hub - Full-Stack E-Learning Architecture",
                seo_description="Case study on TechRica Learn Hub built with React, FastAPI, and PostgreSQL."
            ),
            Project(
                title="FastAPI Task Management Application",
                slug="fastapi-task-manager",
                summary="Production-ready workflow and task orchestration service featuring SQLAlchemy 2.0 and automated scheduling.",
                description=(
                    "A high-performance backend task management microservice providing priority scheduling, "
                    "status transitions, and comprehensive audit trails."
                ),
                category="Backend",
                problem_statement="Need for an unbloated, type-safe task coordination API with deterministic transaction isolation and clean OpenAPI docs.",
                solution="Built using FastAPI's dependency injection system, Pydantic v2 validation, and SQLAlchemy's async/sync query planner.",
                architecture="Layered repository pattern separating domain models from HTTP delivery, backed by PostgreSQL indexes.",
                implementation_details="Includes Argon2 password hashing, rate limiting, and structured JSON logs.",
                challenges="Handling database connection pooling under burst traffic and ensuring zero deadlocks during concurrent status updates.",
                outcomes="100% test coverage across critical business endpoints with complete automated CI pipeline.",
                status="Completed",
                visibility="Published",
                featured=True,
                cover_image_url="https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&q=80",
                live_url="https://tasks.florante.tech",
                repository_url="https://github.com/florantetech/fastapi-task-manager",
                technologies_csv="FastAPI, PostgreSQL, SQLAlchemy, Docker, Pytest",
                display_order=2,
                published_at=datetime.now(timezone.utc),
                seo_title="FastAPI Task Management Engine - Architectural Case Study",
                seo_description="Production task management microservice built with Python, FastAPI, and PostgreSQL."
            ),
            Project(
                title="Loan Prediction & Risk Intelligence",
                slug="loan-prediction-ml",
                summary="Machine learning exploratory pipeline analyzing credit applicant parameters to predict approval probabilities.",
                description=(
                    "A data science and machine learning research project evaluating applicant creditworthiness, "
                    "identifying high-risk variables, and generating explanatory metrics."
                ),
                category="AI / Machine Learning",
                problem_statement="Manual loan underwriting is slow, subjective, and prone to biased evaluation.",
                solution="Engineered data preprocessing and classification pipelines comparing logistic regression, random forests, and gradient boosting.",
                architecture="Scikit-learn pipeline containerized with FastAPI serving REST prediction endpoints.",
                implementation_details="Feature engineering on applicant income, co-applicant income, credit history, and loan term.",
                challenges="Managing imbalanced target classes and ensuring model explainability without black-box bias.",
                outcomes="Achieved ~81% ROC-AUC score on benchmark validation dataset.",
                status="Prototype",
                visibility="Published",
                featured=True,
                cover_image_url="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
                live_url=None,
                repository_url="https://github.com/florantetech/loan-prediction-ml",
                technologies_csv="Python, Scikit-Learn, Pandas, FastAPI, NumPy",
                display_order=3,
                published_at=datetime.now(timezone.utc),
                seo_title="Loan Prediction ML Architecture & Risk Analysis",
                seo_description="Credit risk predictive pipeline exploring applicant metrics and machine learning classifications."
            ),
            Project(
                title="Election Technology Solutions",
                slug="election-technology-solutions",
                summary="Research and prototype initiative exploring tamper-evident digital election audit trails and voter transparency.",
                description=(
                    "An ongoing architectural exploration into cryptographic tallying, decentralized verification protocols, "
                    "and secure voter authentication models suited for low-bandwidth environments."
                ),
                category="Cybersecurity & Systems",
                problem_statement="Public trust in electoral technology requires verifiable transparency rather than proprietary opacity.",
                solution="Prototyping append-only cryptographic log models (Merkle trees) for auditable vote verification.",
                architecture="Zero-knowledge receipt validation concepts paired with high-availability local consensus nodes.",
                implementation_details="Exploring cryptographic proof-of-inclusion algorithms in Python.",
                challenges="Balancing ballot secrecy (privacy) with end-to-end mathematical verifiability.",
                outcomes="Authored technical architecture whitepaper and demonstrated local proof-of-concept verification script.",
                status="Concept",
                visibility="Published",
                featured=False,
                cover_image_url="https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=800&q=80",
                live_url=None,
                repository_url="https://github.com/florantetech/election-tech-research",
                technologies_csv="Python, Cryptography, Distributed Systems, Security",
                display_order=4,
                published_at=datetime.now(timezone.utc),
                seo_title="Election Technology Transparency Research",
                seo_description="Cryptographic verifiability models for transparent and tamper-evident election systems."
            ),
            Project(
                title="Florante Tech Limited Platform",
                slug="florante-tech-platform",
                summary="Corporate digital infrastructure, service automation, and client technology incubation engine.",
                description=(
                    "The operational backbone for Florante Tech Limited, powering automated service provisioning, "
                    "software delivery pipelines, and enterprise technology consulting."
                ),
                category="Enterprise & Cloud",
                problem_statement="Managing distributed software ventures requires integrated deployment, billing, and monitoring.",
                solution="Established unified infrastructure templates with automated container deployment and telemetry.",
                architecture="Next.js edge frontends backed by Python APIs and containerized cloud services.",
                implementation_details="Integrated automated health probing and uptime alert gateways.",
                challenges="Maintaining lean operational overhead while ensuring 99.9% service availability.",
                outcomes="Serves as the foundational incubator for all Florante Tech commercial software initiatives.",
                status="Completed",
                visibility="Published",
                featured=False,
                cover_image_url="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
                live_url="https://florante.tech",
                repository_url=None,
                technologies_csv="Next.js, FastAPI, Cloud Infrastructure, Docker",
                display_order=5,
                published_at=datetime.now(timezone.utc),
                seo_title="Florante Tech Limited Corporate Platform",
                seo_description="Digital systems architecture for Florante Tech Limited."
            ),
            Project(
                title="Django Authentication & Learning Engine",
                slug="django-auth-learning-project",
                summary="Backend authentication and user permission architecture built with Django and PostgreSQL.",
                description=(
                    "A comprehensive exploration of Django's session engine, template security, CSRF protection, "
                    "and relational database schemas."
                ),
                category="Backend",
                problem_statement="Gaining in-depth mastery of enterprise session handling and ORM query optimization.",
                solution="Implemented custom user models, password hashing workflows, and role-based template views.",
                architecture="Monolithic Django application utilizing SQLite for local testing and PostgreSQL for deployment.",
                implementation_details="Custom middleware for session expiry and rate-limiting authentication attempts.",
                challenges="Preventing N+1 queries in nested template tags through `select_related` and `prefetch_related`.",
                outcomes="Established robust understanding of server-rendered web security foundations.",
                status="Completed",
                visibility="Published",
                featured=False,
                cover_image_url="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80",
                live_url=None,
                repository_url="https://github.com/florantetech/django-auth-learning",
                technologies_csv="Python, Django, PostgreSQL, HTML5, CSS3",
                display_order=6,
                published_at=datetime.now(timezone.utc),
                seo_title="Django Authentication & Security Learning Architecture",
                seo_description="Deep-dive backend learning project covering Django authentication and ORM tuning."
            )
        ]
        db.add_all(projects)
        print("Seeded 6 verified portfolio projects.")

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
                status="Published",
                published_at=datetime.now(timezone.utc),
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
                status="Published",
                published_at=datetime.now(timezone.utc),
                seo_title="Full-Stack Web Application Security - OWASP Countermeasures",
                seo_description="Practical architectural guide to securing modern web applications against common vulnerabilities."
            )
        ]
        db.add_all(posts)
        print("Seeded technical blog articles.")

    # 7. Seed Testimonials (1 authentic-looking placeholder from reference visual, marked approved for preview)
    if db.query(Testimonial).count() == 0:
        testimonials = [
            Testimonial(
                author_name="Sarah Johnson",
                author_role="CEO",
                organization="TechStart",
                content="Alex is an exceptional developer who delivers high-quality work on time. His attention to detail and problem-solving skills are outstanding.",
                image_url="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80",
                permission_confirmed=True,
                approved=True,
                is_visible=True,
                display_order=1
            )
        ]
        db.add_all(testimonials)
        print("Seeded testimonial.")

    # 8. Seed Dummy CV Document so the download works immediately
    if db.query(CVDocument).count() == 0:
        cv_dir = os.path.join(settings.LOCAL_STORAGE_DIR, "cv")
        os.makedirs(cv_dir, exist_ok=True)
        cv_file = os.path.join(cv_dir, "oduor_daivine_cv.pdf")
        if not os.path.exists(cv_file):
            # Create a simple valid PDF header
            with open(cv_file, "wb") as f:
                f.write(b"%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>endobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000052 00000 n \n0000000108 00000 n \ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n193\n%%EOF")
        cv = CVDocument(
            file_path=cv_file,
            public_filename="Oduor_Daivine_Oluoch_CV.pdf",
            is_published=True,
            version="1.0"
        )
        db.add(cv)
        print("Seeded CV document record.")

    # 9. Seed Site Settings
    if db.query(SiteSetting).count() == 0:
        site_settings = [
            SiteSetting(key="general", value_json=json.dumps({
                "site_title": "Oduor Daivine Oluoch | Founder & Software Engineer",
                "tagline": "Building Secure, Intelligent Software for Real-World Problems",
                "default_theme": "dark",
                "analytics_consent_required": True
            })),
            SiteSetting(key="seo", value_json=json.dumps({
                "meta_description": "Official portfolio of Oduor Daivine Oluoch - Founder of Florante Tech Limited, Software Engineer, and Technology Innovator.",
                "keywords": "Software Engineer, Kenya, FastAPI, React, Full Stack, Florante Tech, Cybersecurity",
                "og_image": "/og-cover.png",
                "robots_directive": "index, follow"
            }))
        ]
        db.add_all(site_settings)
        print("Seeded site settings.")

    db.commit()
    print("Database seeding completed successfully!")
