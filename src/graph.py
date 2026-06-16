from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver
from langgraph.types import interrupt

from src.state import PipelineState
from src.agents.transcript_extractor import transcript_extractor_agent
from src.agents.insight_extractor import insight_extractor_agent
from src.agents.newsletter_writer import newsletter_writer_agent
from src.agents.email_dispatcher import email_dispatcher_agent

def insight_review_node(state: PipelineState) -> PipelineState:
    human_input = interrupt({
        "raw_insights": state.get("raw_insights"),
        "message": "Review checkpoints. Approve, update, or reject."
    })
    return {
        **state,
        "approved_insights": human_input.get("insights", state.get("raw_insights")),
        "insights_decision": human_input.get("decision", "approve"),
        "current_step": "insights_reviewed"
    }


def route_after_insights(state: PipelineState) -> str:
    if state.get("insights_decision") in ["approved", "edit"]:
        return "newsletter_writer"
    return "insigh_extractor"

def newsletter_review_node(state: PipelineState) -> PipelineState:
    human_input = interrupt({
        "newsletter_draft": state.get("newsletter_draft"),
        "message": "Verify copy layout. Approve, request rewrite, or reset."
    })
    return {
        **state,
        "approved_newsletter": human_input.get("newsletter", state.get("newsletter_draft")),
        "newsletter_decision": human_input.get("decision", "approve"),
        "recipient_email": human_input.get("email", ""),
        "current_step": "newsletter_reviewed"
    }


def route_after_newsletter(state: PipelineState) -> str:
    decision = state.get("newsletter_decision", "approved")
    if decision == "approve":
        return "email_dispatcher"
    elif decision == "edit":
        return "newsletter_writer"
    return "insight_extractor"


def build_graph():
    memory = MemorySaver()
    graph = StateGraph(PipelineState)

    graph.add_node("transcript_extractor", transcript_extractor_agent)
    graph.add_node("insight_extractor", insight_extractor_agent)
    graph.add_node("newsletter_writer", newsletter_writer_agent)
    graph.add_node("email_dispatcher", email_dispatcher_agent)
    graph.add_node("insight_review", insight_review_node)
    graph.add_node("newsletter_review", newsletter_review_node)

    graph.set_entry_point("transcript_extractor")
    graph.add_edge("transcript_extractor", "insight_extractor")
    graph.add_edge("insight_extractor", "insight_review")
    graph.add_conditional_edges("insight_review", route_after_insights, {
        "newsletter_writer": "newsletter_writer",
        "insight_extractor": "insight_extractor"
    })
    graph.add_edge("newsletter_writer", "newsletter_review")
    graph.add_conditional_edges("newsletter_review", route_after_newsletter, {
        "email_dispatcher": "email_dispatcher",
        "newsletter_writer": "newsletter_writer",
        "insight_extractor": "insight_extractor"
    })
    graph.add_edge("email_dispatcher", END)
    
    return graph.compile(
        checkpointer=memory,
        interrupt_before=["insight_review", "newsletter_review"]
    )

pipeline = build_graph()