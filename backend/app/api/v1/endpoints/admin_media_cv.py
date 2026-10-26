import os
import re
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

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
IMAGE_EXTENSIONS = {
    "image/jpeg": {".jpg", ".jpeg"},
    "image/png": {".png"},
    "image/webp": {".webp"},
    "image/gif": {".gif"},
}


def image_signature_matches(content: bytes, mime_type: str) -> bool:
    if mime_type == "image/jpeg":
        return content.startswith(b"\\xff\\xd8\\xff")
    if mime_type == "image/png":
        return content.startswith(b"\\x89PNG\\r\\n\\x1a\\n")
    if mime_type == "image/gif":
        return content.startswith((b"GIF87a", b"GIF89a"))
    if mime_type == "image/webp":
        return len(content) >= 12 and content[:4] == b"RIFF" and content[8:12] == b"WEBP"
    return False


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
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported image type. Upload JPEG, PNG, WebP, or GIF images only."
        )

    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in IMAGE_EXTENSIONS[file.content_type]:
        raise HTTPException(status_code=400, detail="File extension does not match the image type.")

    # Read one byte beyond the limit so oversized uploads are rejected promptly.
    content = await file.read(settings.MAX_UPLOAD_SIZE_BYTES + 1)
    if len(content) > settings.MAX_UPLOAD_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File exceeds maximum upload size limit ({settings.MAX_UPLOAD_SIZE_BYTES / 1024 / 1024} MB)."
        )
    if not image_signature_matches(content, file.content_type):
        raise HTTPException(status_code=400, detail="The uploaded file does not match its declared image type.")

    # Public static hosting is only used for public media, never private files.
    if visibility != "public":
        raise HTTPException(status_code=400, detail="Only public image assets can be uploaded here.")
    storage_key = f"{uuid.uuid4().hex}{ext}"
    upload_dir = ensure_upload_dir("media")
    file_path = os.path.join(upload_dir, storage_key)

    with open(file_path, "wb") as f:
        f.write(content)

    asset = MediaAsset(
        storage_key=f"/uploads/media/{storage_key}",
        original_filename=os.path.basename((file.filename or "image").replace("\\", "/"))[:255],
        mime_type=file.content_type,
        size_bytes=len(content),
        alt_text=alt_text[:255],
        caption=caption[:255] if caption else None,
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
    rel_path = asset.storage_key.removeprefix("/uploads/").lstrip("/")
    storage_root = os.path.abspath(settings.LOCAL_STORAGE_DIR)
    abs_path = os.path.abspath(os.path.join(storage_root, rel_path))
    if os.path.commonpath([storage_root, abs_path]) == storage_root and os.path.exists(abs_path):
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

    content = await file.read(settings.MAX_UPLOAD_SIZE_BYTES + 1)
    if len(content) > settings.MAX_UPLOAD_SIZE_BYTES:
        raise HTTPException(status_code=400, detail="CV file exceeds max size limit.")
    if not content.startswith(b"%PDF-"):
        raise HTTPException(status_code=400, detail="The uploaded file is not a valid PDF.")

    public_filename = os.path.basename((public_filename or "Oduor_Daivine_Oluoch_CV.pdf").replace("\\", "/"))
    public_filename = re.sub(r"[^A-Za-z0-9._ -]", "_", public_filename).strip(" .")[:250]
    if not public_filename.lower().endswith(".pdf"):
        public_filename += ".pdf"
    version = (version or "1.0")[:50]

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
