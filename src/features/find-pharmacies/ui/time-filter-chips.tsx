"use client";

import { useQueryState, parseAsStringLiteral } from "nuqs";
import { TIME_OPTIONS, type TimeFilter } from "@/entities/pharmacy";
import { cn } from "@/shared";

const LABELS: Record<TimeFilter, string> = {
  now: "Τώρα",
  today: "Σήμερα",
  tomorrow: "Αύριο",
};

export function TimeFilterChips({
  fullWidth = false,
}: {
  fullWidth?: boolean;
}) {
  const [time, setTime] = useQueryState<TimeFilter>(
    "time",
    parseAsStringLiteral(TIME_OPTIONS).withDefault("now")
  );

  return (
    <div className="contents">
      {TIME_OPTIONS.map((option) => {
        const isSelected = time === option;
        return (
          <button
            key={option}
            onClick={() => setTime(option)}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-medium transition-all",
              fullWidth ? "flex-1 w-full text-center" : "whitespace-nowrap",
              "border focus:outline-none focus:ring-2 focus:ring-primary/20",
              isSelected
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-sidebar-accent/50 text-muted-foreground border-border hover:bg-sidebar-accent hover:text-foreground"
            )}
          >
            {LABELS[option]}
          </button>
        );
      })}
    </div>
  );
}
