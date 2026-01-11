"use client";

import { Navigation, Cross, Clock, RefreshCw, MapPin } from "lucide-react";
import { useQueryState, parseAsStringLiteral, parseAsInteger } from "nuqs";
import { useNearbyPharmacies } from "@/features/find-pharmacies/model/use-nearby-pharmacies";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { Skeleton } from "@/shared/ui/skeleton";
import { cn } from "@/shared/lib/hooks/utils";
import { useMapStore } from "@/shared/model/use-map-store";
import { Button } from "@/shared/ui/button";
import {
  TIME_OPTIONS,
  DEFAULT_RADIUS,
  type TimeFilter,
} from "@/entities/pharmacy/model/types";
import {
  getPharmacyStatus,
  formatPharmacyHours,
} from "@/entities/pharmacy/lib/status";

export function PharmacyList() {
  const { data, isLoading, error, refetch, isFetching } = useNearbyPharmacies();
  const flyTo = useMapStore((state) => state.flyTo);
  const [timeFilter] = useQueryState<TimeFilter>(
    "time",
    parseAsStringLiteral(TIME_OPTIONS).withDefault("now")
  );
  const [radius] = useQueryState(
    "radius",
    parseAsInteger.withDefault(DEFAULT_RADIUS)
  );

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 py-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex p-4 rounded-2xl bg-card gap-4">
            <Skeleton className="size-12 rounded-xl shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 p-4 text-center">
        <p className="text-sm text-destructive">
          Σφάλμα κατά τη φόρτωση των φαρμακείων.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="gap-2"
        >
          <RefreshCw className={cn("size-4", isFetching && "animate-spin")} />
          {isFetching ? "Φόρτωση..." : "Δοκιμάστε Ξανά"}
        </Button>
      </div>
    );
  }

  if (!data?.data || data.data.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        Πατήστε Εντόπισέ Με για να βρείτε κοντινά φαρμακεία.
      </div>
    );
  }

  const count = data.count;

  return (
    <ScrollArea className="flex-1">
      {/* Pharmacy count header */}
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
              σε ακτίνα {radius}km
            </span>
          </div>
        </div>
        {isFetching && (
          <RefreshCw className="size-4 text-muted-foreground animate-spin" />
        )}
      </div>

      <div className="flex flex-col gap-3 pb-2">
        {data.data.map((pharmacy) => {
          const { status, minutesUntilClose } = getPharmacyStatus(
            pharmacy.data_hours,
            pharmacy.open_until_tomorrow ?? null,
            pharmacy.next_day_close_time ?? null,
            timeFilter
          );

          // Only filter out closed pharmacies when viewing "now"
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
                    {pharmacy.distance_km && (
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
        })}
      </div>
    </ScrollArea>
  );
}
