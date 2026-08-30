"use client";

import { useSyncExternalStore } from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/shared/ui/button";

function subscribe(callback: () => void) {
  window.addEventListener("popstate", callback);
  return () => window.removeEventListener("popstate", callback);
}

export function NotFoundBackButton() {
  const router = useRouter();
  const canGoBack = useSyncExternalStore(
    subscribe,
    () => window.history.length > 1,
    () => false
  );

  return (
    <Button
      variant="outline"
      size="lg"
      className="gap-2"
      disabled={!canGoBack}
      onClick={() => router.back()}
    >
      <ArrowLeft className="size-5" />
      Πίσω
    </Button>
  );
}
