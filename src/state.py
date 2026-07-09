from typing import TypedDict, Optional, Literal

class PipelineState(TypedDict):
    youtube_url: str
    transcript: Optional[str]

# Insights checkpoint 1
    raw_insights: Optional[str]
    approved_insights: Optional[str]
    insights_decision: Optional[Literal["approve", "edit", "reject"]]
    
# Newsletter content checkpoint 2
    newsletter_draft: Optional[str]
    approved_newsletter: Optional[str]
    newsletter_decision: Optional[Literal["approve", "rewrite", "reject"]]

# Dispatch
    recipient_email: Optional[str]
    email_sent: Optional[bool]

    current_step: Optional[str]
    