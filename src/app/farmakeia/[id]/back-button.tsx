 "use client";

import { Button } from "@/shared/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { MouseEvent } from "react";

export function BackButton() {
  const router = useRouter();

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="rounded-full hover:bg-muted/50"
      onClick={handleClick}
      aria-label="Πίσω"
    >
      <ArrowLeft className="size-5" />
    </Button>
  );
}

