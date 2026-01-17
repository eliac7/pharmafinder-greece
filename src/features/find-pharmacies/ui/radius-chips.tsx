"use client";

import { useQueryState, parseAsInteger } from "nuqs";
import { RADIUS_OPTIONS, DEFAULT_RADIUS } from "@/entities/pharmacy";
import { cn } from "@/shared";

export function RadiusChips() {
  const [radius, setRadius] = useQueryState<number>(
    "radius",
    parseAsInteger.withDefault(DEFAULT_RADIUS)
  );

  return (
    <div className="flex items-center gap-2 w-full">
      {RADIUS_OPTIONS.map((option) => {
        const isSelected = radius === option;
        return (
          <button
            key={option}
            onClick={() => setRadius(option)}
            className={cn(
              "flex-1 px-3 py-1.5 rounded-full text-sm font-medium transition-all",
              "border focus:outline-none focus:ring-2 focus:ring-primary/20",
              isSelected
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-transparent text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
            )}
          >
            {option}km
          </button>
        );
      })}
    </div>
  );
}
