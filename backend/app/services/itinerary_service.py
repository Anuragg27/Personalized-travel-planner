import json

from app.services.groq_provider import GroqProvider


async def generate_itinerary(preferences: dict) -> dict:
    """Generate a personalized day-by-day travel itinerary."""

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

Requirements:
- Include every date from start_date to end_date, inclusive.
- Use the correct date for each day.
- Respect the budget, interests, dietary needs, and travel pace.
- Keep activities realistic.
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

    if not response:
        raise RuntimeError("Groq returned an empty response.")

    try:
        itinerary = json.loads(response)
    except json.JSONDecodeError as exc:
        print("Groq response was not valid JSON:")
        print(repr(response[:1000]))

        raise RuntimeError(
            "Groq returned invalid JSON. Check the backend terminal for details."
        ) from exc

    if not isinstance(itinerary, dict):
        raise RuntimeError("The generated itinerary must be a JSON object.")

    if not isinstance(itinerary.get("days"), list):
        raise RuntimeError("The generated itinerary has an invalid format.")

    return itinerary