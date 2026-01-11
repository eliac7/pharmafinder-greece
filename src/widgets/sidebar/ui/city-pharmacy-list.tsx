"use client";

import { Navigation, Cross, Clock, MapPin } from "lucide-react";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { cn } from "@/shared/lib/hooks/utils";
import { useMapStore } from "@/shared/model/use-map-store";
import { Button } from "@/shared/ui/button";
import {
  type TimeFilter,
  type Pharmacy,
} from "@/entities/pharmacy/model/types";
import {
  getPharmacyStatus,
  formatPharmacyHours,
} from "@/entities/pharmacy/lib/status";

interface CityPharmacyListProps {
  pharmacies: Pharmacy[];
  count: number;
  timeFilter: TimeFilter;
}

export function CityPharmacyList({
  pharmacies,
  count,
  timeFilter,
}: CityPharmacyListProps) {
  const flyTo = useMapStore((state) => state.flyTo);

  if (!pharmacies || pharmacies.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        Δεν βρέθηκαν φαρμακεία για αυτή την επιλογή.
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1">
      <div className="flex items-center justify-between py-3 px-1">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center size-8 rounded-lg bg-primary/10">
            <MapPin className="size-4 text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-foreground">
              {count} {count === 1 ? "φαρμακείο" : "φαρμακεία"}
            </span>
            <span className="text-xs text-muted-foreground">
              Βρέθηκαν {count} αποτελέσματα
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 pb-2">
        {pharmacies.map((pharmacy) => {
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

          return (
            <div
              key={pharmacy.id}
              onClick={() => {
                if (pharmacy.latitude && pharmacy.longitude) {
                  flyTo([pharmacy.longitude, pharmacy.latitude], 16);
                }
              }}
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
                    <h3
                      className={cn(
                        "text-sm font-bold leading-tight",
                        isOpen
                          ? "text-card-foreground"
                          : "text-muted-foreground"
                      )}
                    >
                      {pharmacy.name}
                    </h3>
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
                        {formatPharmacyHours(pharmacy.data_hours)}
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
        })}
      </div>
    </ScrollArea>
  );
}
