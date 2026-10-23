import json

from app.services.groq_provider import GroqProvider


async def generate_itinerary(preferences: dict) -> dict:
    """Generate and validate a personalized day-by-day travel itinerary."""

    provider = GroqProvider()

    prompt = f"""
Create a personalized travel itinerary using these preferences:
{json.dumps(preferences, separators=(",", ":"), default=str)}

Return ONLY valid JSON using this structure:
{{
  "destination": "Destination name",
  "days": [
    {{
      "day": 1,
      "date": "YYYY-MM-DD",
      "morning": {{
        "time": "9 AM - 12 PM",
        "activity": "Activity name",
        "description": "Brief description",
        "notes": "Useful tip"
      }},
      "afternoon": {{
        "time": "1 PM - 4 PM",
        "activity": "Activity name",
        "description": "Brief description",
        "notes": "Useful tip"
      }},
      "evening": {{
        "time": "5 PM - 8 PM",
        "activity": "Activity name",
        "description": "Brief description",
        "notes": "Useful tip"
      }}
    }}
  ]
}}

Rules:
- Include every date from start_date to end_date, inclusive.
- Use correct dates and sequential day numbers.
- Respect budget, interests, dietary needs, travel pace, and mobility needs.
- Group nearby attractions and allow realistic travel time.
- Include meal breaks and rest.
- Avoid repeating activities.
- Adapt the first and last days to arrival and departure.
- Do not invent verified prices or opening hours.
- Include all three periods every day.
- Keep descriptions and notes brief to reduce output size.
- Return complete, valid JSON only. No Markdown or extra text.
"""

    response = await provider.generate(prompt)
    response = response.strip()

    # Remove accidental Markdown code fences.
    if response.startswith("```"):
        lines = response.splitlines()

        if lines and lines[0].startswith("```"):
            lines = lines[1:]

        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]

        response = "\n".join(lines).strip()

    if not response:
        raise RuntimeError("Groq returned an empty response.")

    # Parse generated JSON.
    try:
        itinerary = json.loads(response)
    except json.JSONDecodeError as exc:
        print("Groq response was not valid JSON:")
        print(repr(response[:1000]))

        raise RuntimeError(
            "Groq returned invalid JSON. Check the backend terminal for details."
        ) from exc

    # Validate the itinerary structure.
    if not isinstance(itinerary, dict):
        raise RuntimeError("The generated itinerary must be a JSON object.")

    if not isinstance(itinerary.get("destination"), str):
        raise RuntimeError("The generated itinerary has an invalid destination.")

    days = itinerary.get("days")

    if not isinstance(days, list) or not days:
        raise RuntimeError(
            "The generated itinerary must contain at least one day."
        )

    required_periods = ["morning", "afternoon", "evening"]
    required_fields = ["time", "activity", "description", "notes"]

    for index, day in enumerate(days, start=1):
        if not isinstance(day, dict):
            raise RuntimeError(f"Day {index} must be a JSON object.")

        if day.get("day") != index:
            raise RuntimeError(
                f"Expected day number {index}, but received {day.get('day')}."
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

    return itinerary