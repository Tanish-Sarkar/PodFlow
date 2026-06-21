import re
from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api import NoTranscriptFound, TranscriptsDisabled, YouTubeTranscriptApiException
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
        transcript_api = YouTubeTranscriptApi()
        fetched = transcript_api.fetch(video_id, languages=["en", "en-US"])
        full_transcript = " ".join(snippet.text for snippet in fetched)
    except NoTranscriptFound:
        try:
            transcript_list = transcript_api.list(video_id)
            fetched = transcript_list.find_transcript(["en", "en-US"]).fetch()
            full_transcript = " ".join(snippet.text for snippet in fetched)
        except (NoTranscriptFound, TranscriptsDisabled) as e:
            raise RuntimeError(
                f"Transcript extraction failed for video {video_id}: {str(e)}"
            )
    except TranscriptsDisabled:
        raise RuntimeError(
            f"Transcript extraction failed for video {video_id}. "
            "Transcripts are disabled for this video."
        )
    except YouTubeTranscriptApiException as e:
        raise RuntimeError(f"Transcript extraction failed for video {video_id}: {str(e)}")


    return {
        **state,
        "transcript": full_transcript,
        "current_step": "transcript_extracted"
    }

    
