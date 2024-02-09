"use client";

import { useState } from "react";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

import { LocationProvider } from "@/context/LocationContext";
import { ThemeProvider } from "next-themes";
import { CustomToaster } from "@/components/global/CustomToaster";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            staleTime: 1000 * 60 * 5, // 5 minutes
            refetchInterval: 1000 * 60 * 5,
            retry: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={client}>
      <ThemeProvider key="PHARMAFINDER_DARK_MODE">
        <LocationProvider>
          <CustomToaster position="bottom-right" />
          {children}
        </LocationProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
