"use client";

import { useState } from "react";
import { Toaster } from "react-hot-toast";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ReactQueryStreamedHydration } from "@tanstack/react-query-next-experimental";

import { LocationProvider } from "@/context/LocationContext";
import { ThemeProvider } from "next-themes";

function Providers({ children }: React.PropsWithChildren) {
  const [client] = useState(new QueryClient());

  return (
    <QueryClientProvider client={client}>
      <ReactQueryStreamedHydration>
        <ThemeProvider key="PHARMAFINDER_DARK_MODE" defaultTheme="light">
          <LocationProvider>
            <Toaster position="bottom-right" />
            {children}
          </LocationProvider>
        </ThemeProvider>
      </ReactQueryStreamedHydration>
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
    </QueryClientProvider>
  );
}

export default Providers;
