import os
import uuid
from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import get_db
from app.models.all_models import MediaAsset, CVDocument, AdminUser
from app.schemas.all_schemas import (
    MediaAssetResponse, CVDocumentResponse
)
from app.services.auth_service import get_current_admin
from app.services.audit_service import log_audit_event

router = APIRouter(prefix="/admin", tags=["Admin Media & CV"])

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/svg+xml", "image/gif"}
ALLOWED_DOC_TYPES = {"application/pdf"}

def ensure_upload_dir(subfolder: str = "") -> str:
    path = os.path.join(settings.LOCAL_STORAGE_DIR, subfolder)
    os.makedirs(path, exist_ok=True)
    return path

@router.get("/media", response_model=List[MediaAssetResponse])
def list_media_assets(
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin)
):
    assets = db.query(MediaAsset).order_by(MediaAsset.uploaded_at.desc()).all()
    return [MediaAssetResponse.model_validate(a) for a in assets]

@router.post("/media", response_model=MediaAssetResponse, status_code=status.HTTP_201_CREATED)
async def upload_media_asset(
    file: UploadFile = File(...),
    alt_text: str = Form(""),
    caption: str = Form(None),
    visibility: str = Form("public"),
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin)
):
    if file.content_type not in ALLOWED_IMAGE_TYPES and file.content_type not in ALLOWED_DOC_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type: {file.content_type}. Only images and PDFs are allowed."
        )

    # Read content and enforce size limit
    content = await file.read()
    if len(content) > settings.MAX_UPLOAD_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File exceeds maximum upload size limit ({settings.MAX_UPLOAD_SIZE_BYTES / 1024 / 1024} MB)."
        )

    ext = os.path.splitext(file.filename)[1].lower()
    storage_key = f"{uuid.uuid4().hex}{ext}"
    upload_dir = ensure_upload_dir("media")
    file_path = os.path.join(upload_dir, storage_key)

    with open(file_path, "wb") as f:
        f.write(content)

    asset = MediaAsset(
        storage_key=f"/uploads/media/{storage_key}",
        original_filename=file.filename,
        mime_type=file.content_type,
        size_bytes=len(content),
        alt_text=alt_text,
        caption=caption,
        visibility=visibility
    )
    db.add(asset)
    db.commit()
    db.refresh(asset)

    log_audit_event(db, action="media.uploaded", admin_user_id=admin.id, entity_type="MediaAsset", entity_id=asset.id)
    return MediaAssetResponse.model_validate(asset)

@router.delete("/media/{id}")
def delete_media_asset(
    id: uuid.UUID,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin)
):
    asset = db.query(MediaAsset).filter(MediaAsset.id == id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Media asset not found.")

    # Remove physical file if present
    rel_path = asset.storage_key.lstrip("/")
    abs_path = os.path.join(os.getcwd(), rel_path)
    if os.path.exists(abs_path):
        try:
            os.remove(abs_path)
        except Exception:
            pass

    db.delete(asset)
    db.commit()

    log_audit_event(db, action="media.deleted", admin_user_id=admin.id, entity_type="MediaAsset", entity_id=id)
    return {"message": "Media asset deleted successfully"}

# --- CV Management ---
@router.get("/cv", response_model=List[CVDocumentResponse])
def get_cv_documents(
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin)
):
    docs = db.query(CVDocument).order_by(CVDocument.uploaded_at.desc()).all()
    return [CVDocumentResponse.model_validate(d) for d in docs]

@router.post("/cv", response_model=CVDocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_cv_document(
    file: UploadFile = File(...),
    public_filename: str = Form("Oduor_Daivine_Oluoch_CV.pdf"),
    version: str = Form("1.0"),
    is_published: bool = Form(True),
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin)
):
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF format is accepted for CV uploads.")

    content = await file.read()
    if len(content) > settings.MAX_UPLOAD_SIZE_BYTES:
        raise HTTPException(status_code=400, detail="CV file exceeds max size limit.")

    upload_dir = ensure_upload_dir("cv")
    safe_name = f"cv_{uuid.uuid4().hex[:8]}.pdf"
    file_path = os.path.join(upload_dir, safe_name)

    with open(file_path, "wb") as f:
        f.write(content)

    # If publishing this CV, unpublish previous ones
    if is_published:
        db.query(CVDocument).update({"is_published": False})

    cv = CVDocument(
        file_path=file_path,
        public_filename=public_filename,
        is_published=is_published,
        version=version,
        published_at=datetime.now(timezone.utc) if is_published else None
    )
    db.add(cv)
    db.commit()
    db.refresh(cv)

    log_audit_event(db, action="cv.uploaded", admin_user_id=admin.id, entity_type="CVDocument", entity_id=cv.id)
    return CVDocumentResponse.model_validate(cv)

@router.post("/cv/{id}/publish", response_model=CVDocumentResponse)
def publish_cv_document(
    id: uuid.UUID,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin)
):
    cv = db.query(CVDocument).filter(CVDocument.id == id).first()
    if not cv:
        raise HTTPException(status_code=404, detail="CV not found.")

    db.query(CVDocument).update({"is_published": False})
    cv.is_published = True
    cv.published_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(cv)

    log_audit_event(db, action="cv.published", admin_user_id=admin.id, entity_type="CVDocument", entity_id=cv.id)
    return CVDocumentResponse.model_validate(cv)

@router.post("/cv/{id}/unpublish", response_model=CVDocumentResponse)
def unpublish_cv_document(
    id: uuid.UUID,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin)
):
    cv = db.query(CVDocument).filter(CVDocument.id == id).first()
    if not cv:
        raise HTTPException(status_code=404, detail="CV not found.")

    cv.is_published = False
    db.commit()
    db.refresh(cv)

    log_audit_event(db, action="cv.unpublished", admin_user_id=admin.id, entity_type="CVDocument", entity_id=cv.id)
    return CVDocumentResponse.model_validate(cv)
