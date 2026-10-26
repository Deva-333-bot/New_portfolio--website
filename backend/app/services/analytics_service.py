from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from app.models.all_models import AnalyticsEvent, ContactMessage, Lead, Project

def get_analytics_overview(db: Session, days: int = 30) -> Dict[str, Any]:
    since_date = datetime.now(timezone.utc) - timedelta(days=days)

    # 1. Total page views
    total_views = db.query(func.count(AnalyticsEvent.id)).filter(
        AnalyticsEvent.event_name == "page_view",
        AnalyticsEvent.occurred_at >= since_date
    ).scalar() or 0

    # 2. Unique visitors (count distinct session_reference)
    unique_visitors = db.query(func.count(func.distinct(AnalyticsEvent.session_reference))).filter(
        AnalyticsEvent.occurred_at >= since_date,
        AnalyticsEvent.session_reference.isnot(None)
    ).scalar() or 0

    # Fallback if no session ref was captured
    if unique_visitors == 0 and total_views > 0:
        unique_visitors = max(1, int(total_views * 0.7))

    # 3. CV downloads
    cv_downloads = db.query(func.count(AnalyticsEvent.id)).filter(
        AnalyticsEvent.event_name == "cv_download",
        AnalyticsEvent.occurred_at >= since_date
    ).scalar() or 0

    # 4. Contact inquiries
    contact_inquiries = db.query(func.count(ContactMessage.id)).filter(
        ContactMessage.created_at >= since_date
    ).scalar() or 0

    # 5. Qualified leads
    qualified_leads = db.query(func.count(Lead.id)).filter(
        Lead.pipeline_status.in_(["Qualified", "In Discussion", "Proposal", "Converted"]),
        Lead.created_at >= since_date
    ).scalar() or 0

    # 6. Conversion Rate
    conv_rate = round((contact_inquiries / unique_visitors * 100), 2) if unique_visitors > 0 else 0.0

    # 7. Pipeline total value
    pipeline_val = db.query(func.sum(Lead.estimated_value)).scalar() or 0.0

    # 8. Daily Views timeline
    daily_stats = (
        db.query(
            func.date(AnalyticsEvent.occurred_at).label("day"),
            func.count(AnalyticsEvent.id).label("views")
        )
        .filter(AnalyticsEvent.occurred_at >= since_date)
        .group_by(func.date(AnalyticsEvent.occurred_at))
        .order_by("day")
        .all()
    )
    views_by_date = [{"date": str(stat[0]), "views": stat[1]} for stat in daily_stats]

    # If no recorded views in window, provide today entry
    if not views_by_date:
        today_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        views_by_date = [{"date": today_str, "views": total_views}]

    # 9. Traffic sources breakdown
    source_stats = (
        db.query(
            AnalyticsEvent.referrer_domain,
            func.count(AnalyticsEvent.id).label("count")
        )
        .filter(AnalyticsEvent.occurred_at >= since_date)
        .group_by(AnalyticsEvent.referrer_domain)
        .order_by(desc("count"))
        .limit(5)
        .all()
    )
    traffic_sources = [
        {"source": (stat[0] or "Direct / Search"), "visitors": stat[1]}
        for stat in source_stats
    ]
    if not traffic_sources:
        traffic_sources = [{"source": "Direct / Search", "visitors": total_views}]

    # 10. Top Pages
    page_stats = (
        db.query(
            AnalyticsEvent.page_path,
            func.count(AnalyticsEvent.id).label("count")
        )
        .filter(AnalyticsEvent.occurred_at >= since_date)
        .group_by(AnalyticsEvent.page_path)
        .order_by(desc("count"))
        .limit(6)
        .all()
    )
    top_pages = [{"path": p[0], "views": p[1]} for p in page_stats]
    if not top_pages:
        top_pages = [{"path": "/", "views": total_views}]

    # 11. Top Projects
    project_stats = (
        db.query(
            AnalyticsEvent.content_id,
            func.count(AnalyticsEvent.id).label("count")
        )
        .filter(
            AnalyticsEvent.occurred_at >= since_date,
            AnalyticsEvent.content_type == "project"
        )
        .group_by(AnalyticsEvent.content_id)
        .order_by(desc("count"))
        .limit(5)
        .all()
    )
    top_projects = [{"slug": p[0] or "featured", "views": p[1]} for p in project_stats]

    return {
        "total_page_views": total_views,
        "unique_visitors": unique_visitors,
        "cv_downloads": cv_downloads,
        "contact_inquiries": contact_inquiries,
        "qualified_leads": qualified_leads,
        "conversion_rate_percent": conv_rate,
        "pipeline_total_value": float(pipeline_val),
        "views_by_date": views_by_date,
        "traffic_sources": traffic_sources,
        "top_pages": top_pages,
        "top_projects": top_projects
    }
