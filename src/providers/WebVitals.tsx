"use client";

import { useReportWebVitals } from "next/web-vitals";
import { reportWebVitals } from "@/lib/analytics";

/**
 * Web Vitals tracking component
 * Automatically reports Core Web Vitals to Google Analytics
 */
export function WebVitals() {
  useReportWebVitals((metric) => {
    reportWebVitals(metric);
  });
  return null;
}
