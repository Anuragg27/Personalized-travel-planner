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
                        "Return valid JSON only, without Markdown code fences."
                    ),
                },
                {
                    "role": "user",
                    "content": prompt,
                },
            ],
            temperature=0.7,
        )

        content = response.choices[0].message.content

        if not content:
            raise RuntimeError("Groq returned an empty response.")

        return content