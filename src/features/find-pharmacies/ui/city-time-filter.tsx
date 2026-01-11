"use client";

import Link from "next/link";
import { type TimeFilter } from "@/entities/pharmacy/model/types";
import { cn } from "@/shared/lib/hooks/utils";

const LABELS: Record<TimeFilter, string> = {
  now: "Τώρα",
  today: "Σήμερα",
  tomorrow: "Αύριο",
};

interface CityTimeFilterProps {
  citySlug: string;
  activeTime: TimeFilter;
}

export function CityTimeFilter({ citySlug, activeTime }: CityTimeFilterProps) {
  const options: TimeFilter[] = ["now", "today", "tomorrow"];

  return (
    <div className="flex items-center gap-2 w-full">
      {options.map((option) => {
        const isSelected = activeTime === option;
        const href =
          option === "now"
            ? `/efimeries/${citySlug}`
            : `/efimeries/${citySlug}/${option}`;

        return (
          <Link
            key={option}
            href={href}
            className={cn(
              "flex-1 px-4 py-1.5 rounded-full text-sm font-medium transition-all text-center",
              "border focus:outline-none focus:ring-2 focus:ring-primary/20",
              isSelected
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-transparent text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
            )}
          >
            {LABELS[option]}
          </Link>
        );
      })}
    </div>
  );
}
