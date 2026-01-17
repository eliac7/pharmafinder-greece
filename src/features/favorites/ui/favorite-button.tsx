"use client";

import { Heart } from "lucide-react";
import { cn } from "@/shared";
import { Button } from "@/shared/ui/button";
import { useFavorites } from "../model/use-favorites-store";

interface FavoriteButtonProps {
  pharmacyId: number;
  className?: string;
  size?: "sm" | "default";
}

export function FavoriteButton({
  pharmacyId,
  className,
  size = "default",
}: FavoriteButtonProps) {
  const { favoriteIds, toggleFavorite } = useFavorites();
  const favorited = favoriteIds.includes(pharmacyId);

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        toggleFavorite(pharmacyId);
      }}
      className={cn(
        "shrink-0 transition-all",
        size === "sm" ? "size-8" : "size-9",
        favorited
          ? "text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
          : "text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10",
        className
      )}
      aria-label={
        favorited ? "Αφαίρεση από αγαπημένα" : "Προσθήκη στα αγαπημένα"
      }
    >
      <Heart
        className={cn(
          size === "sm" ? "size-4" : "size-5",
          favorited && "fill-current"
        )}
      />
    </Button>
  );
}
