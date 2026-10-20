/**
 * Public-site configuration shared by metadata, robots and sitemap.
 *
 * `NEXT_PUBLIC_SITE_URL` is the canonical origin of the deployed marketing site
 * (for example the production Vercel domain). It is intentionally optional: no
 * production domain has been decided, so when it is unset the site emits no
 * canonical URL, no sitemap entries and no absolute Open Graph URLs rather than
 * guessing a host.
 */

export const SITE_NAME = "PodFlow";

export const SITE_TITLE = "PodFlow: a knowledge workspace for evidence-linked research";

export const SITE_DESCRIPTION =
  "Bring videos, articles and documents together into an evidence-linked Knowledge Artifact. Present it, ask cited questions, and export it.";

function parseSiteUrl(raw: string | undefined): URL | null {
  const value = raw?.trim();
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url : null;
  } catch {
    return null;
  }
}

export const siteUrl: URL | null = parseSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);

/**
 * Only production deployments should be crawled. Vercel preview deployments and
 * local development builds are kept out of search indexes.
 */
export const isIndexable: boolean = process.env.VERCEL_ENV
  ? process.env.VERCEL_ENV === "production"
  : process.env.NODE_ENV === "production";
