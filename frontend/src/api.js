const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000"

async function parseResponse(res, fallbackMessage) {
    if (res.ok) return res.json();

    let message = fallbackMessage;
    try {
        const errorBody = await res.json();
        message = errorBody.detail || message;
    } catch {
        // Keep the fallback when the backend returns a non-JSON error.
    }

    throw new Error(message);
}

export async function runPipeline(youtubeUrl) {
    const res = await fetch(`${API_URL}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ youtube_url: youtubeUrl }),
    });
    return parseResponse(res, "Failed to start pipeline.");
}


export async function resumeInsights(threadId, decision, insights) {
    const res = await fetch(`${API_URL}/resume/insights`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ thread_id: threadId, decision, insights }),
    });
    return parseResponse(res, "Failed to resume insights review.");
}

export async function resumeNewsletter(threadId, decision, newsletter, email) {
    const res = await fetch(`${API_URL}/resume/newsletter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ thread_id: threadId, decision, newsletter, email }),
    });
    return parseResponse(res, "Failed to resume newsletter review.");
}
