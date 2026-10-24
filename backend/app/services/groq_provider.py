from groq import AsyncGroq

from app.core.config import GROQ_API_KEY
from app.services.llm_provider import LLMProvider


class GroqProvider(LLMProvider):

    def __init__(self):
        if not GROQ_API_KEY:
            raise RuntimeError(
                "GROQ_API_KEY is missing. Check backend/.env."
            )

        self.client = AsyncGroq(api_key=GROQ_API_KEY)

    async def generate(self, prompt: str) -> str:
        response = await self.client.chat.completions.create(
            model="openai/gpt-oss-20b",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a travel itinerary planner. "
                        "Return only a valid JSON object containing "
                        "destination and days. Follow the user's "
                        "requested structure exactly."
                    ),
                },
                {
                    "role": "user",
                    "content": prompt,
                },
            ],
            temperature=0.1,
            max_completion_tokens=8000,
        )

        choice = response.choices[0]
        content = choice.message.content

        if not content or not content.strip():
            print("Groq finish reason:", choice.finish_reason)
            print("Groq response:", response.model_dump())

            raise RuntimeError(
                "Groq returned an empty response. "
                "Check the backend terminal for finish reason."
            )

        return content.strip()