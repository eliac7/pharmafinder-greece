/**
 * Google Analytics 4 utilities for Next.js
 * Standardized implementation using @next/third-parties
 */

import { sendGAEvent } from "@next/third-parties/google";
// Environment variables
export const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-XXXXXXXXXX";
/**
 * Check if GA should be enabled (not in development)
 */
export const isAnalyticsEnabled = (): boolean => {
  return (
    process.env.NODE_ENV !== "development" &&
    Boolean(GA_MEASUREMENT_ID) &&
    GA_MEASUREMENT_ID !== "G-XXXXXXXXXX"
  );
};
/**
 * Web Vitals metric interface
 */
export interface WebVitalsMetric {
  id: string;
  name: string;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  delta: number;
  label?: string;
  attribution?: Record<string, unknown>;
}
/**
 * Custom Google Analytics event interface
 */
export interface GAEvent {
  action: string;
  category?: string;
  label?: string;
  value?: number;
  custom_parameters?: Record<string, unknown>;
}
/**
 * Reports Web Vitals metrics to Google Analytics
 */
export function reportWebVitals(metric: WebVitalsMetric): void {
  if (!isAnalyticsEnabled()) {
    if (process.env.NODE_ENV === "development") {
      console.info("Web Vitals (dev):", metric);
    }
    return;
  }
  // Only report actual web vitals metrics
  if (metric.label !== "web-vital") {
    return;
  }
  // Prepare metric value based on type
  // CLS needs to be multiplied by 1000 for analytics
  const value = Math.round(
    metric.name === "CLS" ? metric.value * 1000 : metric.value
  );
  // Send to GA4 using @next/third-parties
  sendGAEvent({
    event_name: "web_vitals",
    event_category: "Web Vitals",
    event_label: metric.name,
    value: value,
    metric_id: metric.id,
    metric_rating: metric.rating,
    metric_delta: metric.delta,
    custom_parameters: metric.attribution || {},
  });
}
/**
 * Sends custom events to Google Analytics
 */
export function trackEvent(event: GAEvent): void {
  if (!isAnalyticsEnabled()) {
    return;
  }
  sendGAEvent({
    event_name: event.action,
    event_category: event.category || "engagement",
    event_label: event.label,
    value: event.value,
    custom_parameters: event.custom_parameters,
  });
}
/**
 * Tracks page views (usually handled automatically by GoogleAnalytics component)
 */
export function trackPageView(url: string, title?: string): void {
  if (!isAnalyticsEnabled()) {
    return;
  }
  sendGAEvent({
    event_name: "page_view",
    page_location: url,
    page_title: title || document.title,
  });
}
/**
 * Common event trackers for typical website interactions
 */
export const analytics = {
  // Track external link clicks
  trackExternalLink: (url: string, text?: string) => {
    trackEvent({
      action: "click_external_link",
      category: "engagement",
      label: url,
      custom_parameters: {
        link_text: text,
        link_url: url,
      },
    });
  },
  // Track download events
  trackDownload: (filename: string, fileType?: string) => {
    trackEvent({
      action: "download",
      category: "engagement",
      label: filename,
      custom_parameters: {
        file_name: filename,
        file_type: fileType,
      },
    });
  },
  // Track form submissions
  trackFormSubmission: (formName: string, success: boolean = true) => {
    trackEvent({
      action: "form_submission",
      category: "engagement",
      label: formName,
      value: success ? 1 : 0,
      custom_parameters: {
        form_name: formName,
        submission_success: success,
      },
    });
  },
  // Track search queries
  trackSearch: (query: string, results?: number) => {
    trackEvent({
      action: "search",
      category: "engagement",
      label: query,
      value: results,
      custom_parameters: {
        search_term: query,
        search_results: results,
      },
    });
  },
  // Track social media interactions
  trackSocialInteraction: (
    network: string,
    action: string,
    target?: string
  ) => {
    trackEvent({
      action: "social_interaction",
      category: "social",
      label: `${network}_${action}`,
      custom_parameters: {
        social_network: network,
        social_action: action,
        social_target: target,
      },
    });
  },
};
/**
 * Type definitions for gtag (for backward compatibility if needed)
 */
declare global {
  interface Window {
    gtag?: (
      command: string,
      targetId: string,
      config?: Record<string, unknown>
    ) => void;
  }
}
