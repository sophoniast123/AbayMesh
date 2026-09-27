"""Health and app-level smoke tests."""

from app.main import app


def test_health(client):
    response = client.get("/health")
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "healthy"
    assert body["environment"] == "development"


def test_cors_allows_configured_origin(client):
    response = client.options(
        "/health",
        headers={
            "Origin": "http://localhost:3000",
            "Access-Control-Request-Method": "GET",
        },
    )
    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "http://localhost:3000"


def test_routers_are_mounted_under_api_v1():
    paths = app.openapi()["paths"]
    assert "/api/v1/organizations" in paths
    assert "/api/v1/data-sources" in paths
    assert "/health" in paths
