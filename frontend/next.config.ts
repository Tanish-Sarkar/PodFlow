import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === "production";

// Canonical URL, sitemap and og:image need a real origin; without one Next.js falls
// back to localhost for og:image. Say so once per production build.
if (isProduction && !process.env.NEXT_PUBLIC_SITE_URL?.trim() && process.env.VERCEL_ENV !== "preview") {
  console.warn(
    "[podflow] NEXT_PUBLIC_SITE_URL is not set: no canonical URL or sitemap will be emitted and og:image will not point at a public host. Set it for production deployments.",
  );
}

/** Origin of the optional Web Vitals collector (see src/components/web-vitals.tsx). */
function vitalsOrigin(): string | null {
  try {
    const raw = process.env.NEXT_PUBLIC_VITALS_ENDPOINT;
    return raw ? new URL(raw).origin : null;
  } catch {
    return null;
  }
}

/**
 * Content-Security-Policy without nonces (the page is statically prerendered, so a
 * per-request nonce is not available). Next.js's own bootstrap scripts and React's
 * style attributes need 'unsafe-inline'; everything else is locked to this origin.
 * When the authenticated app and API calls arrive, extend `connect-src` with the
 * API and Supabase origins deliberately rather than loosening the policy.
 */
const connectSources = ["'self'", vitalsOrigin()].filter(Boolean).join(" ");

const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  `connect-src ${connectSources}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Legacy equivalent of CSP frame-ancestors.
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
];

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    // The development server needs eval/websocket sources for HMR, so the policy is production-only.
    if (!isProduction) return [];
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
