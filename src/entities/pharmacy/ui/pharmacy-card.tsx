"use client";

import { Cross, Clock, Sparkles } from "lucide-react";
import { FavoriteButton } from "@/features/favorites";
import { PharmacyNavigationDialog } from "@/features/pharmacy-navigation";
import { cn } from "@/shared";
import { useMapStore } from "@/shared/model/use-map-store";
import { Badge } from "@/shared/ui/badge";
import {
  getPharmacyStatus,
  formatPharmacyHours,
  type Pharmacy,
  type TimeFilter,
} from "@/entities/pharmacy";

interface PharmacyCardProps {
  pharmacy: Pharmacy;
  timeFilter: TimeFilter;
  onClick?: () => void;
}

export function PharmacyCard({
  pharmacy,
  timeFilter,
  onClick,
}: PharmacyCardProps) {
  const flyTo = useMapStore((state) => state.flyTo);

  const { status, statusColor, minutesUntilClose } = getPharmacyStatus(
    pharmacy.data_hours,
    pharmacy.open_until_tomorrow ?? null,
    pharmacy.next_day_close_time ?? null,
    timeFilter,
  );

  if (status === "closed" && timeFilter === "now") return null;

  const isOpen = status === "open" || status === "scheduled";
  const isClosingSoon = status === "closing-soon";
  const isScheduled = status === "scheduled";

  const handleCardClick = () => {
    onClick?.();
    if (pharmacy.latitude && pharmacy.longitude) {
      flyTo([pharmacy.longitude, pharmacy.latitude], 16, pharmacy.id);
    }
  };

  return (
    <div
      className={cn(
        "group flex p-3 rounded-xl bg-card border border-border",
        "hover:border-primary/40 hover:bg-accent/50",
        "transition-all duration-200 shadow-sm",
        isClosingSoon && "border-amber-500/40"
      )}
    >
      <button
        type="button"
        onClick={handleCardClick}
        className="flex items-start gap-3 flex-1 min-w-0 text-left cursor-pointer rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <div
          className={cn(
            "flex items-center justify-center rounded-lg shrink-0 size-10 transition-colors",
            isClosingSoon
              ? "bg-amber-500/10 text-amber-600"
              : isOpen
                ? "bg-primary/10 text-primary"
                : "bg-muted text-muted-foreground"
          )}
        >
          <Cross className="size-5" />
        </div>

        <div className="flex flex-col flex-1 min-w-0 gap-1">
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-col gap-0.5 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3
                  className={cn(
                    "text-sm font-bold leading-tight truncate",
                    isOpen ? "text-card-foreground" : "text-muted-foreground"
                  )}
                >
                  {pharmacy.name}
                </h3>
                {!isScheduled && (
                  <span
                    className={cn(
                      "inline-flex items-center text-[10px] px-1.5 py-0.5 rounded-md font-bold shrink-0 uppercase tracking-wide",
                      statusColor
                    )}
                  >
                    {isClosingSoon
                      ? `Κλείνει σε ${minutesUntilClose}'`
                      : isOpen
                        ? "Ανοιχτό"
                        : "Κλειστό"}
                  </span>
                )}
              </div>

              {pharmacy.is_frequent_duty && (
                <Badge
                  variant="secondary"
                  className="w-fit gap-1 px-1.5 py-0 text-[10px] font-semibold bg-amber-500/15 text-amber-600 border-amber-500/30 shrink-0"
                >
                  <Sparkles className="size-2.5" />
                  Συχνά
                </Badge>
              )}
            </div>

            {typeof pharmacy.distance_km === "number" &&
              pharmacy.distance_km > 0 && (
                <span className="text-xs font-medium text-muted-foreground whitespace-nowrap shrink-0 ml-auto">
                  {pharmacy.distance_km.toFixed(1)}km
                </span>
              )}
          </div>

          <div className="flex flex-col gap-0.5">
            {pharmacy.data_hours && pharmacy.data_hours.length > 0 && (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="size-3 shrink-0" />
                <span className="truncate">
                  Εφημερεύει: {formatPharmacyHours(pharmacy.data_hours)}
                </span>
              </span>
            )}

            <p className="text-xs text-muted-foreground leading-snug truncate">
              {pharmacy.address}
            </p>
          </div>
        </div>
      </button>

      <div className="flex flex-col gap-1 shrink-0 self-center ml-1">
        <FavoriteButton pharmacyId={pharmacy.id} size="sm" />
        <PharmacyNavigationDialog
          pharmacy={pharmacy}
          compact
          triggerVariant="ghost"
          triggerLabel="Οδηγίες"
          className={cn(
            "hover:bg-primary/20 hover:text-primary",
            "transition-all text-muted-foreground"
          )}
        />
      </div>
    </div>
  );
}
