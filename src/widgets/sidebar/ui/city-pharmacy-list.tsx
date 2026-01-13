"use client";

import { MapPin } from "lucide-react";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { cn } from "@/shared";
import {
  type TimeFilter,
  type Pharmacy,
  useCityPharmaciesStore,
  PharmacyCard,
} from "@/entities/pharmacy";

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
        {pharmacies.map((pharmacy) => (
          <PharmacyCard
            key={pharmacy.id}
            pharmacy={pharmacy}
            timeFilter={timeFilter}
          />
        ))}
      </div>
    </ScrollArea>
  );
}
