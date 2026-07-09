from src.agents.gemini_client import generate_text
from src.state import PipelineState

def insight_extractor_agent(state: PipelineState) -> PipelineState:
    raw_transcript = state.get("transcript", "")
    # Clean optimization threshold
    truncated_transcript = raw_transcript[:25000] 

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

    return {
        **state,
        "raw_insights": generate_text(prompt),
        "current_step": "insights_extracted"
    }
