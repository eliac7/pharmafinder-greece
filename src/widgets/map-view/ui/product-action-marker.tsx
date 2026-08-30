"use client";

import { Cross, Heart, Loader2 } from "lucide-react";
import { useFavorites } from "@/features/favorites";
import { cn } from "@/shared";

type ProductMarkerStatus = "open" | "closing-soon" | "closed" | "scheduled";

export function ProductActionMarkerContent({
  publicId,
  status,
  isLoading = false,
}: {
  publicId?: string | null;
  status: ProductMarkerStatus;
  isLoading?: boolean;
}) {
  const { favoriteIds } = useFavorites();
  const isFavorite = Boolean(publicId && favoriteIds.includes(publicId));
  const isClosingSoon = status === "closing-soon";
  const isOpen = status === "open" || status === "scheduled";

  return (
    <div className="group relative flex cursor-pointer flex-col items-center">
      <div
        aria-busy={isLoading}
        className={cn(
          "relative flex items-center justify-center rounded-full border-2 p-2.5 transition-transform hover:scale-110",
          isFavorite
            ? "border-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.5)]"
            : isClosingSoon
              ? "border-amber-600"
              : "border-sidebar",
          isClosingSoon
            ? "bg-amber-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.6)]"
            : isOpen
              ? "bg-primary text-primary-foreground shadow-[0_0_15px_hsl(166_18%_73%/0.6)]"
              : "bg-muted text-muted-foreground shadow-md",
          isLoading && "opacity-80",
        )}
      >
        {isLoading ? (
          <Loader2 className="size-6 animate-spin" aria-hidden="true" />
        ) : (
          <Cross className="size-6" />
        )}
        {isFavorite && !isLoading && (
          <Heart className="absolute -top-1 -right-1 size-3.5 fill-rose-500 text-rose-500" />
        )}
      </div>
      <div
        className={cn(
          "-mt-0.5 h-3 w-1",
          isClosingSoon
            ? "bg-amber-500/60"
            : isOpen
              ? "bg-primary/60"
              : "bg-muted/60",
        )}
      />
    </div>
  );
}
