from fastapi import APIRouter, HTTPException, Header, status

from app.schemas.trips import TripPreferenceRequest
from app.core.supabase import supabase

router = APIRouter(prefix="/api/trips", tags=["Trips"])


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_trip(
    preferences: TripPreferenceRequest,
    authorization: str = Header(None),
):
    try:
        # 1. Require an authentication token.
        if not authorization or not authorization.startswith("Bearer "):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication required. Please log in.",
            )

        token = authorization.split(" ", 1)[1]

        # 2. Verify the token and identify the logged-in user.
        user_response = supabase.auth.get_user(token)
        user = user_response.user

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired authentication token.",
            )

        # 3. Get the submitted preferences.
        trip_data = preferences.model_dump(mode="json")

        # 4. Prepare the trip data for Supabase.
        database_data = {
            "user_id": str(user.id),
            "origin": trip_data["origin"],
            "destination": trip_data["destination"],
            "start_date": trip_data["start_date"],
            "end_date": trip_data["end_date"],
            "budget": trip_data["budget"],
        }

        # 5. Save the trip in Supabase.
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

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save trip preferences: {str(e)}",
        )