from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.all_models import AdminUser
from app.schemas.all_schemas import AnalyticsOverviewResponse
from app.services.auth_service import get_current_admin
from app.services.analytics_service import get_analytics_overview

router = APIRouter(prefix="/admin/analytics", tags=["Admin Analytics"])

@router.get("/overview", response_model=AnalyticsOverviewResponse)
def get_analytics(
    days: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin)
):
    overview = get_analytics_overview(db, days=days)
    return AnalyticsOverviewResponse(**overview)
