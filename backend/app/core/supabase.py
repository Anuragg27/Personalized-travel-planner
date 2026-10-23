from supabase import create_client

from app.core.config import (
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY,
)


def get_client():
    """Create a regular Supabase client."""
    return create_client(
        SUPABASE_URL,
        SUPABASE_ANON_KEY,
    )


def get_service_client():
    """Create a privileged Supabase client."""
    return create_client(
        SUPABASE_URL,
        SUPABASE_SERVICE_ROLE_KEY,
    )


# Preserve compatibility with existing imports.
supabase = get_service_client()