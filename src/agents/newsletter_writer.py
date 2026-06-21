from src.agents.gemini_client import generate_text
from src.state import PipelineState

def newsletter_writer_agent(state: PipelineState) -> PipelineState:
    insights = state.get("approved_insights") or state.get("raw_insights", "")

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
    
    return {
        **state,
        "newsletter_draft": generate_text(prompt),
        "current_step": "newsletter_drafted"
    }
