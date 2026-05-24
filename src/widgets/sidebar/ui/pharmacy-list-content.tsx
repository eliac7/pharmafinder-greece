"use client";

import { useMemo, type ReactNode } from "react";
import { MapPin, Phone, ShieldCheck } from "lucide-react";
import { Virtuoso } from "react-virtuoso";
import {
  getArrivalBadgeText,
  getPharmacyArrivalEstimate,
  getPharmacyStatus,
  sortPharmaciesByRecommendation,
  type Pharmacy,
  type TimeFilter,
  PharmacyCard,
} from "@/entities/pharmacy";
import { useSidebar } from "@/shared/ui/sidebar";
import { useVisualViewportSnapPoints } from "@/shared/lib/hooks/use-visual-viewport-snap-points";
import { useLocationStore } from "@/features/locate-user";
import { useFavorites } from "@/features/favorites";
import { PharmacyNavigationDialog } from "@/features/pharmacy-navigation";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared";

interface PharmacyListContentProps {
  pharmacies: Pharmacy[];
  count: number;
  timeFilter: TimeFilter;
  subtitle: string;
  headerRight?: ReactNode;
}

export function PharmacyListContent({
  pharmacies,
  count,
  timeFilter,
  subtitle,
  headerRight,
}: PharmacyListContentProps) {
  const { isMobile, setSnapPoint } = useSidebar();
  const { defaultSnap } = useVisualViewportSnapPoints();
  const { latitude, longitude } = useLocationStore();
  const { favoriteIds } = useFavorites();
  const userLocation = useMemo(
    () => (latitude && longitude ? { latitude, longitude } : null),
    [latitude, longitude]
  );
  const visiblePharmacies = useMemo(
    () => {
      const filtered = pharmacies.filter((pharmacy) => {
        const { status } = getPharmacyStatus(
          pharmacy.data_hours,
          pharmacy.open_until_tomorrow ?? null,
          pharmacy.next_day_close_time ?? null,
          timeFilter
        );

        return !(status === "closed" && timeFilter === "now");
      });

      return sortPharmaciesByRecommendation(filtered, {
        timeFilter,
        userLocation,
        favoriteIds,
      });
    },
    [favoriteIds, pharmacies, timeFilter, userLocation]
  );
  const bestPharmacy = visiblePharmacies[0] ?? null;
  const bestArrivalEstimate =
    bestPharmacy && timeFilter === "now"
      ? getPharmacyArrivalEstimate(bestPharmacy, timeFilter, userLocation)
      : null;

  const handleCardClick = () => {
    if (isMobile) {
      setTimeout(() => {
        setSnapPoint(null);
        setTimeout(() => {
          setSnapPoint(defaultSnap);
        }, 50);
      }, 100);
    }
  };

  return (
    <div className="flex-1 min-h-0">
      <Virtuoso
        className="h-full"
        data={visiblePharmacies}
        overscan={400}
        computeItemKey={(_, pharmacy) => pharmacy.id}
        components={{
          Header: () => (
            <div>
              <div className="flex items-center justify-between py-3 px-1 pr-3">
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center size-8 rounded-lg bg-primary/10">
                    <MapPin className="size-4 text-primary" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-foreground">
                      {count} {count === 1 ? "φαρμακείο" : "φαρμακεία"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {subtitle}
                    </span>
                  </div>
                </div>
                {headerRight}
              </div>

              {bestPharmacy && (
                <div className="mb-3 mr-3 rounded-xl border border-primary/20 bg-primary/10 p-3">
                  <div className="flex items-start gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                      <ShieldCheck className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                        Καλύτερη επιλογή
                      </p>
                      <p className="truncate text-sm font-semibold text-foreground">
                        {bestPharmacy.name}
                      </p>
                      {bestArrivalEstimate && (
                        <p
                          className={cn(
                            "text-xs font-medium",
                            bestArrivalEstimate.risk === "safe" &&
                              "text-emerald-700 dark:text-emerald-400",
                            bestArrivalEstimate.risk === "tight" &&
                              "text-amber-700 dark:text-amber-400",
                            bestArrivalEstimate.risk === "too_late" &&
                              "text-destructive",
                            bestArrivalEstimate.risk === "unknown" &&
                              "text-muted-foreground"
                          )}
                        >
                          {getArrivalBadgeText(bestArrivalEstimate)}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-9 rounded-lg gap-1.5"
                      asChild
                    >
                      <a href={`tel:${bestPharmacy.phone}`}>
                        <Phone className="size-3.5" />
                        Κλήση
                      </a>
                    </Button>
                    <PharmacyNavigationDialog
                      pharmacy={bestPharmacy}
                      arrivalEstimate={bestArrivalEstimate}
                      triggerVariant="default"
                      triggerLabel="Οδηγίες"
                      className="h-9 rounded-lg gap-1.5"
                    />
                  </div>
                </div>
              )}
            </div>
          ),
          Footer: () => <div className="h-2" />,
        }}
        itemContent={(index, pharmacy) => {
          return (
            <div
              className={
                index === visiblePharmacies.length - 1 ? "pb-2 pr-3" : "pb-3 pr-3"
              }
            >
              <PharmacyCard
                pharmacy={pharmacy}
                timeFilter={timeFilter}
                onClick={handleCardClick}
              />
            </div>
          );
        }}
      />
    </div>
  );
}
