from app.core.config import settings

def test_login_success(client):
    response = client.post("/api/v1/auth/login", json={
        "email": settings.ADMIN_BOOTSTRAP_EMAIL,
        "password": settings.ADMIN_BOOTSTRAP_PASSWORD
    })
    assert response.status_code == 200
    data = response.json()
    assert "token" in data
    assert data["user"]["email"] == settings.ADMIN_BOOTSTRAP_EMAIL.lower()
    # Check HttpOnly cookie was set
    assert "portfolio_session" in response.cookies

def test_login_invalid_password(client):
    response = client.post("/api/v1/auth/login", json={
        "email": settings.ADMIN_BOOTSTRAP_EMAIL,
        "password": "WrongPassword123!"
    })
    assert response.status_code == 401
    assert "Invalid email or password" in response.json()["detail"]

def test_get_me(client, auth_headers):
    response = client.get("/api/v1/auth/me", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == settings.ADMIN_BOOTSTRAP_EMAIL.lower()
    assert data["is_active"] is True

def test_logout(client, auth_headers):
    # Logout
    response = client.post("/api/v1/auth/logout", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["message"] == "Successfully logged out"

    # Verifying old token is rejected
    me_resp = client.get("/api/v1/auth/me", headers=auth_headers)
    assert me_resp.status_code == 401

def test_password_change(client, auth_headers):
    new_pass = "BrandNewSecurePassword2026!"
    response = client.post("/api/v1/auth/password/change", headers=auth_headers, json={
        "current_password": settings.ADMIN_BOOTSTRAP_PASSWORD,
        "new_password": new_pass
    })
    assert response.status_code == 200

    # Old login should fail
    fail_resp = client.post("/api/v1/auth/login", json={
        "email": settings.ADMIN_BOOTSTRAP_EMAIL,
        "password": settings.ADMIN_BOOTSTRAP_PASSWORD
    })
    assert fail_resp.status_code == 401

    # New login should succeed
    succ_resp = client.post("/api/v1/auth/login", json={
        "email": settings.ADMIN_BOOTSTRAP_EMAIL,
        "password": new_pass
    })
    assert succ_resp.status_code == 200

    # Reset back to bootstrap password for other tests
    new_token = succ_resp.json()["token"]
    client.post("/api/v1/auth/password/change", headers={"Authorization": f"Bearer {new_token}"}, json={
        "current_password": new_pass,
        "new_password": settings.ADMIN_BOOTSTRAP_PASSWORD
    })
