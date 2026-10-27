"use client";

import dynamic from "next/dynamic";

// Loaded on demand so the web-vitals code is not part of every page's first-load JS.
const WebVitals = dynamic(() => import("./web-vitals").then((module) => module.WebVitals), {
  ssr: false,
});

export function WebVitalsLoader() {
  return <WebVitals />;
}
