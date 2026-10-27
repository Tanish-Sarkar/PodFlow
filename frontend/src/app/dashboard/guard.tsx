"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { readDevSession, clearDevSession, type DevPreviewSession } from "@/lib/dev-session";
import { DashboardShell } from "@/components/dashboard/shell";
import { DashboardOverview } from "@/components/dashboard/overview";
import { createLogger } from "@/lib/logger";

const log = createLogger("DashboardGuard");

// ---------------------------------------------------------------------------
// Route guard
//
// This is a client-side UI guard for the developer preview only.
// It is NOT real authorization. The backend will enforce authentication and
// ownership separately. Do not rely on this for any security boundary.
//
// Hydration-safe pattern:
// 1. Both server render and initial browser render output the exact same loading
//    spinner state.
// 2. sessionStorage is read only after mounting inside an effect.
// 3. If a valid developer preview session exists, we update state to render the
//    dashboard; otherwise, we redirect to /login.
// ---------------------------------------------------------------------------

function DashboardLoading() {
  return (
    <div
      className="flex min-h-screen items-center justify-center bg-paper"
      role="status"
      aria-live="polite"
      aria-label="Loading preview session…"
    >
      <div
        className="size-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary"
        aria-hidden="true"
      />
    </div>
  );
}

export default function DashboardGuard() {
  const router = useRouter();
  const [session, setSession] = useState<DevPreviewSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  log.debug("DashboardGuard render", { isLoading, hasSession: session !== null });

  useEffect(() => {
    log.info("DashboardGuard mounted — checking dev session");
    const existingSession = readDevSession();
    if (!existingSession) {
      log.warn("No valid dev session found — redirecting to /login");
      router.replace("/login");
      return;
    }
    log.info("Dev session validated, loading dashboard", {
      displayName: existingSession.displayName,
      displayEmail: existingSession.displayEmail,
    });
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Client mount sync from sessionStorage
    setSession(existingSession);
    setIsLoading(false);
  }, [router]);

  function handleSignOut() {
    log.info("User initiated sign-out from developer preview");
    clearDevSession();
    log.info("Dev session cleared, redirecting to /login");
    router.replace("/login");
  }

  if (isLoading || !session) {
    log.debug("DashboardGuard: still loading or no session — showing spinner");
    return <DashboardLoading />;
  }

  log.debug("DashboardGuard: session ready, rendering dashboard shell", {
    displayName: session.displayName,
  });

  return (
    <DashboardShell session={session} onSignOut={handleSignOut}>
      <DashboardOverview displayName={session.displayName} />
    </DashboardShell>
  );
}
