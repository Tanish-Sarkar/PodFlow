import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, isIndexable, siteUrl } from "@/lib/site";
import { WebVitalsLoader } from "@/components/web-vitals-loader";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// Web Vitals reporting is opt-in, so the client code is not shipped unless it is used.
const reportWebVitals =
  Boolean(process.env.NEXT_PUBLIC_VITALS_ENDPOINT) || process.env.NODE_ENV === "development";

export const metadata: Metadata = {
  ...(siteUrl ? { metadataBase: siteUrl } : {}),
  applicationName: SITE_NAME,
  title: {
    default: SITE_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  robots: isIndexable ? { index: true, follow: true } : { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#F7F7F3",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {reportWebVitals ? <WebVitalsLoader /> : null}
        {children}
      </body>
    </html>
  );
}
