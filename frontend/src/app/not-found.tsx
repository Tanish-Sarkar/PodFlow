import type { Metadata } from "next";
import Link from "next/link";
import { PodFlowMark } from "@/components/marketing/icons";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main
      id="main"
      className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center sm:px-6"
    >
      <PodFlowMark className="size-12" />
      <p className="mt-8 font-mono text-sm font-semibold text-evidence">404</p>
      <h1 className="mt-3 max-w-xl text-3xl leading-tight font-semibold tracking-[-0.02em] text-balance text-ink sm:text-4xl">
        That page is not part of PodFlow yet.
      </h1>
      <p className="mt-4 max-w-md text-base leading-relaxed text-body">
        PodFlow is still being built, so most of it does not exist. The home page explains what is
        planned.
      </p>
      <Link href="/" className="btn btn-primary mt-8">
        Back to the home page
      </Link>
    </main>
  );
}
