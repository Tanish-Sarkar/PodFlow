const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000"

export async function verifyBackendToken(token) {
    const res = await fetch(`${API_URL}/auth/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_token: token }),
    });
    if (!res.ok) throw new Error("Cryptographic session verification rejected.");
    return res.json();
}


export async function runPipeline(youtubeUrl) {
    const res = await fetch(`${API_URL}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ youtube_url: youtubeUrl }),
    });
    if (!res.ok) throw new Error("Failed to start pipeline.");
    return res.json();
}


export async function resumeInsights(threadId, decision, insights) {
    const res = await fetch(`${API_URL}/resume/insights`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ thread_id: threadId, decision, insights }),
    });
    return res.json();
}

export async function resumeNewsletter(threadId, decision, newsletter, email) {
    const res = await fetch(`${API_URL}/resume/newsletter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ thread_id: threadId, decision, newsletter, email }),
    });
    return res.json();
}