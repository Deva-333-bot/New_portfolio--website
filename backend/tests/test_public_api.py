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
    assert len(skills) >= 9
    skill_names = [s["name"] for s in skills]
    assert "Python & FastAPI" in skill_names
    assert "React.js" in skill_names
    assert "HTML5" in skill_names

def test_public_projects_list_and_detail(client):
    response = client.get("/api/v1/public/projects")
    assert response.status_code == 200
    projects = response.json()
    assert len(projects) >= 6
    slugs = [p["slug"] for p in projects]
    assert "techrica-learn-hub" in slugs

    # Detail view
    detail_resp = client.get("/api/v1/public/projects/techrica-learn-hub")
    assert detail_resp.status_code == 200
    detail = detail_resp.json()
    assert detail["title"] == "TechRica Learn Hub"
    assert "problem_statement" in detail
    assert "architecture" in detail

def test_public_posts(client):
    response = client.get("/api/v1/public/posts")
    assert response.status_code == 200
    posts = response.json()
    assert len(posts) >= 2
    post_slug = posts[0]["slug"]

    detail_resp = client.get(f"/api/v1/public/posts/{post_slug}")
    assert detail_resp.status_code == 200
    assert "content" in detail_resp.json()

def test_public_testimonials(client):
    response = client.get("/api/v1/public/testimonials")
    assert response.status_code == 200
    testimonials = response.json()
    assert len(testimonials) >= 1
    assert testimonials[0]["author_name"] == "Sarah Johnson"

def test_cv_download(client):
    response = client.get("/api/v1/public/cv")
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"
    assert "Oduor_Daivine_Oluoch_CV.pdf" in response.headers.get("content-disposition", "")

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

def test_analytics_event_recording(client):
    payload = {
        "event_name": "page_view",
        "page_path": "/projects",
        "referrer_domain": "google.com"
    }
    response = client.post("/api/v1/public/analytics/events", json=payload)
    assert response.status_code == 200
    assert response.json()["status"] == "ok"
