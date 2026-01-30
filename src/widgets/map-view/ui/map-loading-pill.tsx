"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/shared/lib/hooks/utils";

interface MapLoadingPillProps {
  isLoading: boolean;
  text?: string;
  className?: string;
}

export function MapLoadingPill({
  isLoading,
  text = "Αναζήτηση...",
  className,
}: MapLoadingPillProps) {
  return (
    <div
      className={cn(
        "absolute top-5 left-1/2 -translate-x-1/2 z-20",
        "flex items-center gap-2 px-4 py-2 rounded-full",
        "bg-[rgba(20,20,30,0.7)] backdrop-blur-sm",
        "border border-white/10",
        "shadow-lg shadow-black/20",
        "transition-all duration-300 ease-out",
        isLoading
          ? "opacity-100 translate-y-0"
          : "opacity-0 -translate-y-2 pointer-events-none",
        className,
      )}
    >
      <Loader2 className="size-4 text-white animate-spin" />
      <span className="text-sm font-medium text-white whitespace-nowrap">
        {text}
      </span>
    </div>
  );
}
