import { useState, useEffect } from "react";
import { runPipeline, resumeInsights, resumeNewsletter } from "./api";

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("podflow_theme") === "dark" || 
             (!("podflow_theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches);
    }
    return false;
  });

  const [view, setView] = useState("landing"); // 'landing' | 'app'
  const [stage, setStage] = useState("input"); // 'input' -> 'insight_review' -> 'newsletter_review' -> 'success'
  
  const [threadId, setThreadId] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [editedInsights, setEditedInsights] = useState("");
  const [editedNewsletter, setEditedNewsletter] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem("podflow_theme", "dark");
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem("podflow_theme", "light");
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const executePipelineRun = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
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
  };

  const handleInsightSubmission = async (decision) => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await resumeInsights(threadId, decision, editedInsights);
      if (res.status === "awaiting_insight_review") {
        setEditedInsights(res.raw_insights);
        setStage("insight_review");
      } else {
        setEditedNewsletter(res.newsletter_draft);
        setStage("newsletter_review");
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

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

  const resetFlow = () => {
    setStage("input");
    setThreadId("");
    setYoutubeUrl("");
    setEditedInsights("");
    setEditedNewsletter("");
    setEmailAddress("");
  };

  // UI Components
  const ThemeToggle = () => (
    <button 
      onClick={toggleTheme} 
      className="p-2 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition backdrop-blur-md"
      aria-label="Toggle Theme"
    >
      {isDarkMode ? "🌙" : "☀️"}
    </button>
  );

  if (view === "landing") {
    return (
      <div className="min-h-screen bg-[#F5F5F5] dark:bg-[#0A0A0A] text-[#111111] dark:text-[#EFEFEF] transition-colors duration-300 font-sans">
        <header className="fixed top-0 w-full z-50 bg-white/40 dark:bg-black/40 backdrop-blur-2xl border-b border-black/5 dark:border-white/5 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎙️</span>
            <h2 className="text-xl font-bold tracking-tight bg-gradient-to-r from-[#8BB6FF] to-[#AFCBFF] bg-clip-text text-transparent">PodFlow</h2>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <button 
              onClick={() => setView("app")} 
              className="px-6 py-2.5 bg-[#BFD8FF] dark:bg-[#254C8F] hover:bg-[#AFCBFF] dark:hover:bg-[#345BA0] text-black dark:text-white font-semibold rounded-full shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all transform hover:-translate-y-0.5"
            >
              Use Agent
            </button>
          </div>
        </header>

        <main>
          {/* Hero Section */}
          <section className="min-h-screen flex flex-col items-center justify-center text-center px-4 pt-20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#BFD8FF]/20 to-transparent dark:from-[#254C8F]/20 -z-10 pointer-events-none"></div>
            <div className="max-w-3xl space-y-8 animate-fade-in-up">
              <span className="inline-block px-4 py-1.5 rounded-full bg-white/50 dark:bg-black/50 border border-black/5 dark:border-white/10 backdrop-blur-md text-sm font-medium">
                The future of knowledge extraction
              </span>
              <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight leading-tight">
                Transform Audio into <br />
                <span className="bg-gradient-to-r from-[#8BB6FF] to-[#AFCBFF] bg-clip-text text-transparent">Premium Newsletters.</span>
              </h1>
              <p className="text-lg md:text-xl text-[#555555] dark:text-[#A0A0A0] max-w-2xl mx-auto font-light">
                PodFlow orchestrates specialized AI agents to extract core insights from podcasts and generate engaging, magazine-style email digests autonomously.
              </p>
              <div className="pt-4">
                <button 
                  onClick={() => setView("app")} 
                  className="px-8 py-4 bg-[#BFD8FF] dark:bg-[#254C8F] hover:bg-[#AFCBFF] dark:hover:bg-[#345BA0] text-black dark:text-white font-semibold rounded-full shadow-[0_12px_32px_rgba(0,0,0,0.12)] transition-all text-lg transform hover:-translate-y-1"
                >
                  Start Pipeline
                </button>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="min-h-screen flex items-center justify-center px-4 py-24 bg-white/10 dark:bg-black/10 backdrop-blur-3xl">
            <div className="max-w-5xl w-full">
              <div className="text-center mb-16 space-y-4">
                <h2 className="text-4xl font-bold">Multi-Agent Orchestration</h2>
                <p className="text-[#555555] dark:text-[#A0A0A0]">Designed for precision, readability, and scale.</p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  { icon: "📝", title: "Transcript Engine", desc: "Instantly extracts full transcripts from any YouTube video or podcast link." },
                  { icon: "🧠", title: "Insight Extractor", desc: "Identifies core themes, actionable takeaways, and standout quotes using Gemini 2.5." },
                  { icon: "📬", title: "Newsletter Writer", desc: "Synthesizes data into a highly engaging, scannable format optimized for your inbox." }
                ].map((feature, i) => (
                  <div key={i} className="bg-white/40 dark:bg-black/40 border border-white/40 dark:border-white/10 p-8 rounded-[32px] shadow-[0_12px_32px_rgba(0,0,0,0.05)] backdrop-blur-2xl hover:-translate-y-2 transition-transform duration-300">
                    <div className="text-4xl mb-6">{feature.icon}</div>
                    <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                    <p className="text-[#555555] dark:text-[#A0A0A0] leading-relaxed">{feature.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>
      </div>
    );
  }

  // Application Flow
  return (
    <div className="min-h-screen bg-[#F5F5F5] dark:bg-[#0A0A0A] text-[#111111] dark:text-[#EFEFEF] transition-colors duration-300 flex flex-col justify-between font-sans relative overflow-hidden">
      {/* Ambient background blur */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-[#BFD8FF]/10 dark:from-[#254C8F]/20 to-transparent -z-10 pointer-events-none"></div>

      <header className="bg-white/40 dark:bg-black/40 backdrop-blur-2xl border-b border-black/5 dark:border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView("landing")}>
          <span className="text-2xl">🎙️</span>
          <h2 className="text-lg font-bold tracking-tight bg-gradient-to-r from-[#8BB6FF] to-[#AFCBFF] bg-clip-text text-transparent">PodFlow</h2>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <button onClick={() => setView("landing")} className="text-sm px-4 py-2 bg-white/50 dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-full hover:bg-white dark:hover:bg-black transition backdrop-blur-md">
            Exit
          </button>
        </div>
      </header>

      <main className="flex-grow max-w-4xl w-full mx-auto p-6 flex flex-col justify-center">
        {errorMsg && (
          <div className="mb-6 p-4 bg-red-100/50 dark:bg-red-900/30 border border-red-200 dark:border-red-800/50 rounded-2xl text-red-800 dark:text-red-200 text-sm font-medium shadow-[0_8px_24px_rgba(0,0,0,0.05)] backdrop-blur-xl">
            {errorMsg}
          </div>
        )}

        {loading ? (
          <div className="text-center py-16 space-y-6 bg-white/30 dark:bg-black/30 border border-white/40 dark:border-white/10 rounded-[32px] backdrop-blur-2xl shadow-[0_12px_32px_rgba(0,0,0,0.05)] animate-pulse">
            <div className="w-12 h-12 rounded-full border-2 border-[#BFD8FF] border-t-transparent dark:border-[#254C8F] dark:border-t-transparent animate-spin mx-auto"></div>
            <p className="text-[#555555] dark:text-[#A0A0A0] font-medium">Agents are processing your request...</p>
          </div>
        ) : (
          <div className="w-full max-w-3xl mx-auto">
            {stage === "input" && (
              <div className="bg-white/40 dark:bg-black/40 border border-white/50 dark:border-white/10 p-10 rounded-[32px] shadow-[0_12px_32px_rgba(0,0,0,0.08)] backdrop-blur-2xl space-y-8">
                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-bold">Initialize Pipeline</h3>
                  <p className="text-[#777777] dark:text-[#A0A0A0]">Enter a YouTube link to extract insights and draft a newsletter.</p>
                </div>
                <form onSubmit={executePipelineRun} className="space-y-6">
                  <input
                    type="url"
                    required
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    className="w-full bg-white/60 dark:bg-black/60 border border-black/10 dark:border-white/10 rounded-full px-6 py-4 text-lg focus:outline-none focus:border-[#8BB6FF] dark:focus:border-[#4B7BC0] transition shadow-[0_2px_8px_rgba(0,0,0,0.04)_inset]"
                  />
                  <button type="submit" className="w-full py-4 bg-[#BFD8FF] dark:bg-[#254C8F] hover:bg-[#AFCBFF] dark:hover:bg-[#345BA0] text-black dark:text-white font-semibold text-lg rounded-full transition shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:-translate-y-0.5">
                    🚀 Run Graph Engine
                  </button>
                </form>
              </div>
            )}

            {stage === "insight_review" && (
              <div className="bg-white/40 dark:bg-black/40 border border-white/50 dark:border-white/10 p-8 rounded-[32px] shadow-[0_12px_32px_rgba(0,0,0,0.08)] backdrop-blur-2xl space-y-6">
                <div className="border-b border-black/5 dark:border-white/10 pb-4">
                  <span className="text-xs font-bold text-[#8BB6FF] uppercase tracking-widest">Checkpoint 1</span>
                  <h3 className="text-xl font-bold mt-1">Review Insights</h3>
                </div>
                <textarea
                  rows={12}
                  value={editedInsights}
                  onChange={(e) => setEditedInsights(e.target.value)}
                  className="w-full bg-white/50 dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-2xl p-5 font-mono text-sm focus:outline-none focus:border-[#8BB6FF] leading-relaxed shadow-[0_2px_8px_rgba(0,0,0,0.04)_inset] resize-y"
                />
                <div className="flex justify-between items-center pt-2">
                  <button onClick={resetFlow} className="px-5 py-2.5 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-full font-medium transition">Cancel</button>
                  <div className="flex gap-3">
                    <button onClick={() => handleInsightSubmission("reject")} className="px-5 py-2.5 bg-red-100/50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full font-medium transition hover:bg-red-200/50 dark:hover:bg-red-800/50">Re-extract</button>
                    <button onClick={() => handleInsightSubmission("approve")} className="px-6 py-2.5 bg-[#BFD8FF] dark:bg-[#254C8F] hover:bg-[#AFCBFF] dark:hover:bg-[#345BA0] text-black dark:text-white rounded-full font-bold shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition">Approve & Copywrite</button>
                  </div>
                </div>
              </div>
            )}

            {stage === "newsletter_review" && (
              <div className="bg-white/40 dark:bg-black/40 border border-white/50 dark:border-white/10 p-8 rounded-[32px] shadow-[0_12px_32px_rgba(0,0,0,0.08)] backdrop-blur-2xl space-y-6 max-w-4xl mx-auto">
                <div className="border-b border-black/5 dark:border-white/10 pb-4">
                  <span className="text-xs font-bold text-[#8BB6FF] uppercase tracking-widest">Checkpoint 2</span>
                  <h3 className="text-xl font-bold mt-1">Review Newsletter</h3>
                </div>
                
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1">
                    <textarea
                      rows={14}
                      value={editedNewsletter}
                      onChange={(e) => setEditedNewsletter(e.target.value)}
                      className="w-full h-full bg-white/50 dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-2xl p-5 font-mono text-sm focus:outline-none focus:border-[#8BB6FF] leading-relaxed shadow-[0_2px_8px_rgba(0,0,0,0.04)_inset] resize-y"
                    />
                  </div>
                  <div className="w-full md:w-64 bg-white/30 dark:bg-black/30 border border-white/40 dark:border-white/5 p-5 rounded-[24px] flex flex-col justify-between backdrop-blur-xl">
                    <div className="space-y-4">
                      <h4 className="text-sm font-bold tracking-wide">Dispatch</h4>
                      <input
                        type="email"
                        required
                        placeholder="recipient@domain.com"
                        value={emailAddress}
                        onChange={(e) => setEmailAddress(e.target.value)}
                        className="w-full bg-white/60 dark:bg-black/60 border border-black/10 dark:border-white/10 rounded-full px-4 py-3 text-sm focus:outline-none focus:border-[#8BB6FF] shadow-[0_2px_8px_rgba(0,0,0,0.02)_inset]"
                      />
                      <p className="text-[11px] text-[#777777] dark:text-[#A0A0A0] leading-relaxed">
                        Markdown is parsed to responsive HTML before dispatching via Gmail API.
                      </p>
                    </div>
                    <div className="flex flex-col gap-3 pt-6">
                      <button onClick={() => handleNewsletterSubmission("approve")} className="w-full py-3 bg-[#BFD8FF] dark:bg-[#254C8F] hover:bg-[#AFCBFF] dark:hover:bg-[#345BA0] text-black dark:text-white font-bold rounded-full shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition">📬 Dispatch</button>
                      <button onClick={() => handleNewsletterSubmission("rewrite")} className="w-full py-2.5 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-sm font-medium rounded-full transition">✏️ Rewrite</button>
                      <button onClick={() => handleNewsletterSubmission("reject")} className="w-full py-2.5 bg-red-100/30 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-medium rounded-full hover:bg-red-200/50 dark:hover:bg-red-800/40 transition">Reset Pipeline</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {stage === "success" && (
              <div className="bg-white/40 dark:bg-black/40 border border-white/50 dark:border-white/10 p-12 rounded-[32px] shadow-[0_12px_32px_rgba(0,0,0,0.08)] backdrop-blur-2xl text-center space-y-6 max-w-sm mx-auto">
                <div className="w-20 h-20 bg-[#BFD8FF] dark:bg-[#254C8F] text-[#111111] dark:text-[#EFEFEF] rounded-full flex items-center justify-center text-4xl mx-auto shadow-[0_8px_24px_rgba(0,0,0,0.12)]">📬</div>
                <div>
                  <h3 className="text-2xl font-bold">Dispatched</h3>
                  <p className="text-[#777777] dark:text-[#A0A0A0] mt-2 leading-relaxed">Check your inbox. The automation has completed successfully.</p>
                </div>
                <button onClick={resetFlow} className="w-full py-4 bg-white/50 dark:bg-black/50 border border-black/10 dark:border-white/10 hover:bg-white dark:hover:bg-black font-semibold rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.04)] transition hover:-translate-y-0.5">Start Over</button>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="py-6 text-center text-xs text-[#777777] dark:text-[#555555] font-medium tracking-widest uppercase">
        PodFlow Multi-Agent Ecosystem
      </footer>
    </div>
  );
}