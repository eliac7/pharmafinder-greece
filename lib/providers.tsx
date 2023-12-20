"use client";

import { LocationProvider } from "@/context/LocationContext";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ReactQueryStreamedHydration } from "@tanstack/react-query-next-experimental";
import { useState } from "react";

function Providers({ children }: React.PropsWithChildren) {
  const [client] = useState(new QueryClient());

  return (
    <QueryClientProvider client={client}>
      <ReactQueryStreamedHydration>
        <LocationProvider>{children}</LocationProvider>
      </ReactQueryStreamedHydration>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default Providers;
