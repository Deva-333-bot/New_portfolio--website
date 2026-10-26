"""Safely unpublish legacy placeholder content without deleting records.

Run from the backend directory:
    python -m app.cli.sanitize_seed_content          # dry run
    python -m app.cli.sanitize_seed_content --apply  # apply changes
"""
import argparse
import os

from app.core.database import SessionLocal
from sqlalchemy import or_
from app.models.all_models import BlogPost, CVDocument, Profile, Project, Skill, Testimonial, SocialLink


LEGACY_PROJECT_SLUGS = {
    "techrica-learn-hub",
    "fastapi-task-manager",
    "loan-prediction-ml",
    "election-technology-solutions",
    "florante-tech-platform",
    "django-auth-learning-project",
}
LEGACY_POST_SLUGS = {
    "building-production-apis-fastapi-sqlalchemy",
    "designing-for-security-owasp-top-10",
}
LEGACY_PROFILE_STATS = {
    "years_experience": "4+",
    "projects_completed": "15+",
    "happy_clients": "10+",
    "client_satisfaction": "100%",
}


def sanitize(apply: bool = False) -> dict[str, int]:
    """Report or safely unpublish known placeholder content; never delete rows."""
    counts = {
        "legacy_projects_to_unpublish": 0,
        "legacy_posts_to_unpublish": 0,
        "unpermitted_testimonials_to_hide": 0,
        "dummy_cvs_to_unpublish": 0,
        "unverified_social_links_to_hide": 0,
        "skills_with_numeric_scores": 0,
        "profiles_with_seeded_stats": 0,
    }

    with SessionLocal() as db:
        projects = db.query(Project).filter(Project.slug.in_(LEGACY_PROJECT_SLUGS)).all()
        counts["legacy_projects_to_unpublish"] = sum(p.visibility == "Published" for p in projects)
        if apply:
            for project in projects:
                project.visibility = "Draft"
                project.featured = False

        posts = db.query(BlogPost).filter(BlogPost.slug.in_(LEGACY_POST_SLUGS)).all()
        counts["legacy_posts_to_unpublish"] = sum(p.status == "Published" for p in posts)
        if apply:
            for post in posts:
                post.status = "Draft"
                post.published_at = None

        testimonials = db.query(Testimonial).filter(
            or_(
                Testimonial.permission_confirmed.is_(False),
                Testimonial.author_name.ilike("Sarah Johnson"),
                Testimonial.organization.ilike("TechStart"),
            )
        ).all()
        counts["unpermitted_testimonials_to_hide"] = sum(
            t.approved or t.is_visible for t in testimonials
        )
        if apply:
            for testimonial in testimonials:
                testimonial.approved = False
                testimonial.is_visible = False

        unverified_social_links = db.query(SocialLink).filter(
            or_(
                SocialLink.url.ilike("%linkedin.com/in/oduor-daivine%"),
                SocialLink.url.ilike("%x.com/florantetech%"),
            )
        ).all()
        counts["unverified_social_links_to_hide"] = sum(link.is_visible for link in unverified_social_links)
        if apply:
            for link in unverified_social_links:
                link.is_visible = False

        cvs = db.query(CVDocument).filter(CVDocument.is_published.is_(True)).all()
        dummy_cvs = [
            cv for cv in cvs
            if os.path.basename(cv.file_path).lower() == "oduor_daivine_cv.pdf"
        ]
        counts["dummy_cvs_to_unpublish"] = len(dummy_cvs)
        if apply:
            for cv in dummy_cvs:
                cv.is_published = False

        skills = db.query(Skill).filter(Skill.proficiency_value.is_not(None)).all()
        counts["skills_with_numeric_scores"] = len(skills)
        if apply:
            for skill in skills:
                skill.proficiency_value = None
                # Keep manually entered descriptive labels; the public UI no longer
                # renders numeric progress bars.

        profiles = db.query(Profile).all()
        seeded_stats = [
            profile for profile in profiles
            if any(getattr(profile, key, None) == value for key, value in LEGACY_PROFILE_STATS.items())
        ]
        counts["profiles_with_seeded_stats"] = len(seeded_stats)
        if apply:
            for profile in seeded_stats:
                for key, value in LEGACY_PROFILE_STATS.items():
                    if getattr(profile, key, None) == value:
                        setattr(profile, key, "")

        if apply:
            db.commit()
        else:
            db.rollback()

    return counts


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--apply", action="store_true", help="Apply changes. Without this flag, only report counts.")
    args = parser.parse_args()
    counts = sanitize(apply=args.apply)
    print("Mode:", "APPLY (changes committed)" if args.apply else "DRY RUN (no changes made)")
    for name, count in counts.items():
        print(f"{name}: {count}")


if __name__ == "__main__":
    main()
