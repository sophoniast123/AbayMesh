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


class _LazySupabaseClient:
    """Import-safe proxy that forwards attribute access to the real client.

    The underlying `Client` is created on first attribute access, keeping
    module imports cheap and offline-safe.
    """

    def __getattr__(self, name: str) -> Any:
        return getattr(get_supabase_client(), name)


#: Module-level lazy client instance: `from app.core.supabase import supabase`
supabase = _LazySupabaseClient()
