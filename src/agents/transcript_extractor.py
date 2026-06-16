import re
# pyrefly: ignore [missing-import]
from youtube_transcript_api import YouTubeTranscriptApi
# pyrefly: ignore [missing-import]
from youtube_transcript_api.errors import TranscriptsDisabled, NoTranscriptFound
from src.state import PipelineState

def extract_video_id(url: str) -> str:
    patterns = [
        r"(?:v=|\/)([0-9A-Za-z_-]{11})",
        r"youtu\.be\/([0-9A-Za-z_-]{11})",
        r"embed\/([0-9A-Za-z_-]{11})",
        r"shorts\/([0-9A-Za-z_-]{11})"
    ]
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    raise ValueError(f"Could not extract YouTube video ID from URL: {url}")


def transcript_extractor_agent(state: PipelineState) -> PipelineState:
    try:
        video_id = extract_video_id(state["youtube_url"])
    except Exception as e:
        raise ValueError(f"Invalid YouTube URL: {str(e)}")


    try:
        transcript_list = YouTubeTranscriptApi.get_transcript(video_id, languages=['en', 'en-US'])
        full_transcript = " ".join([enter["text"] for enter in transcript_list])
    except (TranscriptsDisabled, Exception, NoTranscriptFound):
        try:
            transcript_list_fallback = YouTubeTranscriptApi.list_transcripts(video_id)
            fetched = transcript_list_fallback.find_transcript(["en"]).fetch()
            full_transcript = " ".join([entry["text"] for entry in fetched])
        except Exception:
            raise RuntimeError(
                f"Transcript extraction failed for video {video_id}. "
                "Ensure closed-captions or transcripts are enabled on this video."
            )


    return {
        **state,
        "full_transcript": full_transcript,
        "current_step": "transcript_extracted"
    }

    