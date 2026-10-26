import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.config import settings
from app.core.database import engine, Base, get_db
from app.core.middleware import RequestContextMiddleware
from app.api.v1.router import api_v1_router
from app.cli.seed_data import seed_initial_database

# Ensure uploads directory exists
os.makedirs(os.path.join(settings.LOCAL_STORAGE_DIR, "media"), exist_ok=True)
os.makedirs(os.path.join(settings.LOCAL_STORAGE_DIR, "cv"), exist_ok=True)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure tables exist and insert starter content only into empty tables
    Base.metadata.create_all(bind=engine)
    from app.core.database import SessionLocal
    with SessionLocal() as db:
        seed_initial_database(db)
    yield
    # Shutdown

app = FastAPI(
    title="Portfolio Platform & Admin CMS API",
    description="Production-grade API with persistent storage, authentication, content publishing, visitor analytics, and lead management.",
    version="1.0.0",
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
    lifespan=lifespan
)

# Request context and security headers middleware
app.add_middleware(RequestContextMiddleware)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["X-Request-ID"]
)

# Static file serving for uploads
app.mount(
    "/uploads/media",
    StaticFiles(directory=os.path.join(settings.LOCAL_STORAGE_DIR, "media")),
    name="public-media",
)

# Health and readiness check endpoints
@app.get("/health", tags=["Operations"])
def health_check():
    return {
        "status": "healthy",
        "version": "1.0.0"
    }

@app.get("/ready", tags=["Operations"])
def readiness_check(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        return {"status": "ready", "database": "connected"}
    except Exception:
        from fastapi import HTTPException
        raise HTTPException(
            status_code=503,
            detail={"status": "unavailable", "database": "disconnected"}
        )

# Mount v1 API
app.include_router(api_v1_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG)
