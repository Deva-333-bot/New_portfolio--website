def test_public_profile(client):
    response = client.get("/api/v1/public/profile")
    assert response.status_code == 200
    data = response.json()
    assert "profile" in data
    assert data["profile"]["display_name"] == "Oduor Daivine Oluoch"
    assert data["profile"]["company_name"] == "Florante Tech Limited"
    assert len(data["social_links"]) > 0

def test_public_skills(client):
    response = client.get("/api/v1/public/skills")
    assert response.status_code == 200
    skills = response.json()
    skill_names = [s["name"] for s in skills]
    assert "Python" in skill_names
    assert "React" in skill_names
    assert "PostgreSQL" in skill_names
    assert all(s["proficiency_value"] is None for s in skills)


def test_public_projects_list_and_detail(client):
    response = client.get("/api/v1/public/projects")
    assert response.status_code == 200
    projects = response.json()
    slugs = [p["slug"] for p in projects]
    assert "personal-portfolio-cms" in slugs
    assert "hotel-management-system" in slugs
    assert "sales-forecasting" in slugs

    detail_resp = client.get("/api/v1/public/projects/personal-portfolio-cms")
    assert detail_resp.status_code == 200
    detail = detail_resp.json()
    assert detail["title"] == "Personal Portfolio & CMS"
    assert "problem_statement" in detail
    assert "architecture" in detail


def test_public_posts_are_unpublished_until_reviewed(client):
    response = client.get("/api/v1/public/posts")
    assert response.status_code == 200
    assert response.json() == []


def test_public_testimonials(client):
    response = client.get("/api/v1/public/testimonials")
    assert response.status_code == 200
    assert response.json() == []


def test_cv_download(client):
    response = client.get("/api/v1/public/cv")
    assert response.status_code == 404
    assert response.json()["detail"] == "CV document is currently unavailable."


def test_contact_form_submission_creates_lead(client):
    payload = {
        "name": "David Kimani",
        "email": "david.kimani@example.com",
        "organization": "Safaricom Ventures",
        "inquiry_type": "Partnership",
        "subject": "Platform Integration Discussion",
        "message": "We are interested in discussing collaboration opportunities with Florante Tech.",
        "budget_range": "$10,000 - $25,000",
        "timeline": "1-3 months",
        "consent": True,
        "honeypot": ""  # Clean human submission
    }
    response = client.post("/api/v1/public/contact", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "reference_id" in data

def test_contact_form_requires_consent(client):
    payload = {
        "name": "Taylor Example",
        "email": "taylor@example.com",
        "subject": "Project inquiry",
        "message": "I would like to discuss a potential project.",
        "consent": False,
        "honeypot": "",
    }
    response = client.post("/api/v1/public/contact", json=payload)
    assert response.status_code == 400
    assert "consent" in response.json()["detail"].lower()


def test_contact_form_honeypot_rejection(client):
    payload = {
        "name": "Spam Bot",
        "email": "bot@spammer.com",
        "subject": "Buy crypto",
        "message": "Click this link to get free coins",
        "honeypot": "I am a hidden bot value"
    }
    response = client.post("/api/v1/public/contact", json=payload)
    assert response.status_code == 200
    # Silently ignored bot

def test_analytics_event_recording(client, db_session):
    from app.models.all_models import AnalyticsEvent

    payload = {
        "event_name": "page_view",
        "page_path": "/projects",
        "referrer_domain": "google.com",
        "session_reference": "client-supplied-identifier",
        "consent_state": "granted",
    }
    response = client.post("/api/v1/public/analytics/events", json=payload)
    assert response.status_code == 200
    assert response.json()["status"] == "ok"
    event = db_session.query(AnalyticsEvent).filter_by(event_name="page_view").first()
    assert event is not None
    assert event.session_reference != "client-supplied-identifier"
    assert len(event.session_reference) == 16


def test_analytics_is_ignored_without_explicit_consent(client, db_session):
    from app.models.all_models import AnalyticsEvent

    response = client.post("/api/v1/public/analytics/events", json={
        "event_name": "page_view",
        "page_path": "/",
        "consent_state": "unspecified",
    })
    assert response.status_code == 200
    assert response.json()["status"] == "ignored"
    assert db_session.query(AnalyticsEvent).filter_by(page_path="/").count() == 0
