import json

from app.services.groq_provider import GroqProvider


async def generate_itinerary(preferences: dict) -> dict:
    """Generate and validate a personalized day-by-day travel itinerary."""

    provider = GroqProvider()

    prompt = f"""
Create a personalized travel itinerary using these preferences:

{json.dumps(preferences, indent=2, default=str)}

Return ONLY a valid JSON object. Do not use Markdown or code fences.

Use exactly this structure:

{{
  "destination": "Destination name",
  "days": [
    {{
      "day": 1,
      "date": "YYYY-MM-DD",
      "morning": {{
        "time": "9:00 AM - 12:00 PM",
        "activity": "Activity name",
        "description": "Short description",
        "notes": "Useful travel tips"
      }},
      "afternoon": {{
        "time": "1:00 PM - 4:00 PM",
        "activity": "Activity name",
        "description": "Short description",
        "notes": "Useful travel tips"
      }},
      "evening": {{
        "time": "5:00 PM - 8:00 PM",
        "activity": "Activity name",
        "description": "Short description",
        "notes": "Useful travel tips"
      }}
    }}
  ]
}}

OPTIMIZATION REQUIREMENTS:
- Include every date from start_date to end_date, inclusive.
- Use the correct date for each day.
- Respect the budget, interests, dietary needs, travel pace, and mobility concerns.
- Group nearby attractions together on the same day to reduce unnecessary travel.
- Arrange activities in a geographically sensible order.
- Consider realistic travel time between activities.
- Include reasonable meal breaks and rest periods.
- Avoid repeating the same attraction or activity.
- Account for arrival and departure times when planning the first and last days.
- Adapt the schedule to the requested travel pace.
- Do not invent verified prices, opening hours, or availability.
- Include all three periods for each day.
- Use double quotes for JSON keys and string values.
- Do not include comments, trailing commas, or text outside the JSON.
"""

    response = await provider.generate(prompt)

    # Remove accidental Markdown code fences.
    response = response.strip()

    if response.startswith("```"):
        lines = response.splitlines()

        if lines and lines[0].startswith("```"):
            lines = lines[1:]

        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]

        response = "\n".join(lines).strip()

    # Check for an empty response.
    if not response:
        raise RuntimeError("Groq returned an empty response.")

    # Parse the generated JSON.
    try:
        itinerary = json.loads(response)
    except json.JSONDecodeError as exc:
        print("Groq response was not valid JSON:")
        print(repr(response[:1000]))

        raise RuntimeError(
            "Groq returned invalid JSON. Check the backend terminal for details."
        ) from exc

    # Validate the overall itinerary structure.
    if not isinstance(itinerary, dict):
        raise RuntimeError(
            "The generated itinerary must be a JSON object."
        )

    if not isinstance(itinerary.get("destination"), str):
        raise RuntimeError(
            "The generated itinerary has an invalid destination."
        )

    days = itinerary.get("days")

    if not isinstance(days, list) or not days:
        raise RuntimeError(
            "The generated itinerary must contain at least one day."
        )

    required_periods = ["morning", "afternoon", "evening"]
    required_fields = ["time", "activity", "description", "notes"]

    # Validate every day and each scheduled activity.
    for index, day in enumerate(days, start=1):
        if not isinstance(day, dict):
            raise RuntimeError(
                f"Day {index} must be a JSON object."
            )

        if day.get("day") != index:
            raise RuntimeError(
                f"Expected day number {index}, "
                f"but received {day.get('day')}."
            )

        if not isinstance(day.get("date"), str) or not day["date"].strip():
            raise RuntimeError(
                f"Day {index} has a missing or invalid date."
            )

        for period in required_periods:
            activity = day.get(period)

            if not isinstance(activity, dict):
                raise RuntimeError(
                    f"Day {index} is missing a valid {period} activity."
                )

            for field in required_fields:
                value = activity.get(field)

                if not isinstance(value, str) or not value.strip():
                    raise RuntimeError(
                        f"Day {index} has a missing or invalid "
                        f"'{field}' field in its {period} activity."
                    )

    # Return the itinerary only after all validation checks pass.
    return itinerary