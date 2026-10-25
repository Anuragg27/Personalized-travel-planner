import hashlib
import secrets
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr

from app.core.supabase import get_service_client

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


class SignupSessionRequest(BaseModel):
    email: EmailStr


class SignupSessionResponse(BaseModel):
    token: str
    expires_at: str


@router.post("/signup-session", response_model=SignupSessionResponse)
def create_signup_session(payload: SignupSessionRequest):
    token = secrets.token_urlsafe(32)
    token_hash = hashlib.sha256(token.encode()).hexdigest()
    expires_at = datetime.now(timezone.utc).replace(microsecond=0)

    try:
        client = get_service_client()
        result = client.table("signup_confirmation_sessions").insert({
            "token_hash": token_hash,
            "email": payload.email.strip().lower(),
        }).execute()

        row = result.data[0]
        return {
            "token": token,
            "expires_at": row["expires_at"],
        }
    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Could not start confirmation tracking.",
        )


@router.get("/confirmation-status")
def confirmation_status(token: str):
    token_hash = hashlib.sha256(token.encode()).hexdigest()

    try:
        client = get_service_client()
        result = (
            client.table("signup_confirmation_sessions")
            .select("email, expires_at")
            .eq("token_hash", token_hash)
            .limit(1)
            .execute()
        )

        if not result.data:
            raise HTTPException(status_code=404, detail="Session not found.")

        session = result.data[0]
        expires_at = datetime.fromisoformat(
            session["expires_at"].replace("Z", "+00:00")
        )

        if expires_at <= datetime.now(timezone.utc):
            raise HTTPException(status_code=410, detail="Session expired.")

        users = client.auth.admin.list_users()
        user = next(
            (
                item for item in users
                if item.email
                and item.email.lower() == session["email"].lower()
            ),
            None,
        )

        confirmed = bool(user and user.email_confirmed_at)

        if confirmed:
            client.table("signup_confirmation_sessions").delete().eq(
                "token_hash", token_hash
            ).execute()

        return {"confirmed": confirmed}

    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Unable to check confirmation status.",
        )