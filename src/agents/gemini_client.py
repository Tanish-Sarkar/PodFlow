import os
import time

from google import genai


DEFAULT_MODELS = ("gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash")
RETRYABLE_MARKERS = ("503", "UNAVAILABLE", "high demand", "temporarily")


def generate_text(prompt: str) -> str:
    api_key = os.getenv("GOOGLE_API_KEY", "")
    if not api_key:
        raise ValueError("Missing GOOGLE_API_KEY environment variable.")

    models = _configured_models()
    client = genai.Client(api_key=api_key)
    last_error = None

    for model in models:
        for attempt in range(2):
            try:
                response = client.models.generate_content(
                    model=model,
                    contents=prompt
                )
                return response.text or ""
            except Exception as e:
                last_error = e
                if not _is_retryable(e):
                    raise
                if attempt == 0:
                    time.sleep(1)

    raise RuntimeError(f"Gemini generation failed after retries: {last_error}")


def _configured_models() -> list[str]:
    configured = [
        os.getenv("GEMINI_MODEL", ""),
        os.getenv("GEMINI_FALLBACK_MODEL", "")
    ]
    models = [model.strip() for model in configured if model.strip()]
    models.extend(model for model in DEFAULT_MODELS if model not in models)
    return models


def _is_retryable(error: Exception) -> bool:
    message = str(error)
    return any(marker in message for marker in RETRYABLE_MARKERS)
