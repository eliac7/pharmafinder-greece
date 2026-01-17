"use client";

import { useQueryState, parseAsStringLiteral } from "nuqs";
import { TIME_OPTIONS, type TimeFilter } from "@/entities/pharmacy";
import { cn } from "@/shared";

const LABELS: Record<TimeFilter, string> = {
  now: "Τώρα",
  today: "Σήμερα",
  tomorrow: "Αύριο",
};

export function TimeFilterChips() {
  const [time, setTime] = useQueryState<TimeFilter>(
    "time",
    parseAsStringLiteral(TIME_OPTIONS).withDefault("now")
  );

  return (
    <div className="flex items-center gap-2 w-full">
      {TIME_OPTIONS.map((option) => {
        const isSelected = time === option;
        return (
          <button
            key={option}
            onClick={() => setTime(option)}
            className={cn(
              "flex-1 px-4 py-1.5 rounded-full text-sm font-medium transition-all",
              "border focus:outline-none focus:ring-2 focus:ring-primary/20",
              isSelected
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-transparent text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
            )}
          >
            {LABELS[option]}
          </button>
        );
      })}
    </div>
  );
}
