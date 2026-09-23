"""Tests for the organizations endpoints."""


def test_create_organization_auto_generates_slug(client):
    response = client.post(
        "/api/v1/organizations",
        json={"name": "Gebeta Manufacturing & Co!"},
    )
    assert response.status_code == 201
    body = response.json()
    assert body["name"] == "Gebeta Manufacturing & Co!"
    assert body["slug"] == "gebeta-manufacturing-co"
    assert body["id"]
    assert body["created_at"]
    assert body["updated_at"]


def test_create_organization_with_explicit_slug(client):
    response = client.post(
        "/api/v1/organizations",
        json={"name": "Supplier B", "slug": "supplier-b"},
    )
    assert response.status_code == 201
    assert response.json()["slug"] == "supplier-b"


def test_create_organization_conflicting_slug_returns_409(client):
    client.post("/api/v1/organizations", json={"name": "Alpha", "slug": "alpha"})
    response = client.post("/api/v1/organizations", json={"name": "Alpha Two", "slug": "alpha"})
    assert response.status_code == 409


def test_create_organization_rejects_blank_name(client):
    response = client.post("/api/v1/organizations", json={"name": ""})
    assert response.status_code == 422


def test_list_organizations_orders_newest_first(client):
    client.post("/api/v1/organizations", json={"name": "First Org"})
    client.post("/api/v1/organizations", json={"name": "Second Org"})

    response = client.get("/api/v1/organizations")
    assert response.status_code == 200
    names = [org["name"] for org in response.json()]
    assert names == ["Second Org", "First Org"]
