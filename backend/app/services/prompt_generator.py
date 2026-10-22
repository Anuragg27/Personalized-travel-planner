from typing import Any


def generate_itinerary_prompt(preferences: dict[str, Any]) -> str:
    """Generate a personalized AI travel itinerary prompt."""

    origin = preferences.get("origin", "Not specified")
    destination = preferences.get("destination", "Not specified")
    start_date = preferences.get("start_date", "Not specified")
    end_date = preferences.get("end_date", "Not specified")
    budget = preferences.get("budget", "Not specified")
    travelers = preferences.get("travelers", "Not specified")
    interests = preferences.get("interests", [])
    dietary_needs = preferences.get("dietary_needs", "No restrictions")
    travel_pace = preferences.get("travel_pace", "moderate")
    travel_style = preferences.get("travel_style", "Not specified")
    mobility_concerns = preferences.get(
        "mobility_concerns",
        "None specified",
    )

    if isinstance(interests, list):
        interests = ", ".join(str(item) for item in interests)

    pace_instructions = {
        "relaxed": (
            "Plan fewer activities each day, with ample breaks "
            "and sufficient free time."
        ),
        "moderate": (
            "Maintain a balanced schedule with sightseeing, "
            "meal breaks, and realistic travel times."
        ),
        "fast": (
            "Include more attractions each day while keeping "
            "the schedule realistic."
        ),
    }

    pace_instruction = pace_instructions.get(
        str(travel_pace).lower(),
        pace_instructions["moderate"],
    )

    prompt = f"""
You are an experienced travel planner specializing in
personalized, practical, and budget-conscious itineraries.

Create a personalized travel itinerary using the following
travel preferences.

TRIP DETAILS

* Starting location: {origin}
* Destination: {destination}
* Departure date: {start_date}
* Return date: {end_date}
* Total trip budget: ₹{budget}
* Number of travelers: {travelers}
* Travel style: {travel_style}
* Interests: {interests}
* Dietary requirements: {dietary_needs}
* Preferred travel pace: {travel_pace}
* Mobility concerns: {mobility_concerns}

JOURNEY PLANNING INSTRUCTIONS

* Plan the journey from {origin} to {destination}.
* Recommend suitable transportation options from the starting
  location to the destination.
* Consider trains, buses, flights, or road travel where appropriate.
* Include estimated transportation costs in the overall budget.
* Consider the return journey from {destination} to {origin}.
* Do not invent specific departure times, ticket availability,
  or confirmed transportation prices.
* Clearly label transportation costs as estimates when they
  have not been verified.
* If the starting location is not specified, state that
  transportation planning requires the starting location.

PERSONALIZATION INSTRUCTIONS

* {pace_instruction}
* Prioritize activities matching the traveler's interests.
* Respect dietary requirements when recommending meals.
* Consider mobility concerns when selecting activities,
  routes, and transportation.
* Keep estimated expenses within the stated budget where possible.
* Account for accommodation, local transportation, meals,
  activities, and intercity transportation in the budget.
* Consider realistic travel times between attractions.
* Avoid scheduling more activities than can reasonably fit into a day.
* Do not invent prices, opening hours, or availability.
* Clearly identify estimates and details requiring verification.
* Schedule activities only within the specified trip dates.
* State assumptions when information is missing.
* Adapt recommendations to the destination and travel dates.

OUTPUT FORMAT

Organize the itinerary by day.

For each day, include:

1. Date and daily theme.
2. Morning activities.
3. Afternoon activities.
4. Evening activities.
5. Suggested meals that respect dietary requirements.
6. Estimated daily expenses in INR.
7. Transportation recommendations.
8. Practical travel tips.

Also account for the journey from the starting location to
the destination on the appropriate travel day.

At the end, provide:

* Recommended transportation from {origin} to {destination}.
* Recommended return transportation to {origin}.
* Estimated round-trip transportation cost.
* Estimated total trip cost.
* Budget breakdown in INR.
* Recommended packing list.
* Important details to verify before traveling.

Return a clear, practical, personalized itinerary.
Use INR for estimated costs.
Do not claim that prices or availability are verified unless
they have actually been verified.
"""

    return prompt.strip()