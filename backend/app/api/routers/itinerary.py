from fastapi import APIRouter, HTTPException, Header, Query

from app.schemas.trips import TripPreferenceRequest
from app.services.prompt_generator import generate_itinerary_prompt
from app.services.ai_service import generate_recommendations
from app.services.itinerary_service import generate_itinerary
from app.core.supabase import supabase

router = APIRouter(
    prefix="/api/itinerary",
    tags=["Itinerary"],
)


@router.post("/prompt")
def generate_prompt(preferences: TripPreferenceRequest):
    preference_data = preferences.model_dump(mode="json")
    prompt = generate_itinerary_prompt(preference_data)

    return {
        "message": "AI prompt generated successfully",
        "destination": preference_data["destination"],
        "prompt": prompt,
    }


@router.post("/recommendations")
def get_recommendations(preferences: TripPreferenceRequest):
    preference_data = preferences.model_dump(mode="json")
    prompt = generate_itinerary_prompt(preference_data)

    try:
        recommendations = generate_recommendations(prompt)

        return {
            "message": "Personalized recommendations generated successfully",
            "destination": preference_data["destination"],
            "recommendations": recommendations,
        }

    except RuntimeError as exc:
        print(f"Recommendation error: {type(exc).__name__}: {exc}")
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    except Exception as exc:
        print(f"Recommendation error: {type(exc).__name__}: {exc}")
        raise HTTPException(
            status_code=502,
            detail="Unable to generate recommendations. Check the backend terminal.",
        ) from exc


@router.post("/generate")
async def create_itinerary(
    preferences: TripPreferenceRequest,
    authorization: str = Header(None),
    trip_id: str | None = Query(default=None),
):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="Authentication required. Please log in.",
        )

    try:
        token = authorization.split(" ", 1)[1]
        user_response = supabase.auth.get_user(token)
        user = user_response.user

        if not user:
            raise HTTPException(
                status_code=401,
                detail="Invalid or expired authentication token.",
            )

        itinerary = await generate_itinerary(
            preferences.model_dump(mode="json")
        )

        saved = False

        if trip_id:
            response = (
                supabase.table("trips")
                .update({"itinerary": itinerary})
                .eq("id", trip_id)
                .eq("user_id", str(user.id))
                .execute()
            )

            if not response.data:
                raise HTTPException(
                    status_code=404,
                    detail="Trip not found or access denied.",
                )

            saved = True

        return {
            "message": (
                "Itinerary generated and saved successfully"
                if saved
                else "Itinerary generated successfully but not saved"
            ),
            "destination": preferences.destination,
            "itinerary": itinerary,
            "trip_id": trip_id,
            "saved": saved,
        }

    except HTTPException:
        raise

    except Exception as exc:
        print(f"Itinerary generation error: {type(exc).__name__}: {exc}")
        raise HTTPException(
            status_code=502,
            detail="Unable to generate or save itinerary. Check the backend terminal.",
        ) from exc