def test_unauthorized_access_rejected(client):
    endpoints = [
        "/api/v1/admin/profile",
        "/api/v1/admin/projects",
        "/api/v1/admin/skills",
        "/api/v1/admin/posts",
        "/api/v1/admin/messages",
        "/api/v1/admin/leads",
        "/api/v1/admin/analytics/overview",
        "/api/v1/admin/audit-logs",
        "/api/v1/admin/settings"
    ]
    for ep in endpoints:
        resp = client.get(ep)
        assert resp.status_code == 401, f"Endpoint {ep} should require authentication, got {resp.status_code}"

def test_tampered_token_rejected(client):
    tampered_headers = {"Authorization": "Bearer fraudulent_or_tampered_token_signature"}
    resp = client.get("/api/v1/admin/profile", headers=tampered_headers)
    assert resp.status_code == 401
    assert "invalid or has expired" in resp.json()["detail"].lower()

def test_security_headers_present(client):
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.headers["x-content-type-options"] == "nosniff"
    assert resp.headers["x-frame-options"] == "DENY"
    assert "x-request-id" in resp.headers
