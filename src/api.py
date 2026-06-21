import uuid
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl
from dotenv import load_dotenv
from langgraph.types import Command

load_dotenv()

from src.graph import pipeline

app = FastAPI(title="PodFlow AI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

active_threads = {}

class RunRequest(BaseModel):
    youtube_url: HttpUrl

class InsightResumeRequest(BaseModel):
    thread_id: str
    decision: str
    insights: str = ""

class NewsletterResumeRequest(BaseModel):
    thread_id: str
    decision: str
    newsletter: str = ""
    email: str = ""



@app.post("/run")
async def state_pipeline(req: RunRequest):
    thread_id = str(uuid.uuid4())
    config = {"configurable" : {"thread_id": thread_id}}
    active_threads[thread_id] = config
    try:
        result = pipeline.invoke({"youtube_url": str(req.youtube_url)}, config=config)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Pipeline initialization aborted: {str(e)}")
        
    return {
        "thread_id": thread_id,
        "status": "awaiting_insight_review",
        "raw_insights": result.get("raw_insights")
    }


@app.post("/resume/insights")
async def resume_insights(req: InsightResumeRequest):
    config = active_threads.get(req.thread_id)
    if not config:
        raise HTTPException(
            status_code=404,
            detail="Workflow Thread not found or already processed."
        )

    resume_data = {"decision": req.decision, "insights": req.insights}

    try:
        result = pipeline.invoke(Command(resume=resume_data), config=config)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Pipeline execution error: {str(e)}")

    if result.get("current_step") == "insights_extracted":
        return {
            "thread_id": req.thread_id,
            "status": "awaiting_insight_review",
            "raw_insights": result.get("raw_insights")
        }
    
    return {
            "thread_id": req.thread_id,
            "status": "awaiting_newsletter_review",
            "newsletter_draft": result.get("newsletter_draft")
        }
    

@app.post("/resume/newsletter")
async def resume_newsletter(req: NewsletterResumeRequest):
    config = active_threads.get(req.thread_id)
    if not config:
        raise HTTPException(status_code=404, detail="Active execution thread state missing.")
        
    try:
        result = pipeline.invoke(
            Command(resume={
                "decision": req.decision,
                "newsletter": req.newsletter,
                "email": req.email
            }),
            config=config
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
        
    if result.get("current_step") == "newsletter_drafted":
        return {
            "thread_id": req.thread_id, 
            "status": "awaiting_newsletter_review", 
            "newsletter_draft": result.get("newsletter_draft")
            }
    elif result.get("current_step") == "insights_extracted":
        return {
            "thread_id": req.thread_id, 
            "status": "awaiting_insight_review", 
            "raw_insights": result.get("raw_insights")
            }
        
    active_threads.pop(req.thread_id, None)
    return {
        "thread_id": req.thread_id, 
        "status": "completed", 
        "email_sent": result.get("email_sent", False)
        }


@app.get("/health")
async def engine_health_check():
    return {
        "status": "online"
        }

        
