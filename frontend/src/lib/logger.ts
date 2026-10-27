/**
 * PodFlow Frontend Logger
 *
 * Production-grade structured logger with:
 * - Log levels: DEBUG, INFO, WARN, ERROR
 * - Scoped namespaces per module/component
 * - Timestamps on every entry
 * - Structured context objects (safe JSON serialisation)
 * - In production (NODE_ENV !== "development") DEBUG entries are suppressed
 *   unless the `podflow:debug` flag is set in localStorage.
 *
 * Usage:
 *   import { createLogger } from "@/lib/logger";
 *   const log = createLogger("DashboardGuard");
 *   log.info("Session resolved", { userId: session.displayName });
 *   log.warn("No session found, redirecting");
 *   log.error("Unexpected state", { error });
 */

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogEntry {
  ts: string;
  level: LogLevel;
  scope: string;
  message: string;
  context?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function timestamp(): string {
  return new Date().toISOString();
}

/** Safely serialise any value to a plain object for structured logging. */
function safeContext(ctx: unknown): Record<string, unknown> | undefined {
  if (ctx === undefined || ctx === null) return undefined;
  if (typeof ctx !== "object") return { value: ctx };
  try {
    // Shallow-clone so callers can't mutate logged data after the fact.
    return { ...(ctx as Record<string, unknown>) };
  } catch {
    return { _serializationError: true };
  }
}

// ---------------------------------------------------------------------------
// Is debug enabled?
// ---------------------------------------------------------------------------
function isDebugEnabled(): boolean {
  if (process.env.NODE_ENV === "development") return true;
  if (typeof window !== "undefined") {
    try {
      return localStorage.getItem("podflow:debug") === "true";
    } catch {
      return false;
    }
  }
  return false;
}

// ---------------------------------------------------------------------------
// Console output - colour-coded per level
// ---------------------------------------------------------------------------
const LEVEL_STYLES: Record<LogLevel, string> = {
  debug: "color:#6b7280;font-weight:normal",   // gray
  info:  "color:#2563eb;font-weight:600",       // blue
  warn:  "color:#d97706;font-weight:600",       // amber
  error: "color:#dc2626;font-weight:700",       // red
};

function emit(entry: LogEntry) {
  const prefix = `[PodFlow][${entry.scope}]`;
  const style = LEVEL_STYLES[entry.level];

  if (entry.context !== undefined) {
    // eslint-disable-next-line no-console
    console[entry.level === "debug" ? "debug" : entry.level](
      `%c${prefix} ${entry.message}`,
      style,
      entry.context,
    );
  } else {
    // eslint-disable-next-line no-console
    console[entry.level === "debug" ? "debug" : entry.level](
      `%c${prefix} ${entry.message}`,
      style,
    );
  }
}

// ---------------------------------------------------------------------------
// Logger factory
// ---------------------------------------------------------------------------
export interface Logger {
  debug(message: string, context?: Record<string, unknown>): void;
  info(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  error(message: string, context?: Record<string, unknown>): void;
}

/**
 * Create a scoped logger for a module or component.
 *
 * @param scope - Human-readable name shown in every log line (e.g. "DashboardGuard").
 */
export function createLogger(scope: string): Logger {
  function log(level: LogLevel, message: string, context?: Record<string, unknown>) {
    if (level === "debug" && !isDebugEnabled()) return;

    const entry: LogEntry = {
      ts: timestamp(),
      level,
      scope,
      message,
      context: safeContext(context),
    };

    emit(entry);
  }

  return {
    debug: (msg, ctx) => log("debug", msg, ctx),
    info:  (msg, ctx) => log("info",  msg, ctx),
    warn:  (msg, ctx) => log("warn",  msg, ctx),
    error: (msg, ctx) => log("error", msg, ctx),
  };
}
