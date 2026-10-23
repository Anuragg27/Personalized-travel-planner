import json


def build_recommendation_prompt(preferences: dict) -> str:
    """Build a structured AI prompt from traveler preferences."""

    traveler_preferences = json.dumps(
        preferences,
        indent=2,
        ensure_ascii=False
    )

    vibe = preferences.get("vibe", "balanced")

    vibe_instructions = {
        "relaxed": """
- Prefer a slow-paced itinerary with sufficient rest.
- Include scenic locations, cafes, nature, and relaxing experiences.
- Avoid scheduling too many activities in one day.
- Allow flexible time between activities.
""",
        "adventure": """
- Prioritize adventure activities, outdoor exploration, and exciting experiences.
- Include trekking, hiking, water sports, or similar activities where appropriate.
- Consider safety, fitness requirements, and seasonal availability.
- Balance challenging activities with sufficient recovery time.
""",
        "luxury": """
- Prioritize premium experiences, upscale dining, and comfortable transportation.
- Recommend high-quality experiences suited to the traveler's budget.
- Include exclusive experiences where appropriate.
- Do not exceed the traveler's stated budget.
""",
        "budget": """
- Prioritize affordable attractions, local food, and economical transportation.
- Suggest free or low-cost activities whenever appropriate.
- Avoid unnecessarily expensive experiences.
- Keep the estimated total cost within the traveler's budget.
""",
        "balanced": """
- Create a balanced mix of sightseeing, food, relaxation, and local experiences.
- Maintain a reasonable daily schedule.
- Balance cost, comfort, and variety.
"""
    }

    selected_vibe_instructions = vibe_instructions.get(
        str(vibe).lower(),
        vibe_instructions["balanced"]
    )

    prompt = f"""
You are an expert personalized travel planner.

Your task is to recommend attractions, activities, dining options,
and local experiences based on the traveler's preferences.

TRAVELER PREFERENCES:
{traveler_preferences}

SELECTED TRAVEL VIBE:
{vibe}

VIBE-SPECIFIC INSTRUCTIONS:
{selected_vibe_instructions}

GENERAL INSTRUCTIONS:
1. Recommend places and activities relevant to the destination.
2. Prioritize the traveler's interests and selected travel vibe.
3. Respect the travel budget.
4. Consider dietary needs and mobility requirements.
5. Provide practical recommendations.
6. Estimate costs in Indian Rupees (INR).
7. Treat costs as estimates, not verified prices.
8. Do not invent specific business details.
9. Avoid unrealistic travel schedules and account for travel time.
10. Return only valid JSON in the format requested by the AI service.
"""

    return prompt.strip()
