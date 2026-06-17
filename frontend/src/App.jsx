import { useState, useEffect } from "react";
import { verifyBackendToken, runPipeline, resumeInsights, resumeNewsletter } from "./api";

export default function App() {
  // Auth & Session state tracking
  const [user, setUser] = useState(null);
  const [authChecking, setAuthChecking] = useState(false);

  // Core Pipeline state variables
  const [stage, setStage] = useState("input"); // input -> insight_review -> newsletter_review -> success
  const [threadId, setThreadId] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [editedInsights, setEditedInsights] = useState("");
  const [editedNewsletter, setEditedNewsletter] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");


  // Direct injection point hook targeting Google Identity services script initialization
  useEffect(() => {
    const cachedUser = localStorage.getItem("podflow_user")
    if (cachedUser) {
      setUser(JSON.parse(cachedUser))
    }

    /* global google */
    const initializeGoogleAuth = () => {
      if (typeof google !== "undefined") {
        google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: handleGoogleAuthCallback,
        });
        google.accounts.id.renderButton(
          document.getElementById("googleSignInBtn"),
          { theme: "filled_dark", size: "large", width: "280" }
        );
      }
    };

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = initializeGoogleAuth;
    document.head.appendChild(script);

  }, [user]);

  const handleGoogleAuthCallback = async (response) => {
    setAuthChecking(true)
    setErrorMsg("")
    try {
      const profileData = await verifyBackendToken(response.credential)
      setUser(profileData)
      localStorage.setItem("podflow_user", JSON.stringify(profileData));
    } catch (err) {
      setErrorMsg("Authentication validation failed. Access Denied.")
    } finally {
      setAuthChecking(false)
    }
  }

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    setStage("input");
    setThreadId("");
    setYoutubeUrl("");
    setEditedInsights("");
    setEditedNewsletter("");
    setEmailAddress("");
  };

  const executePipelineRun = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg("")
    try {
      const res = await runPipeline(youtubeUrl);
      setThreadId(res.thread_id);
      setEditedInsights(res.raw_insights);
      setStage("insight_review");
    } catch (err) {
      setErrorMsg(err.message || "Pipeline execution failure.");
    } finally {
      setLoading(false);
    }
  }

  const handleInsightSubmission = async (decision) => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await resumeInsights(threadId, decision, editedInsights);
      if (res.status === "awaiting_insight_review") {
        setEditedInsights(res.raw_insights)
        setStage("insight_review")
      } else {
        setEditedNewsletter(res.newsletter_draft);
        setStage("newsletter_review");
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleNewsletterSubmission = async (decision) => {
    if (decision === "approve" && !emailAddress.trim()) {
      setErrorMsg("A target recipient email parameter is required.");
      return;
    }
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await resumeNewsletter(threadId, decision, editedNewsletter, emailAddress);
      if (res.status === "completed") {
        setStage("success");
      } else if (res.status === "awaiting_newsletter_review") {
        setEditedNewsletter(res.newsletter_draft);
      } else if (res.status === "awaiting_insight_review") {
        setEditedInsights(res.raw_insights);
        setStage("insight_review");
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };


  // --- RENDERING ROUTER INTERFACES ---
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl text-center space-y-6">
          <div className="space-y-2">
            <span className="text-5xl inline-block animate-pulse">🎙️</span>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
              PodFlow
            </h1>
            <p className="text-sm text-slate-400">
              Transform raw audio into curated email magazine publications with structural AI.
            </p>
          </div>

          <div className="py-4 border-t border-b border-slate-800/60 flex flex-col items-center justify-center">
            {authChecking ? (
              <div className="text-sm text-slate-400 animate-pulse">Validating cryptographic key profiles...</div>
            ) : (
              <div id="googleSignInBtn"></div>
            )}
          </div>

          {errorMsg && <p className="text-xs text-red-400 bg-red-950/40 p-2 rounded border border-red-900">{errorMsg}</p>}
          <p className="text-xs text-slate-500">Authorized user credential environments required for dashboard entry.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      {/* Dashboard Top Navigation */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🎙️</span>
          <h2 className="text-lg font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">PodFlow Workspace</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {user.picture && <img src={user.picture} alt="Profile" className="w-7 h-7 rounded-full border border-indigo-500" />}
            <span className="text-xs text-slate-300 font-medium hidden sm:inline">{user.name}</span>
          </div>
          <button onClick={handleLogout} className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 transition">
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Operational Container Block */}
      <main className="flex-grow max-w-4xl w-full mx-auto p-6 flex flex-col justify-center">
        {errorMsg && <div className="mb-6 p-4 bg-red-950/60 border border-red-800 rounded-xl text-xs text-red-200 font-medium shadow-lg">{errorMsg}</div>}

        {loading ? (
          <div className="text-center py-12 space-y-4 bg-slate-900/40 border border-slate-800 rounded-2xl animate-pulse">
            <div className="w-12 h-12 rounded-full border-2 border-t-indigo-500 border-indigo-950 animate-spin mx-auto"></div>
            <p className="text-sm text-slate-400 font-medium">Orchestrating autonomous pipeline agent frameworks...</p>
          </div>
        ) : (
          <>
            {stage === "input" && (
              <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl space-y-6 max-w-xl mx-auto w-full">
                <div className="text-center space-y-1">
                  <h3 className="text-xl font-bold">Initialize Publishing Pipeline</h3>
                  <p className="text-xs text-slate-400">Specify your target content URL parameters below.</p>
                </div>
                <form onSubmit={executePipelineRun} className="space-y-4">
                  <input
                    type="url"
                    required
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition text-slate-200"
                  />
                  <button type="submit" className="w-full py-3 bg-indigo-600 hover:bg-indigo-50 font-semibold text-white hover:text-indigo-950 text-sm rounded-xl transition shadow-lg">
                    🚀 Run Graph Engine
                  </button>
                </form>
              </div>
            )}

            {stage === "insight_review" && (
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
                <div className="border-b border-slate-800 pb-3">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Checkpoint #1</span>
                  <h3 className="text-lg font-bold">Review Analytical Insights</h3>
                </div>
                <textarea
                  rows={14}
                  value={editedInsights}
                  onChange={(e) => setEditedInsights(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono focus:outline-none text-slate-200 leading-relaxed"
                />
                <div className="flex justify-between items-center pt-2">
                  <button onClick={handleLogout} className="px-4 py-2 bg-slate-800 text-xs rounded-lg text-slate-400 font-medium">Reset</button>
                  <div className="flex gap-2">
                    <button onClick={() => handleInsightSubmission("reject")} className="px-4 py-2 bg-red-950/40 border border-red-900 text-red-200 text-xs rounded-lg font-medium">Re-extract</button>
                    <button onClick={() => handleInsightSubmission("approve")} className="px-5 py-2 bg-indigo-600 text-white text-xs rounded-lg font-bold">Approve & Copywrite</button>
                  </div>
                </div>
              </div>
            )}

            {stage === "newsletter_review" && (
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
                <div className="border-b border-slate-800 pb-3">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Checkpoint #2</span>
                  <h3 className="text-lg font-bold">Review Newsletter Publication Draft</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <textarea
                    rows={14}
                    value={editedNewsletter}
                    onChange={(e) => setEditedNewsletter(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono focus:outline-none text-slate-200 leading-relaxed"
                  />
                  <div className="bg-slate-950 border border-slate-800/60 p-4 rounded-xl flex flex-col justify-between">
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Dispatch Destination</h4>
                      <input
                        type="email"
                        required
                        placeholder="recipient@domain.com"
                        value={emailAddress}
                        onChange={(e) => setEmailAddress(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none"
                      />
                      <p className="text-[11px] text-slate-500 leading-relaxed">The system will render markdown layouts down into inline-styled responsive HTML tables before utilizing authorized Gmail API connection channels.</p>
                    </div>
                    <div className="flex flex-col gap-2 pt-4">
                      <button onClick={() => handleNewsletterSubmission("approve")} className="w-full py-2 bg-indigo-600 text-xs text-white font-bold rounded-lg shadow">📬 Confirm & Dispatch Email</button>
                      <button onClick={() => handleNewsletterSubmission("rewrite")} className="w-full py-2 bg-slate-800 text-xs text-slate-300 rounded-lg">✏️ Trigger Rewrite Logic</button>
                      <button onClick={() => handleNewsletterSubmission("reject")} className="w-full py-2 bg-red-950/30 text-red-400 text-xs rounded-lg">Reset Pipeline</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {stage === "success" && (
              <div className="bg-slate-900 border border-slate-850 p-10 rounded-2xl max-w-sm mx-auto w-full text-center space-y-4 shadow-2xl">
                <div className="w-14 h-14 bg-emerald-950 text-emerald-400 border border-emerald-500 rounded-full flex items-center justify-center text-2xl mx-auto animate-bounce">📬</div>
                <h3 className="text-xl font-bold">Newsletter Dispatched</h3>
                <p className="text-xs text-slate-400 leading-relaxed">The multi-agent operation loop has finished successfully. Verify your inbox data shortly.</p>
                <button onClick={() => setStage("input")} className="w-full py-2.5 bg-indigo-600 font-bold text-xs rounded-lg">Process Next Link</button>
              </div>
            )}
          </>
        )}
      </main>

      <footer className="py-4 border-t border-slate-900 text-center text-[10px] text-slate-600 font-medium tracking-wide">
        PODFLOW AGENT CORE ENGINE PLATFORM SERVICES
      </footer>
    </div>
  );
}