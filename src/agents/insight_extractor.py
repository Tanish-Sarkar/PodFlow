import os
# pyrefly: ignore [missing-import]
import google.generativeai as genai
from src.state import PipelineState

def insight_extractor_agent(state: PipelineState) -> PipelineState:
    api_key = os.getenv("GOOGLE_API_KEY", "")
    if not api_key:
        raise ValueError("Missing GOOGLE_API_KEY environment variable.")
        
    genai.configure(api_key=api_key)

    raw_transcript = state.get("transcript", "")
    truncated_transcript = raw_transcript[:25000] # Clean optimization threshold

    model = genai.GenerativeModel("gemini-2.5-flash")

    prompt = f"""You are an elite podcast analyst.
            Given the transcript below, extract the most critical insights and output them using structured Markdown.

            Format exactly with these headers:

            **🎯 Core Theme**
            [1-2 sentence core value thesis of this episode]

            **💡 Key Insights**
            - [Insight 1 with bold technical details]
            - [Insight 2 with context]
            - [Insight 3]
            - [Insight 4]
            - [Insight 5]

            **📣 Standout Quotes**
            - "[Quote 1 from speaker]"
            - "[Quote 2 from speaker]"

            **🔑 Actionable Takeaways**
            1. [Practical takeaway 1 with direct execution advice]
            2. [Practical takeaway 2]
            3. [Practical takeaway 3]

            **🧵 One-line Twitter Summary**
            [A hyper-engaging hook summarizing this entire interaction]

            Transcript Block:
            {truncated_transcript}"""

    response = model.generate_content(prompt)
    return {
        **state,
        "raw_insights": response.text,
        "current_step": "insights_extracted"
    }