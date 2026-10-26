import json
from typing import Optional, Any
from sqlalchemy.orm import Session
from app.models.all_models import AuditLog

def log_audit_event(
    db: Session,
    action: str,
    admin_user_id: Optional[Any] = None,
    entity_type: Optional[str] = None,
    entity_id: Optional[str] = None,
    request_id: Optional[str] = None,
    metadata: Optional[dict] = None
):
    try:
        metadata_str = json.dumps(metadata) if metadata else None
        audit = AuditLog(
            admin_user_id=admin_user_id,
            action=action,
            entity_type=entity_type,
            entity_id=str(entity_id) if entity_id else None,
            request_id=request_id,
            metadata_json=metadata_str
        )
        db.add(audit)
        db.commit()
    except Exception as e:
        db.rollback()
        # Non-blocking audit failure
        print(f"Failed to log audit event: {e}")
