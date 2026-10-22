import json
import time

from google import genai
from google.genai.errors import ServerError

from app.core.config import GEMINI_API_KEY


client = genai.Client(api_key=GEMINI_API_KEY) if GEMINI_API_KEY else None


def generate_recommendations(prompt: str) -> dict:
    """Generate personalized travel recommendations using Gemini."""

    if client is None:
        raise RuntimeError(
            "Gemini API key is missing. Check backend/.env."
        )

    response = None

    for attempt in range(3):
        try:
            response = client.models.generate_content(
                model="gemini-3.6-flash",
                contents=f"""
{prompt}

Generate personalized travel recommendations based on the traveler's
destination, budget, interests, travel style, dietary needs, and mobility
requirements.

Return ONLY valid JSON using this structure:

{{
    "attractions": [
        {{
            "name": "Attraction name",
            "description": "Short description",
            "estimated_cost": 0,
            "reason": "Why this matches the traveler"
        }}
    ],
    "activities": [
        {{
            "name": "Activity name",
            "description": "Short description",
            "estimated_cost": 0,
            "reason": "Why this matches the traveler"
        }}
    ],
    "dining": [
        {{
            "name": "Dining option or local dish",
            "description": "Short description",
            "estimated_cost": 0,
            "reason": "Why this matches the traveler"
        }}
    ],
    "local_experiences": [
        {{
            "name": "Experience name",
            "description": "Short description",
            "estimated_cost": 0,
            "reason": "Why this matches the traveler"
        }}
    ]
}}

Requirements:
- Return recommendations appropriate for the specified destination.
- Prioritize the traveler's interests and travel style.
- Respect the stated budget and dietary requirements.
- Consider mobility concerns.
- Use numeric estimated_cost values, expressed in INR.
- Treat prices as estimates, not verified prices.
- Do not invent specific business details.
- Return valid JSON only, without Markdown code fences.
""",
            )
            break

        except ServerError:
            if attempt == 2:
                raise

            time.sleep(2 ** (attempt + 1))

    response_text = response.text

    if not response_text:
        raise RuntimeError("Gemini returned an empty response.")

    try:
        result = json.loads(response_text)
    except json.JSONDecodeError as exc:
        raise RuntimeError(
            "Gemini returned an invalid JSON response."
        ) from exc

    expected_categories = [
        "attractions",
        "activities",
        "dining",
        "local_experiences",
    ]

    for category in expected_categories:
        if not isinstance(result.get(category), list):
            raise RuntimeError(
                f"Gemini returned an invalid '{category}' category."
            )

    return result
    