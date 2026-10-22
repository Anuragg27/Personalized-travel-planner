import os

from dotenv import load_dotenv

load_dotenv()

API_TITLE = "Personalized Travel Itinerary Planner API"
FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")