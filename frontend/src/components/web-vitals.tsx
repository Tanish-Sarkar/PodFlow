"use client";

import { useReportWebVitals } from "next/web-vitals";

/**
 * Optional Core Web Vitals reporting. Nothing is sent unless a collection
 * endpoint is configured via NEXT_PUBLIC_VITALS_ENDPOINT (its origin is added
 * to the CSP `connect-src` in next.config.ts). In development the metrics are
 * logged to the console instead.
 */
const endpoint = process.env.NEXT_PUBLIC_VITALS_ENDPOINT;

function report(metric: { id: string; name: string; value: number; rating?: string; navigationType?: string }) {
  if (endpoint) {
    const body = JSON.stringify({
      id: metric.id,
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      navigationType: metric.navigationType,
      path: window.location.pathname,
    });
    if (typeof navigator.sendBeacon === "function") {
      navigator.sendBeacon(endpoint, body);
    } else {
      void fetch(endpoint, { method: "POST", body, keepalive: true });
    }
  } else if (process.env.NODE_ENV === "development") {
    console.debug(`[web-vitals] ${metric.name}`, Math.round(metric.value * 100) / 100, metric.rating);
  }
}

export function WebVitals() {
  useReportWebVitals(report);
  return null;
}
