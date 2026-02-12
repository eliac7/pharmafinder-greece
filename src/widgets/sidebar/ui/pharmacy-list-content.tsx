"use client";

import { useMemo, type ReactNode } from "react";
import { MapPin } from "lucide-react";
import { Virtuoso } from "react-virtuoso";
import {
  getPharmacyStatus,
  type Pharmacy,
  type TimeFilter,
  PharmacyCard,
} from "@/entities/pharmacy";
import { useSidebar } from "@/shared/ui/sidebar";
import { useVisualViewportSnapPoints } from "@/shared/lib/hooks/use-visual-viewport-snap-points";

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
  const visiblePharmacies = useMemo(
    () =>
      pharmacies.filter((pharmacy) => {
        const { status } = getPharmacyStatus(
          pharmacy.data_hours,
          pharmacy.open_until_tomorrow ?? null,
          pharmacy.next_day_close_time ?? null,
          timeFilter
        );

        return !(status === "closed" && timeFilter === "now");
      }),
    [pharmacies, timeFilter]
  );

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
