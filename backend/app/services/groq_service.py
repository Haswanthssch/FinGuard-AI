import httpx

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)


class GroqService:
    def __init__(self) -> None:
        self.model = settings.GROQ_MODEL
        self.base_url = "https://api.groq.com/openai/v1/chat/completions"

    async def complete(
        self,
        system_prompt: str,
        user_prompt: str,
        temperature: float = 0.25,
        max_tokens: int = 1200,
    ) -> str:
        if not settings.GROQ_API_KEY:
            raise RuntimeError("GROQ_API_KEY is not configured")

        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            "temperature": temperature,
            "max_tokens": max_tokens,
        }
        headers = {
            "Authorization": f"Bearer {settings.GROQ_API_KEY}",
            "Content-Type": "application/json",
        }

        async with httpx.AsyncClient(timeout=settings.GROQ_TIMEOUT_SECONDS) as client:
            response = await client.post(self.base_url, json=payload, headers=headers)
            response.raise_for_status()
            data = response.json()
            return data["choices"][0]["message"]["content"]

    async def complete_or_fallback(
        self,
        system_prompt: str,
        user_prompt: str,
        fallback: str,
        temperature: float = 0.25,
        max_tokens: int = 1200,
    ) -> tuple[str, str]:
        try:
            return await self.complete(system_prompt, user_prompt, temperature, max_tokens), "groq"
        except Exception as exc:
            logger.warning("groq_completion_failed fallback=deterministic error=%s", exc)
            return fallback, "deterministic"


groq_service = GroqService()

