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
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(DEV_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "isDev" in parsed &&
      (parsed as { isDev: unknown }).isDev === true
    ) {
      return parsed as DevPreviewSession;
    }
    return null;
  } catch {
    return null;
  }
}

/** Write a dev-preview session to sessionStorage. */
export function writeDevSession(session: DevPreviewSession): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(DEV_SESSION_KEY, JSON.stringify(session));
  } catch {
    // sessionStorage may be unavailable in private browsing with strict settings.
  }
}

/** Clear the dev-preview session from sessionStorage. */
export function clearDevSession(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(DEV_SESSION_KEY);
  } catch {
    // ignore
  }
}
