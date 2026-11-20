import type { MetadataRoute } from "next";
import { isIndexable, siteUrl } from "@/lib/site";

// `/` is the only public route today. Without a configured canonical host (or
// outside production) the sitemap is intentionally empty instead of listing
// guessed URLs.
export default function sitemap(): MetadataRoute.Sitemap {
  if (!siteUrl || !isIndexable) return [];
  return [{ url: new URL("/", siteUrl).toString() }];
}
