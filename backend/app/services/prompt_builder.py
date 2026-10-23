import json


def build_recommendation_prompt(preferences: dict) -> str:
    """Build a structured AI prompt from traveler preferences."""

    traveler_preferences = json.dumps(
        preferences,
        indent=2,
        ensure_ascii=False
    )

    prompt = f"""
You are an expert personalized travel planner.

Your task is to recommend attractions, activities, dining options,
and local experiences based on the traveler's preferences.

TRAVELER PREFERENCES:
{traveler_preferences}

INSTRUCTIONS:
1. Recommend places and activities relevant to the destination.
2. Prioritize the traveler's interests and preferred travel style.
3. Respect the travel budget.
4. Consider dietary needs and mobility requirements.
5. Provide practical recommendations.
6. Estimate costs in Indian Rupees (INR).
7. Treat costs as estimates, not verified prices.
8. Do not invent specific business details.
9. Return only valid JSON in the format requested by the AI service.
"""

    return prompt.strip()
    