import type { Metadata } from "next";
import { ArtifactSection } from "@/components/marketing/artifact-section";
import { Capabilities } from "@/components/marketing/capabilities";
import { ChatSection } from "@/components/marketing/chat-section";
import { ClosingCta } from "@/components/marketing/closing-cta";
import { ConnectSection } from "@/components/marketing/connect-section";
import { Hero } from "@/components/marketing/hero";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { TrustStrip } from "@/components/marketing/trust-strip";
import { UseCases } from "@/components/marketing/use-cases";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: SITE_TITLE },
  description: SITE_DESCRIPTION,
  // A canonical URL is only emitted once NEXT_PUBLIC_SITE_URL names a real host.
  ...(siteUrl ? { alternates: { canonical: "/" } } : {}),
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    locale: "en_US",
    ...(siteUrl ? { url: "/" } : {}),
  },
  twitter: {
    // `twitter-image.tsx` supplies the (generated) share image.
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
};

// Structured data. Deliberately minimal: PodFlow is unreleased, so there is no
// price, rating, review or download URL, and `url` is only set once a canonical
// origin is configured.
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: SITE_NAME,
  description: SITE_DESCRIPTION,
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  ...(siteUrl ? { url: new URL("/", siteUrl).toString() } : {}),
};

export default function Home() {
  return (
    <div id="top" className="flex min-h-screen flex-col">
      <a
        href="#main"
        className="sr-only rounded-lg bg-ink px-4 py-2 text-sm font-medium text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50"
      >
        Skip to content
      </a>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <SiteHeader />
      <main id="main" tabIndex={-1} className="flex-1 outline-none">
        <Hero />
        <TrustStrip />
        <HowItWorks />
        <Capabilities />
        <ArtifactSection />
        <ChatSection />
        <ConnectSection />
        <UseCases />
        <ClosingCta />
      </main>
      <SiteFooter />
    </div>
  );
}
