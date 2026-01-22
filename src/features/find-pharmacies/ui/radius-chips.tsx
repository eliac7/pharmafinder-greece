"use client";

import { useQueryState, parseAsInteger } from "nuqs";
import { RADIUS_OPTIONS, DEFAULT_RADIUS } from "@/entities/pharmacy";
import { cn } from "@/shared";

export function RadiusChips({ fullWidth = false }: { fullWidth?: boolean }) {
  const [radius, setRadius] = useQueryState<number>(
    "radius",
    parseAsInteger.withDefault(DEFAULT_RADIUS)
  );

  return (
    <div className="contents">
      {RADIUS_OPTIONS.map((option) => {
        const isSelected = radius === option;
        return (
          <button
            key={option}
            onClick={() => setRadius(option)}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm font-medium transition-all",
              fullWidth ? "flex-1 w-full text-center" : "whitespace-nowrap",
              "border focus:outline-none focus:ring-2 focus:ring-primary/20",
              isSelected
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-sidebar-accent/50 text-muted-foreground border-border hover:bg-sidebar-accent hover:text-foreground"
            )}
          >
            {option}km
          </button>
        );
      })}
    </div>
  );
}
