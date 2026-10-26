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


def test_state_changing_admin_request_rejects_untrusted_origin(client, auth_headers):
    response = client.put(
        "/api/v1/admin/profile",
        headers={"Origin": "https://attacker.example", **auth_headers},
        json={},
    )
    assert response.status_code == 403


def test_production_config_rejects_placeholder_secrets():
    import pytest
    from pydantic import ValidationError
    from app.core.config import Settings

    with pytest.raises(ValidationError):
        Settings(
            APP_ENV="production",
            DEBUG=False,
            SESSION_SECRET="change_me_to_a_very_secure_random_64_character_hex_string_for_production",
            PASSWORD_RESET_SECRET="another_placeholder_secret_value_that_is_long_enough",
            ADMIN_BOOTSTRAP_PASSWORD="Unique-Strong-Admin-Password-2026!",
            FRONTEND_ORIGINS="https://portfolio.example",
            CANONICAL_SITE_URL="https://portfolio.example",
            API_BASE_URL="https://api.portfolio.example",
        )


def test_production_console_email_does_not_log_message_body(monkeypatch, capsys):
    from app.core.config import settings
    from app.services.email_service import send_notification_email

    monkeypatch.setattr(settings, "APP_ENV", "production")
    monkeypatch.setattr(settings, "EMAIL_PROVIDER", "console")
    monkeypatch.setattr(settings, "SMTP_HOST", None)

    delivered = send_notification_email(
        "Private inquiry",
        "PII_MARKER_DO_NOT_LOG",
        to_address="private@example.com",
    )
    output = capsys.readouterr().out
    assert delivered is False
    assert "PII_MARKER_DO_NOT_LOG" not in output
    assert "private@example.com" not in output


def test_password_reset_token_is_invalidated_after_password_update():
    from datetime import datetime, timezone, timedelta
    from app.core.security import generate_reset_token, verify_reset_token

    original_updated_at = datetime.now(timezone.utc) - timedelta(days=1)
    token = generate_reset_token("admin@example.com", original_updated_at)
    assert verify_reset_token(token) == "admin@example.com"
    assert verify_reset_token(token, original_updated_at) == "admin@example.com"

    changed_updated_at = datetime.now(timezone.utc)
    assert verify_reset_token(token, changed_updated_at) is None
