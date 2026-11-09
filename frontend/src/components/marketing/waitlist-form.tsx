"use client";

import { useState, type FormEvent } from "react";
import { ArrowRightIcon } from "./icons";

const endpoint = process.env.NEXT_PUBLIC_WAITLIST_ENDPOINT?.trim();

export function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!endpoint || status === "sending") return;

    setStatus("sending");
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (!response.ok) throw new Error("Waitlist request failed");
      setEmail("");
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div>
      {endpoint ? (
        <form onSubmit={submit} className="flex flex-col gap-4 sm:flex-row">
          <label className="sr-only" htmlFor="waitlist-email">Email address</label>
          <input
            id="waitlist-email"
            type="email"
            name="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@company.com"
            className="min-h-12 min-w-0 flex-1 rounded-lg border border-line-strong bg-surface px-4 text-base text-ink placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <button className="btn btn-primary" type="submit" disabled={status === "sending"}>
            {status === "sending" ? "Sending request" : "Join the early access list"}
            <ArrowRightIcon className="size-4" />
          </button>
        </form>
      ) : (
        <p className="body-5 rounded-lg border border-line bg-surface px-4 py-4 text-body">
          Early access registration is not open yet. No email is collected on this page today.
        </p>
      )}

      <p className="caption-2 mt-4 text-muted" aria-live="polite">
        {status === "success" && "Your request has been received."}
        {status === "error" && "We could not send your request. Please try again later."}
        {status === "idle" && endpoint && "Use an address you are comfortable sharing. Please do not include sensitive information."}
      </p>
    </div>
  );
}
