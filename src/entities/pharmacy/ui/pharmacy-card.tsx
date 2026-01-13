"use client";

import { Navigation, Cross, Clock, Sparkles } from "lucide-react";
import { cn } from "@/shared/lib/hooks/utils";
import { useMapStore } from "@/shared/model/use-map-store";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { type Pharmacy, type TimeFilter } from "../model/types";
import { getPharmacyStatus, formatPharmacyHours } from "../lib/status";

interface PharmacyCardProps {
  pharmacy: Pharmacy;
  timeFilter: TimeFilter;
}

export function PharmacyCard({ pharmacy, timeFilter }: PharmacyCardProps) {
  const flyTo = useMapStore((state) => state.flyTo);

  const { status, minutesUntilClose } = getPharmacyStatus(
    pharmacy.data_hours,
    pharmacy.open_until_tomorrow ?? null,
    pharmacy.next_day_close_time ?? null,
    timeFilter
  );

  if (status === "closed" && timeFilter === "now") return null;

  const isOpen = status === "open" || status === "scheduled";
  const isClosingSoon = status === "closing-soon";
  const isScheduled = status === "scheduled";

  const handleCardClick = () => {
    if (pharmacy.latitude && pharmacy.longitude) {
      flyTo([pharmacy.longitude, pharmacy.latitude], 16);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={cn(
        "group flex p-4 rounded-2xl bg-card border border-border",
        "hover:border-primary/40 hover:bg-accent/50",
        "transition-all duration-200 cursor-pointer shadow-sm",
        isClosingSoon && "border-amber-500/40"
      )}
    >
      <div className="flex items-start gap-3 w-full">
        <div
          className={cn(
            "flex items-center justify-center rounded-xl shrink-0 size-11 transition-colors",
            isClosingSoon
              ? "bg-amber-500/10 text-amber-600"
              : isOpen
              ? "bg-primary/10 text-primary"
              : "bg-muted text-muted-foreground"
          )}
        >
          <Cross className="size-6" />
        </div>

        <div className="flex flex-col flex-1 min-w-0 gap-1.5">
          <div className="flex justify-between items-start gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <h3
                className={cn(
                  "text-sm font-bold leading-tight",
                  isOpen ? "text-card-foreground" : "text-muted-foreground"
                )}
              >
                {pharmacy.name}
              </h3>
              {pharmacy.is_frequent_duty && (
                <Badge
                  variant="secondary"
                  className="gap-1 px-1.5 py-0 text-[10px] font-semibold bg-amber-500/15 text-amber-600 border-amber-500/30 shrink-0"
                >
                  <Sparkles className="size-2.5" />
                  Συχνά
                </Badge>
              )}
            </div>
            {typeof pharmacy.distance_km === "number" &&
              pharmacy.distance_km > 0 && (
                <span className="text-xs font-medium text-muted-foreground whitespace-nowrap shrink-0">
                  {pharmacy.distance_km.toFixed(1)}km
                </span>
              )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {!isScheduled && (
              <span
                className={cn(
                  "inline-flex items-center text-xs px-2 py-0.5 rounded-md font-semibold shrink-0",
                  isClosingSoon
                    ? "bg-amber-500/15 text-amber-600"
                    : isOpen
                    ? "bg-primary/15 text-primary"
                    : "bg-muted text-muted-foreground border border-border"
                )}
              >
                {isClosingSoon
                  ? `Κλείνει σε ${minutesUntilClose} λεπτά`
                  : isOpen
                  ? "Ανοιχτό"
                  : "Κλειστό"}
              </span>
            )}
            {pharmacy.data_hours && pharmacy.data_hours.length > 0 && (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="size-3" />
                Εφημερεύει: {formatPharmacyHours(pharmacy.data_hours)}
              </span>
            )}
          </div>

          <p className="text-xs text-muted-foreground leading-snug">
            {pharmacy.address}
          </p>
        </div>

        <Button
          variant="outline"
          size="icon"
          className={cn(
            "size-9 rounded-full border-border shrink-0 self-center hover:bg-primary/20 hover:text-primary hover:border-primary",
            "transition-all"
          )}
          onClick={(e) => {
            e.stopPropagation();
            if (pharmacy.latitude && pharmacy.longitude) {
              window.open(
                `https://www.google.com/maps/dir/?api=1&destination=${pharmacy.latitude},${pharmacy.longitude}`,
                "_blank"
              );
            }
          }}
        >
          <Navigation className="size-4" />
        </Button>
      </div>
    </div>
  );
}
