/**
 * Developer-preview session utilities.
 *
 * This module provides a client-side mock session for local UI development ONLY.
 * It is NOT authentication. It does NOT create a JWT, credential, or Supabase session.
 * The backend will enforce real authentication and ownership separately.
 *
 * Session state is stored in `sessionStorage` (tab-scoped, cleared on tab close)
 * using a clearly-namespaced key so it cannot be confused with real auth tokens.
 */

import { createLogger } from "./logger";

const log = createLogger("DevSession");

export const DEV_SESSION_KEY = "podflow:dev-preview-session";

export interface DevPreviewSession {
  /** Always true so callers can pattern-match cleanly. */
  isDev: true;
  /** Human-readable label shown in the developer badge. */
  label: string;
  /** Displayable mock name for the fake account. */
  displayName: string;
  /** Displayable mock email for the fake account. */
  displayEmail: string;
}

export const MOCK_DEV_SESSION: DevPreviewSession = {
  isDev: true,
  label: "Developer Preview",
  displayName: "Dev User",
  displayEmail: "dev@podflow.local",
};

/** Returns true only when running in a development build. */
export function isDevEnvironment(): boolean {
  return process.env.NODE_ENV === "development";
}

/** Read the current dev-preview session from sessionStorage, or null. */
export function readDevSession(): DevPreviewSession | null {
  if (typeof window === "undefined") {
    log.debug("readDevSession called in non-browser context — skipping");
    return null;
  }
  try {
    log.debug("Reading dev session from sessionStorage", { key: DEV_SESSION_KEY });
    const raw = sessionStorage.getItem(DEV_SESSION_KEY);
    if (!raw) {
      log.info("No dev session found in sessionStorage");
      return null;
    }
    const parsed = JSON.parse(raw) as unknown;
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "isDev" in parsed &&
      (parsed as { isDev: unknown }).isDev === true
    ) {
      const session = parsed as DevPreviewSession;
      log.info("Dev session read successfully", {
        displayName: session.displayName,
        displayEmail: session.displayEmail,
        label: session.label,
      });
      return session;
    }
    log.warn("sessionStorage contained data but it did not match DevPreviewSession shape", {
      raw: raw.slice(0, 100),
    });
    return null;
  } catch (err) {
    log.error("Failed to read dev session from sessionStorage", {
      error: String(err),
    });
    return null;
  }
}

/** Write a dev-preview session to sessionStorage. */
export function writeDevSession(session: DevPreviewSession): void {
  if (typeof window === "undefined") {
    log.debug("writeDevSession called in non-browser context — skipping");
    return;
  }
  try {
    log.info("Writing dev session to sessionStorage", {
      displayName: session.displayName,
      displayEmail: session.displayEmail,
      label: session.label,
      key: DEV_SESSION_KEY,
    });
    sessionStorage.setItem(DEV_SESSION_KEY, JSON.stringify(session));
    log.debug("Dev session written successfully");
  } catch (err) {
    // sessionStorage may be unavailable in private browsing with strict settings.
    log.error("Failed to write dev session to sessionStorage", {
      error: String(err),
    });
  }
}

/** Clear the dev-preview session from sessionStorage. */
export function clearDevSession(): void {
  if (typeof window === "undefined") {
    log.debug("clearDevSession called in non-browser context — skipping");
    return;
  }
  try {
    log.info("Clearing dev session from sessionStorage", { key: DEV_SESSION_KEY });
    sessionStorage.removeItem(DEV_SESSION_KEY);
    log.debug("Dev session cleared successfully");
  } catch (err) {
    log.error("Failed to clear dev session from sessionStorage", {
      error: String(err),
    });
  }
}
