"""Tests for the data source endpoints."""


def _create_org(client, name: str, slug: str | None = None) -> str:
    payload = {"name": name}
    if slug:
        payload["slug"] = slug
    response = client.post("/api/v1/organizations", json=payload)
    assert response.status_code == 201
    return response.json()["id"]


def test_create_data_source_returns_persisted_row(client):
    org_id = _create_org(client, "Gebeta Manufacturing")
    response = client.post(
        "/api/v1/data-sources",
        json={
            "organization_id": org_id,
            "name": "Supplier A Inventory Sheet",
            "source_type": "excel",
        },
    )
    assert response.status_code == 201
    body = response.json()
    assert body["organization_id"] == org_id
    assert body["name"] == "Supplier A Inventory Sheet"
    assert body["source_type"] == "excel"
    assert body["schema_fingerprint"] == {}
    assert body["created_at"]


def test_create_data_source_unknown_org_returns_404(client):
    from uuid import uuid4

    response = client.post(
        "/api/v1/data-sources",
        json={
            "organization_id": str(uuid4()),
            "name": "Orphan Source",
            "source_type": "csv",
        },
    )
    assert response.status_code == 404
    assert "does not exist" in response.json()["detail"]


def test_create_data_source_rejects_invalid_source_type(client):
    org_id = _create_org(client, "Gebeta Manufacturing")
    response = client.post(
        "/api/v1/data-sources",
        json={"organization_id": org_id, "name": "Bad Source", "source_type": "pdf"},
    )
    assert response.status_code == 422


def test_create_data_source_rejects_malformed_uuid(client):
    response = client.post(
        "/api/v1/data-sources",
        json={"organization_id": "not-a-uuid", "name": "X", "source_type": "csv"},
    )
    assert response.status_code == 422


def test_list_data_sources_returns_all(client):
    org_id = _create_org(client, "Gebeta Manufacturing")
    for name, source_type in [
        ("CSV Feed", "csv"),
        ("Excel Sheet", "excel"),
        ("REST Endpoint", "rest"),
    ]:
        response = client.post(
            "/api/v1/data-sources",
            json={"organization_id": org_id, "name": name, "source_type": source_type},
        )
        assert response.status_code == 201

    response = client.get("/api/v1/data-sources")
    assert response.status_code == 200
    assert len(response.json()) == 3


def test_list_data_sources_filters_by_organization(client):
    org_a = _create_org(client, "Org A")
    org_b = _create_org(client, "Org B")
    client.post(
        "/api/v1/data-sources",
        json={"organization_id": org_a, "name": "A Source", "source_type": "csv"},
    )
    client.post(
        "/api/v1/data-sources",
        json={"organization_id": org_b, "name": "B Source", "source_type": "rest"},
    )

    filtered = client.get(f"/api/v1/data-sources?organization_id={org_a}")
    assert filtered.status_code == 200
    names = [source["name"] for source in filtered.json()]
    assert names == ["A Source"]
