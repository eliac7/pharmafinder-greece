"use client";

import { MapPin, Heart } from "lucide-react";
import { useFavorites } from "@/features/favorites";
import { cn } from "@/shared";

interface PharmacyMapMarkerContentProps {
  pharmacyId: number;
  pharmacyName: string;
}

export function PharmacyMapMarkerContent({
  pharmacyId,
  pharmacyName,
}: PharmacyMapMarkerContentProps) {
  const { favoriteIds } = useFavorites();
  const isFavorite = favoriteIds.includes(pharmacyId);

  return (
    <div className="relative group cursor-pointer">
      <span
        className={cn(
          "absolute inline-flex h-full w-full animate-ping rounded-full opacity-50",
          isFavorite ? "bg-rose-500" : "bg-primary"
        )}
      />
      <div
        className={cn(
          "relative flex items-center justify-center p-3 rounded-full shadow-xl ring-4 ring-background transform group-hover:scale-110 transition-transform",
          isFavorite
            ? "bg-rose-500 text-white"
            : "bg-primary text-primary-foreground"
        )}
      >
        <MapPin className="size-6" />
        {isFavorite && (
          <Heart className="absolute -top-1 -right-1 size-4 fill-rose-500 text-white bg-white rounded-full p-0.5" />
        )}
      </div>
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1 bg-foreground text-background text-xs font-bold rounded-full whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
        {pharmacyName}
      </div>
    </div>
  );
}
