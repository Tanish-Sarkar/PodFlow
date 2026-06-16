import os
# pyrefly: ignore [missing-import]
import google.generativeai as genai
from src.state import PipelineState

def newsletter_writer_agent(state: PipelineState) -> PipelineState:
    api_key = os.getenv("GOOGLE_API_KEY", "")
    if not api_key:
        raise ValueError("Missing GOOGLE_API_KEY environment variable.")
    
    genai.configure(api_key=api_key)
    insights = state.get("approved_insights") or state.get("raw_insights", "")

    model = genai.GenerativeModel("gemini-1.5-flash")

    prompt = f"""You are a world-class technology newsletter writer in the style of 'The Hustle' and 'Morning Brew'.
            Convert the provided structured podcast insights into an engaging, magazine-style newsletter edition.

            Formatting Rules:
            - Write an amazing, catchy, click-worthy hook introduction (2-3 sentences).
            - Translate raw insights into cohesive sections with energetic headers paired with emojis.
            - **Bold key technical concepts** inline to improve reading scannability.
            - Keep sentences short, fast-paced, and highly informative.
            - Wrap up with a dedicated section called "💡 Why This Matters" reflecting on the macro-level impact (3-4 sentences).
            - Length constraint: ~400-550 words. Do not output conversational preamble.

            Podcast Insights Source:
            {insights}"""
    
    response = model.generate_content(prompt)
    return {
        **state,
        "newsletter_draft": response.text,
        "current_step": "newsletter_drafted"
    }
