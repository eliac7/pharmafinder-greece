"use client";

import type { ReactNode } from "react";
import { MapPin } from "lucide-react";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { type Pharmacy, type TimeFilter, PharmacyCard } from "@/entities/pharmacy";
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
            <span className="text-xs text-muted-foreground">{subtitle}</span>
          </div>
        </div>
        {headerRight}
      </div>

      <div className="flex flex-col gap-3 pb-2">
        {pharmacies.map((pharmacy) => (
          <PharmacyCard
            key={pharmacy.id}
            pharmacy={pharmacy}
            timeFilter={timeFilter}
            onClick={handleCardClick}
          />
        ))}
      </div>
    </ScrollArea>
  );
}
