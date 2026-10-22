from app.services.prompt_generator import generate_itinerary_prompt


preferences = {
    "destination": "Manali",
    "start_date": "2026-12-10",
    "end_date": "2026-12-15",
    "budget": 20000,
    "travelers": 2,
    "interests": ["Mountains", "Trekking", "Sightseeing"],
    "dietary_needs": "Vegetarian",
    "travel_pace": "moderate",
}

prompt = generate_itinerary_prompt(preferences)

print("\n========== GENERATED AI PROMPT ==========\n")
print(prompt)
print("\n========== TEST COMPLETED ==========\n")