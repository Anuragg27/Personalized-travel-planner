from fastapi import APIRouter, HTTPException

from app.schemas.trips import TripPreferenceRequest
from app.services.prompt_generator import generate_itinerary_prompt
from app.services.ai_service import generate_recommendations
from app.services.itinerary_service import generate_itinerary


router = APIRouter(
    prefix="/api/itinerary",
    tags=["Itinerary"],
)


@router.post("/prompt")
def generate_prompt(preferences: TripPreferenceRequest):
    """Generate a personalized AI prompt from travel preferences."""

    preference_data = preferences.model_dump(mode="json")
    prompt = generate_itinerary_prompt(preference_data)

    return {
        "message": "AI prompt generated successfully",
        "destination": preference_data["destination"],
        "prompt": prompt,
    }


@router.post("/recommendations")
def get_recommendations(preferences: TripPreferenceRequest):
    """Generate personalized travel recommendations using Gemini."""

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
        print(f"Gemini error: {type(exc).__name__}: {exc}")

        raise HTTPException(
            status_code=502,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        print(f"Gemini error: {type(exc).__name__}: {exc}")

        raise HTTPException(
            status_code=502,
            detail="Unable to generate recommendations. Check the backend terminal.",
        ) from exc


@router.post("/generate")
async def create_itinerary(preferences: TripPreferenceRequest):
    """Generate a personalized day-by-day travel itinerary."""

    preference_data = preferences.model_dump(mode="json")

    try:
        itinerary = await generate_itinerary(preference_data)

        return {
            "message": "Itinerary generated successfully",
            "destination": preference_data["destination"],
            "itinerary": itinerary,
        }

    except RuntimeError as exc:
        print(
            f"Itinerary generation error: "
            f"{type(exc).__name__}: {exc}"
        )

        raise HTTPException(
            status_code=502,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        print(
            f"Itinerary generation error: "
            f"{type(exc).__name__}: {exc}"
        )

        raise HTTPException(
            status_code=502,
            detail="Unable to generate itinerary. Check the backend terminal.",
        ) from exc