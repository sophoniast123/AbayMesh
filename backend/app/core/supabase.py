"""Reusable Supabase client (service role) for server-side data access.

The backend is the ONLY component allowed to talk to Supabase; credentials
never reach the frontend bundle (PRD security requirement).

Usage::

    from app.core.supabase import get_supabase_client, supabase

    rows = get_supabase_client().table("inventory_records").select("*").execute()
    # or via the lazy proxy:
    rows = supabase.table("inventory_records").select("*").execute()
"""

from functools import lru_cache
from typing import Any

from supabase import Client, create_client

from app.core.config import settings

#: Value prefixes used in ``.env.example`` templates — never valid
#: credentials. Prefix-only so real base64/JWT keys can never match mid-string.
_PLACEHOLDER_PREFIXES = ("your", "changeme", "example", "<", "xxx")


def _is_placeholder(value: str) -> bool:
    """Return True when a credential is still an unset template value."""
    cleaned = value.strip().lower()
    if "://" in cleaned:
        cleaned = cleaned.split("://", 1)[1]
    return cleaned.startswith(_PLACEHOLDER_PREFIXES)


def _normalize_supabase_url(url: str) -> str:
    """Reduce a pasted Supabase URL to the bare project URL.

    The Supabase dashboard shows several URLs per project (REST endpoint,
    storage, auth...). supabase-py expects only the project root
    (``https://<ref>.supabase.co``) and appends ``/rest/v1`` itself, so a
    pasted ``.../rest/v1/`` endpoint must be stripped or every request
    double-stacks the path and PostgREST answers
    "Invalid path specified in request URL".
    """
    cleaned = url.strip().rstrip("/")
    for suffix in ("/rest/v1", "/rest/v1/", "/rest", "/auth/v1", "/storage/v1"):
        if cleaned.endswith(suffix):
            cleaned = cleaned[: -len(suffix)]
    return cleaned.rstrip("/")


@lru_cache(maxsize=1)
def get_supabase_client() -> Client:
    """Return the cached service-role Supabase client singleton.

    Created lazily on first use so that importing the application does not
    fail when Supabase credentials are not yet configured (e.g. in tests
    or fresh checkouts without a `.env` file).
    """
    if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_ROLE_KEY:
        raise RuntimeError(
            "Supabase is not configured. Set SUPABASE_URL and "
            "SUPABASE_SERVICE_ROLE_KEY in backend/.env (see backend/.env.example)."
        )
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)
    normalized_url = _normalize_supabase_url(url)
    if _is_placeholder(normalized_url) or _is_placeholder(key):
        raise RuntimeError(
            "Supabase credentials are still placeholders. Copy your project "
            "values from the Supabase dashboard (Project Settings -> API) "
            "into backend/.env and restart the server."
        )
    return create_client(normalized_url, key)


class _LazySupabaseClient:
    """Import-safe proxy that forwards attribute access to the real client.

    The underlying `Client` is created on first attribute access, keeping
    module imports cheap and offline-safe.
    """

    def __getattr__(self, name: str) -> Any:
        return getattr(get_supabase_client(), name)


#: Module-level lazy client instance: `from app.core.supabase import supabase`
supabase = _LazySupabaseClient()
