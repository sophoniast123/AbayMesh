"""Shared pytest fixtures: an offline fake Supabase backend + TestClient."""

from datetime import datetime, timezone
from typing import Any
from unittest.mock import patch
from uuid import UUID, uuid4

import pytest
from fastapi.testclient import TestClient
from postgrest.exceptions import APIError

from app.main import app


class APIErrorFactory:
    """Build postgrest APIError instances the way the real client does."""

    @staticmethod
    def unique_violation(detail: str = "duplicate key") -> APIError:
        return APIError(
            {
                "message": "duplicate key value violates unique constraint",
                "code": "23505",
                "details": detail,
                "hint": None,
            }
        )

    @staticmethod
    def foreign_key_violation(detail: str = "key not present") -> APIError:
        return APIError(
            {
                "message": "insert or update on table violates foreign key constraint",
                "code": "23503",
                "details": detail,
                "hint": None,
            }
        )

    @staticmethod
    def check_violation(detail: str = "new row violates check constraint") -> APIError:
        return APIError(
            {
                "message": "new row for relation violates check constraint",
                "code": "23514",
                "details": detail,
                "hint": None,
            }
        )

    @staticmethod
    def server_error(detail: str = "connection refused") -> APIError:
        return APIError(
            {
                "message": "Database operation failed",
                "code": None,
                "details": detail,
                "hint": None,
            }
        )


class FakeTable:
    """Minimal postgrest query-builder stand-in over an in-memory list.

    Supports the subset used by the API layer: select, insert, order,
    limit, eq, execute.
    """

    def __init__(self, store: "FakeSupabase", name: str) -> None:
        self._store = store
        self._name = name
        self._select_columns = "*"
        self._inserting: list[dict[str, Any]] = []
        self._order_column: str | None = None
        self._order_desc = False
        self._limit_value: int | None = None
        self._filters: list[tuple[str, str, Any]] = []

    # -- builder methods ---------------------------------------------------
    def select(self, columns: str = "*") -> "FakeTable":
        self._select_columns = columns
        return self

    def insert(self, row: dict[str, Any]) -> "FakeTable":
        self._inserting = [dict(row)]
        return self

    def order(self, column: str, desc: bool = False) -> "FakeTable":
        self._order_column = column
        self._order_desc = desc
        return self

    def limit(self, count: int) -> "FakeTable":
        self._limit_value = count
        return self

    def eq(self, column: str, value: Any) -> "FakeTable":
        self._filters.append((column, "eq", value))
        return self

    # -- execution ----------------------------------------------------------
    def _matches(self, row: dict[str, Any]) -> bool:
        for column, op, value in self._filters:
            if op == "eq" and str(row.get(column)) != str(value):
                return False
        return True

    def execute(self) -> Any:
        rows = self._store.rows[self._name]
        if self._inserting:
            for payload in self._inserting:
                self._store.check_constraints(self._name, payload)
                rows.append(self._store.finalize_row(self._name, payload))
            data = [dict(r) for r in rows[-len(self._inserting) :]]
        else:
            data = [dict(r) for r in rows if self._matches(r)]
            if self._order_column:
                data.sort(
                    key=lambda r: str(r.get(self._order_column) or ""),
                    reverse=self._order_desc,
                )
            if self._limit_value is not None:
                data = data[: self._limit_value]
        return self._store.Response(data=data)


class FakeSupabase:
    """In-memory Supabase client enforcing the NOT NULL / UNIQUE / CHECK rules
    declared in migrations/001_initial_schema.sql for the tables under test."""

    class Response:
        def __init__(self, data: list[dict[str, Any]]) -> None:
            self.data = data

    def __init__(self) -> None:
        self.rows: dict[str, list[dict[str, Any]]] = {
            "organizations": [],
            "data_sources": [],
        }

    # -- constraint enforcement --------------------------------------------
    @staticmethod
    def _raise_code(code: str, message: str, details: str) -> None:
        raise APIError({"message": message, "code": code, "details": details, "hint": None})

    def check_constraints(self, table_name: str, payload: dict[str, Any]) -> None:
        now = datetime.now(timezone.utc).isoformat()
        row = {**payload, "created_at": payload.get("created_at", now)}

        required = {
            "organizations": ["name", "slug"],
            "data_sources": ["organization_id", "name", "source_type"],
        }
        for column in required.get(table_name, []):
            if row.get(column) in (None, ""):
                self._raise_code(
                    "23502", f"null value in column {column!r} violates not-null constraint", table_name
                )

        if table_name == "organizations":
            if any(r["slug"] == row["slug"] for r in self.rows[table_name]):
                self._raise_code(
                    "23505",
                    "duplicate key value violates unique constraint 'organizations_slug_key'",
                    f"Key (slug)=({row['slug']}) already exists.",
                )
        elif table_name == "data_sources":
            if not any(r["id"] == row["organization_id"] for r in self.rows["organizations"]):
                self._raise_code(
                    "23503",
                    "insert or update on table 'data_sources' violates foreign key constraint",
                    f"Key (organization_id)=({row['organization_id']}) is not present in table 'organizations'.",
                )
            if row["source_type"] not in ("csv", "excel", "rest"):
                self._raise_code(
                    "23514",
                    "new row for relation 'data_sources' violates check constraint",
                    f"source_type={row['source_type']}",
                )

    @staticmethod
    def finalize_row(table_name: str, payload: dict[str, Any]) -> dict[str, Any]:
        now = datetime.now(timezone.utc).isoformat()
        row = {**payload, "id": payload.get("id", str(uuid4())), "created_at": payload.get("created_at", now)}
        if table_name == "organizations":
            row.setdefault("updated_at", now)
        elif table_name == "data_sources":
            row.setdefault("schema_fingerprint", {})
        return row

    # -- client surface ------------------------------------------------------
    def table(self, name: str) -> FakeTable:
        return FakeTable(self, name)


@pytest.fixture()
def fake_supabase() -> FakeSupabase:
    return FakeSupabase()


@pytest.fixture()
def client(fake_supabase: FakeSupabase) -> TestClient:
    """TestClient with the Supabase dependency replaced by the fake backend.

    get_supabase_client is lru_cached, so it is bypassed directly and both
    access paths (get_supabase_client / _LazySupabaseClient) are patched.
    """
    with (
        patch("app.api.deps.get_supabase_client", return_value=fake_supabase),
        patch("app.core.supabase.get_supabase_client", return_value=fake_supabase),
    ):
        with TestClient(app) as test_client:
            yield test_client
