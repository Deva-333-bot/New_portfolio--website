import os
from contextlib import asynccontextmanager

# Deterministic, test-only settings; never depend on a developer's local .env.
os.environ["APP_ENV"] = "testing"
os.environ["ADMIN_BOOTSTRAP_PASSWORD"] = "TestOnly-Portfolio-Passphrase-2026!"

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.database import Base, get_db
from app.core.config import settings
from app.main import app
from app.cli.seed_data import seed_initial_database
from app.core.middleware import rate_limiter

# Prevent application startup from opening/seeding the developer's real database.
@asynccontextmanager
async def test_lifespan(_app):
    yield

app.router.lifespan_context = test_lifespan

# Use in-memory SQLite database for tests
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

test_engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=test_engine)
    with TestingSessionLocal() as db:
        seed_initial_database(db)
    yield
    Base.metadata.drop_all(bind=test_engine)

@pytest.fixture
def db_session():
    connection = test_engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    try:
        yield session
    finally:
        session.close()
        transaction.rollback()
        connection.close()

@pytest.fixture
def client(db_session):
    rate_limiter.reset()
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

@pytest.fixture
def auth_headers(client):
    response = client.post("/api/v1/auth/login", json={
        "email": settings.ADMIN_BOOTSTRAP_EMAIL,
        "password": settings.ADMIN_BOOTSTRAP_PASSWORD
    })
    assert response.status_code == 200, f"Login failed: {response.text}"
    # TestClient keeps the HttpOnly session cookie for subsequent requests.
    return {}
