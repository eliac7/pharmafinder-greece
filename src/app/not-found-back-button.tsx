"use client";

import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/shared/ui/button";

export function NotFoundBackButton() {
  const router = useRouter();
  const [canGoBack, setCanGoBack] = useState(false);

  useEffect(() => {
    setCanGoBack(window.history.length > 1);
  }, []);

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
