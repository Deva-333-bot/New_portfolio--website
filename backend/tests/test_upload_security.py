def test_media_upload_rejects_svg(client, auth_headers):
    response = client.post(
        "/api/v1/admin/media",
        headers=auth_headers,
        files={"file": ("payload.svg", b"<svg xmlns='http://www.w3.org/2000/svg'></svg>", "image/svg+xml")},
    )
    assert response.status_code == 400


def test_media_upload_rejects_fake_png(client, auth_headers):
    response = client.post(
        "/api/v1/admin/media",
        headers=auth_headers,
        files={"file": ("payload.png", b"not actually a PNG", "image/png")},
    )
    assert response.status_code == 400


def test_cv_upload_rejects_non_pdf_content(client, auth_headers):
    response = client.post(
        "/api/v1/admin/cv",
        headers=auth_headers,
        files={"file": ("resume.pdf", b"not actually a PDF", "application/pdf")},
    )
    assert response.status_code == 400
