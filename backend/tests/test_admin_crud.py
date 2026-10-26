def test_admin_profile_update(client, auth_headers):
    # Update headline
    new_headline = "Founder, Principal Systems Architect & AI Innovator"
    response = client.put("/api/v1/admin/profile", headers=auth_headers, json={
        "headline": new_headline
    })
    assert response.status_code == 200
    assert response.json()["headline"] == new_headline

    # Verify public reflection
    pub_resp = client.get("/api/v1/public/profile")
    assert pub_resp.json()["profile"]["headline"] == new_headline

def test_admin_project_lifecycle(client, auth_headers):
    # 1. Create Draft Project
    create_payload = {
        "title": "Quantum Safe Encryption Service",
        "slug": "quantum-safe-encryption",
        "summary": "Post-quantum cryptographic microservice.",
        "description": "Explores lattice-based algorithms in Python.",
        "category": "Cybersecurity",
        "status": "Prototype",
        "visibility": "Draft",
        "featured": False,
        "technologies_csv": "Python, Cryptography, Rust"
    }
    create_resp = client.post("/api/v1/admin/projects", headers=auth_headers, json=create_payload)
    assert create_resp.status_code == 201
    project_id = create_resp.json()["id"]

    # Draft should NOT appear on public endpoint
    pub_list = client.get("/api/v1/public/projects").json()
    assert not any(p["id"] == project_id for p in pub_list)

    # 2. Publish Project
    pub_resp = client.post(f"/api/v1/admin/projects/{project_id}/publish", headers=auth_headers)
    assert pub_resp.status_code == 200
    assert pub_resp.json()["visibility"] == "Published"

    # Now it MUST appear on public endpoint
    pub_list_after = client.get("/api/v1/public/projects").json()
    assert any(p["id"] == project_id for p in pub_list_after)

    # 3. Unpublish Project
    unpub_resp = client.post(f"/api/v1/admin/projects/{project_id}/unpublish", headers=auth_headers)
    assert unpub_resp.status_code == 200
    assert unpub_resp.json()["visibility"] == "Draft"

    # Verify it is removed from public endpoint again
    pub_list_final = client.get("/api/v1/public/projects").json()
    assert not any(p["id"] == project_id for p in pub_list_final)

def test_admin_contact_messages_and_leads(client, auth_headers):
    # Submit message
    client.post("/api/v1/public/contact", json={
        "name": "Grace Hopper",
        "email": "grace@navy.mil",
        "subject": "Compiler Optimization",
        "message": "Let us talk about optimizing compilers and high performance routines.",
        "inquiry_type": "Consulting"
    })

    # Retrieve in admin
    messages_resp = client.get("/api/v1/admin/messages", headers=auth_headers)
    assert messages_resp.status_code == 200
    messages = messages_resp.json()
    assert len(messages) > 0
    grace_msg = next((m for m in messages if m["email"] == "grace@navy.mil"), None)
    assert grace_msg is not None

    # Update message status
    patch_resp = client.patch(f"/api/v1/admin/messages/{grace_msg['id']}", headers=auth_headers, json={
        "status": "Qualified",
        "internal_notes": "High priority inquiry, contact within 24h"
    })
    assert patch_resp.status_code == 200
    assert patch_resp.json()["status"] == "Qualified"

    # Check leads pipeline
    leads_resp = client.get("/api/v1/admin/leads", headers=auth_headers)
    assert leads_resp.status_code == 200
    leads = leads_resp.json()
    assert any(l["email"] == "grace@navy.mil" for l in leads)

    # Export CSV
    csv_resp = client.get("/api/v1/admin/leads-export/csv", headers=auth_headers)
    assert csv_resp.status_code == 200
    assert "text/csv" in csv_resp.headers["content-type"]
    assert "grace@navy.mil" in csv_resp.text

def test_admin_analytics_overview(client, auth_headers):
    response = client.get("/api/v1/admin/analytics/overview?days=30", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "total_page_views" in data
    assert "unique_visitors" in data
    assert "conversion_rate_percent" in data
    assert "views_by_date" in data
    assert "top_pages" in data

def test_admin_audit_logs(client, auth_headers):
    response = client.get("/api/v1/admin/audit-logs", headers=auth_headers)
    assert response.status_code == 200
    logs = response.json()
    assert len(logs) > 0
