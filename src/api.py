import uuid
import os
import uuid
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl
from google.oauth2 import id_token
from google.auth.transport import requests
from dotenv import load_dotenv

load_dotenv()

from src.graph import pipeline

app = FastAPI("PodFlow AI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")
active_thread = {}

class TokenVerificartionRequest(BaseModel):
    id_token: str

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


@app.post("/auth/verify")
async def verify_token(req: TokenVerificartionRequest):
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(
            status_code=500, 
            detail="Server misconfigured: Google Client ID not specified."
        )

    try:
        # Cryptographically Parse identity signeture
        id_info = id_token.verify_oauth2_token(req.id_token, requests.Request(), GOOGLE_CLIENT_ID)
        return {
            "authenticated": True,
            "email": id_info.get("email"),
            "name": id_info.get("name"),
            "picture": id_info.get("picture")
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid identification signature token: {str(e)}"
        )
        

@app.post("/run")
async def state_pipeline(req: RunRequest):
    thread_id = str(uuid.uuid4())
    config = {"configurable" : {"thread_id": thread_id}}
    active_threads[thread_id] = config
    print(active_threads)
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
    config = active_threads.pop(req.thread_id, None)
    if not config:
        raise HTTPException(
            status_code=404,
            detail="Workflow Thread not found or already processed."
        )

    input_data = {"decision": req.decision, "insights": req.insights}

    try:
        result = pipeline.invoke(input_data, config=config)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Pipeline execution error: {str(e)}")

    if result.get("current_step") == "insights_extracted":
        return {
            "thread_id": req.thread_id,
            "status": "awaiting_insights_review",
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
        result = pipeline.invoke({"decision": req.decision, "newsletter": req.newsletter, "email": req.email}, config=config)
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

        