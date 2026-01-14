"use client";

import { ReactNode, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { GoogleAnalytics as NextGoogleAnalytics } from "@next/third-parties/google";
import { useReportWebVitals } from "next/web-vitals";
import {
  GA_MEASUREMENT_ID,
  isAnalyticsEnabled,
  reportWebVitals,
} from "@/shared/lib/analytics";
import { NuqsAdapter } from "nuqs/adapters/next/app";

export { reportWebVitals } from "@/shared/lib/analytics";

/**
 * Web Vitals tracking component
 * Automatically reports Core Web Vitals to Google Analytics
 */
function WebVitals() {
  useReportWebVitals((metric) => {
    reportWebVitals(metric);
  });
  return null;
}

/**
 * Google Analytics component using @next/third-parties
 * Optimized for performance with proper environment checking
 */
function GoogleAnalytics() {
  if (!isAnalyticsEnabled()) {
    return null;
  }
  return <NextGoogleAnalytics gaId={GA_MEASUREMENT_ID} />;
}

function ReactQueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: true,
            staleTime: 1000 * 60 * 5, // 5 minutes
            refetchInterval: 1000 * 60 * 5,
            retry: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

type ProvidersProps = {
  children: ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  return (
    <ReactQueryProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <NuqsAdapter>{children}</NuqsAdapter>
        <GoogleAnalytics />
        <WebVitals />
      </ThemeProvider>
    </ReactQueryProvider>
  );
}
