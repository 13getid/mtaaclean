"""
Supabase client initialization for server-side trusted operations.
Uses the service_role key to bypass RLS securely on the backend.
"""

from supabase import create_client, Client
from app.config import settings

_supabase_client: Client | None = None


def get_supabase_admin() -> Client:
    global _supabase_client
    if _supabase_client is None:
        if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_ROLE_KEY:
            raise RuntimeError(
                "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be configured in environment."
            )
        _supabase_client = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_SERVICE_ROLE_KEY,
        )
    return _supabase_client
