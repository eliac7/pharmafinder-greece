"use client";

import { Info, Sparkles } from "lucide-react";

import { cn } from "@/shared";
import { Badge } from "@/shared/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";

const FREQUENT_DUTY_EXPLANATION =
  "Εφημερεύει πιο συχνά από τα περισσότερα φαρμακεία της περιοχής.";

export function FrequentDutyBadge({
  className,
  variant = "compact",
}: {
  className?: string;
  variant?: "compact" | "full";
}) {
  return (
    <Popover>
      <PopoverTrigger
        asChild
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        <span
          role="button"
          tabIndex={0}
          aria-label={`Συχνά εφημερεύει. ${FREQUENT_DUTY_EXPLANATION}`}
          title={FREQUENT_DUTY_EXPLANATION}
          className={cn(
            "inline-flex w-fit max-w-full cursor-help outline-none",
            "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 rounded-md",
            className,
          )}
        >
          <Badge
            variant="secondary"
            className={cn(
              "w-fit shrink-0 gap-1 border-amber-500/30 bg-amber-500/15 text-amber-600",
              variant === "compact"
                ? "px-1.5 py-0 text-[10px] font-semibold"
                : "gap-1.5 px-2.5 py-1 text-xs font-semibold",
            )}
          >
            <Sparkles
              className={variant === "compact" ? "size-2.5" : "size-3.5"}
              aria-hidden="true"
            />
            {variant === "compact" ? "Συχνά εφημερεύει" : "ΣΥΧΝΑ ΕΦΗΜΕΡΕΥΟΝ"}
            <Info
              className={variant === "compact" ? "size-3" : "size-3.5"}
              aria-hidden="true"
            />
          </Badge>
        </span>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="start"
        className="w-64 text-left"
        onClick={(event) => event.stopPropagation()}
      >
        <p className="text-xs font-semibold">Συχνά εφημερεύει</p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          {FREQUENT_DUTY_EXPLANATION}
        </p>
      </PopoverContent>
    </Popover>
  );
}
