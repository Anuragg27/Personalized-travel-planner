from uuid import UUID

from fastapi import APIRouter, HTTPException, Header, status

from app.schemas.trips import TripPreferenceRequest, TripUpdateRequest
from app.core.supabase import supabase

router = APIRouter(prefix="/api/trips", tags=["Trips"])


def get_authenticated_user(authorization: str | None):
    """Verify the access token and return the authenticated user."""

    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please log in.",
        )

    token = authorization.split(" ", 1)[1]

    try:
        user_response = supabase.auth.get_user(token)
        user = user_response.user
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token.",
        ) from exc

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token.",
        )

    return user


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_trip(
    preferences: TripPreferenceRequest,
    authorization: str | None = Header(default=None),
):
    user = get_authenticated_user(authorization)

    try:
        trip_data = preferences.model_dump(mode="json")

        database_data = {
            "user_id": str(user.id),
            "origin": trip_data["origin"],
            "destination": trip_data["destination"],
            "start_date": trip_data["start_date"],
            "end_date": trip_data["end_date"],
            "budget": trip_data["budget"],
        }

        response = (
            supabase.table("trips")
            .insert(database_data)
            .execute()
        )

        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Trip was not saved.",
            )

        return {
            "message": "Travel preferences saved successfully",
            "trip": response.data[0],
            "preferences": trip_data,
        }

    except HTTPException:
        raise

    except Exception as exc:
        print(f"Create trip error: {type(exc).__name__}: {exc}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save trip preferences.",
        ) from exc


@router.get("/")
def get_my_trips(
    authorization: str | None = Header(default=None),
):
    """Return all trips belonging to the authenticated user."""

    user = get_authenticated_user(authorization)

    try:
        response = (
            supabase.table("trips")
            .select("*")
            .eq("user_id", str(user.id))
            .order("start_date")
            .execute()
        )

        return {
            "trips": response.data or [],
            "count": len(response.data or []),
        }

    except Exception as exc:
        print(f"Fetch trips error: {type(exc).__name__}: {exc}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve your trips.",
        ) from exc


@router.get("/{trip_id}")
def get_trip_by_id(
    trip_id: UUID,
    authorization: str | None = Header(default=None),
):
    """Return one saved trip and its itinerary."""

    user = get_authenticated_user(authorization)

    try:
        response = (
            supabase.table("trips")
            .select("*")
            .eq("id", str(trip_id))
            .eq("user_id", str(user.id))
            .limit(1)
            .execute()
        )

        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Trip not found.",
            )

        return {"trip": response.data[0]}

    except HTTPException:
        raise

    except Exception as exc:
        print(f"Fetch trip error: {type(exc).__name__}: {exc}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve the trip.",
        ) from exc

@router.patch("/{trip_id}")
def update_trip(
    trip_id: UUID,
    updates: TripUpdateRequest,
    authorization: str | None = Header(default=None),
):
    """Update a saved trip belonging to the authenticated user."""

    user = get_authenticated_user(authorization)

    try:
        update_data = updates.model_dump(
            mode="json",
            exclude={"travelers"},
        )

        response = (
            supabase.table("trips")
            .update(update_data)
            .eq("id", str(trip_id))
            .eq("user_id", str(user.id))
            .execute()
        )

        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Trip not found or could not be updated.",
            )

        return {
            "message": "Trip updated successfully.",
            "trip": response.data[0],
        }

    except HTTPException:
        raise

    except Exception as exc:
        print(f"Update trip error: {type(exc).__name__}: {exc}")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update trip.",
        ) from exc       