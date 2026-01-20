import { Badge } from "@/shared/ui/badge";
import { cn } from "@/shared";
import type { PharmacyStatusResult } from "@/entities/pharmacy";

type Props = {
  status: PharmacyStatusResult["status"];
  minutes: number | null;
};

const STATUS_CONFIG = {
  open: {
    label: "Ανοιχτό Τώρα",
    className:
      "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/25",
    dot: "bg-emerald-500",
  },
  "closing-soon": {
    label: (minutes: number | null) => `Κλείνει σε ${minutes}'`,
    className:
      "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/25",
    dot: "bg-amber-500",
  },
  scheduled: {
    label: "Προγραμματισμένο",
    className:
      "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20 hover:bg-blue-500/25",
    dot: "bg-blue-500",
  },
  closed: {
    label: "Κλειστό",
    className:
      "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/20 hover:bg-rose-500/25",
    dot: "bg-rose-500",
  },
} as const;

export function PharmacyStatusBadge({ status, minutes }: Props) {
  const current = STATUS_CONFIG[status] ?? STATUS_CONFIG.closed;

  const label =
    status === "closing-soon" && typeof current.label === "function"
      ? current.label(minutes)
      : typeof current.label === "string"
        ? current.label
        : STATUS_CONFIG.closed.label;

  return (
    <Badge
      variant="outline"
      className={cn("gap-2 px-3 py-1.5 text-sm", current.className)}
    >
      <span className="relative flex h-2 w-2">
        {status === "open" && (
          <span
            className={cn(
              "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
              current.dot
            )}
          />
        )}
        <span
          className={cn(
            "relative inline-flex rounded-full h-2 w-2",
            current.dot
          )}
        />
      </span>
      {label}
    </Badge>
  );
}
