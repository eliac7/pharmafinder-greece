 "use client";

import { Button } from "@/shared/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { MouseEvent } from "react";

export function BackButton() {
  const { back, push } = useRouter();

  const navigateBackOrHome = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    if (typeof window !== "undefined" && window.history.length > 1) {
      back();
    } else {
      push("/");
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="rounded-full hover:bg-muted/50"
      onClick={navigateBackOrHome}
      aria-label="Πίσω"
    >
      <ArrowLeft className="size-5" />
    </Button>
  );
}
