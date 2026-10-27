import type { Metadata } from "next";
import DashboardGuard from "./guard";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your PodFlow knowledge workspace.",
  robots: { index: false, follow: false },
};

/**
 * Dashboard page — server component that supplies metadata.
 * The client-side route guard (guard.tsx) handles the dev-preview
 * session check and renders the full dashboard shell.
 */
export default function DashboardPage() {
  return <DashboardGuard />;
}
