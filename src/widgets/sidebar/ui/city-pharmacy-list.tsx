"use client";

import { type TimeFilter, type Pharmacy } from "@/entities/pharmacy";
import { PharmacyListContent } from "./pharmacy-list-content";

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
    <PharmacyListContent
      pharmacies={pharmacies}
      count={count}
      timeFilter={timeFilter}
      subtitle={`Βρέθηκαν ${count} φαρμακεία`}
    />
  );
}