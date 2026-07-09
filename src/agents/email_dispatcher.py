import os
import re
import base64
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from src.state import PipelineState

SCOPES = ["https://www.googleapis.com/auth/gmail.send"]

def get_gmail_service():
    token_path = os.getenv("TOKEN_PATH", "credentials/token.json")
    creds = None
    
    if os.path.exists(token_path):
        try:
            creds = Credentials.from_authorized_user_file(token_path, SCOPES)
        except Exception:
            pass # Ignore corrupted or empty token.json

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            try:
                creds.refresh(Request())
            except Exception:
                creds = None # Force re-auth if refresh fails
                
        if not creds or not creds.valid:
            credentials_file = "credentials/gmail_credentials.json"
            if not os.path.exists(credentials_file):
                raise FileNotFoundError(f"Missing GMail Client secrets file at '{credentials_file}'")

            flow = InstalledAppFlow.from_client_secrets_file(credentials_file, SCOPES)
            creds = flow.run_local_server(port=0)
            
            os.makedirs(os.path.dirname(token_path), exist_ok=True)
            with open(token_path, "w") as token:
                token.write(creds.to_json())

    return build("gmail", "v1", credentials=creds)



def parse_markdown_to_html(markdown_text: str) -> str:
    lines = markdown_text.split("\n")
    html_out = []
    for line in lines:
        line = line.strip()
        if not line:
            html_out.append("<br/>")
        elif line.startswith("**") and line.endswith("**"):
            html_out.append(f"<h3 style='color:#312e81; font-family: Arial, sans-serif; font-size: 18px; margin-top: 20px;'>{line.strip('**')}</h3>")
        elif line.startswith("- "):
            bullet_body = re.sub(r"\*\*(.*?)\*\*", r"<strong>\1</strong>", line[2:])
            html_out.append(f"<li style='margin-bottom: 6px; font-size: 15px;'>{bullet_body}</li>")
        else:
            para = re.sub(r"\*\*(.*?)\*\*", r"<strong>\1</strong>", line)
            html_out.append(f"<p style='line-height: 1.6; font-size: 15px; color: #334155;'>{para}</p>")
    return "\n".join(html_out)



def email_dispatcher_agent(state: PipelineState) -> PipelineState:
    recipient = state.get("recipient_email")
    newsletter = state.get("approved_newsletter") or state.get("newsletter_draft", "")
    if not recipient:
        raise ValueError("No recipient email specified for dispatch.")

    service = get_gmail_service()
    message = MIMEMultipart("alternative")
    message["Subject"] = "🎙️ Your PodFlow Video Digest"
    message["To"] = recipient
    
    html_body = parse_markdown_to_html(newsletter)
    
    template = f"""
    <html>
    <body style="font-family: Georgia, serif; background-color: #f8fafc; padding: 20px;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
            <tr><td style="padding: 32px 24px; border-bottom: 4px solid #6366f1; background-color: #1e293b; color: white;">
                <h1 style="margin: 0; font-size: 24px;">PodFlow Digest Edition</h1>
            </td></tr>
            <tr><td style="padding: 24px; color: #334155;">{html_body}</td></tr>
        </table>
    </body>
    </html>
    """

    message.attach(MIMEText(newsletter, "plain"))
    message.attach(MIMEText(template, "html"))

    raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode()

    try:
        service.users().messages().send(
            userId="me",
            body={"raw": raw_message}
        ).execute()
        email_sent = True
    except Exception as e:
        raise RuntimeError(f"Gmail API dispatch failed: {str(e)}")

    return {
        **state,
        "email_sent": email_sent,
        "current_step": "completed"
    }