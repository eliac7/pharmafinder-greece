"use client";

import { useEffect, useRef } from "react";
import { type Pharmacy, type TimeFilter } from "@/entities/pharmacy";
import { useCityPharmaciesStore } from "@/entities/pharmacy/model/use-city-pharmacies";
import { useLocationStore } from "@/features/locate-user";
import dynamic from "next/dynamic";

const MapWithControls = dynamic(
  () => import("@/widgets/map-view").then((mod) => mod.MapWithControls),
  {
    ssr: false,
    loading: () => <div className="h-full w-full bg-muted/20 animate-pulse" />,
  }
);

interface CityPharmaciesMapProps {
  initialPharmacies: Pharmacy[];
  citySlug: string;
  timeFilter: TimeFilter;
  cityCenter: [number, number];
}

export function CityPharmaciesMap({
  initialPharmacies,
  citySlug,
  timeFilter,
  cityCenter,
}: CityPharmaciesMapProps) {
  const lastLocationRef = useRef<{ lat: number; lng: number } | null>(null);

  const { initialize, pharmacies, refetchWithLocation } =
    useCityPharmaciesStore();
  const { latitude, longitude } = useLocationStore();

  useEffect(() => {
    initialize(citySlug, timeFilter, initialPharmacies);

    const hasDistances = initialPharmacies.some(
      (p) => typeof p.distance_km === "number" && p.distance_km > 0
    );
    if (hasDistances && latitude && longitude) {
      lastLocationRef.current = { lat: latitude, lng: longitude };
    }
  }, [
    citySlug,
    timeFilter,
    initialPharmacies,
    initialize,
    latitude,
    longitude,
  ]);

  useEffect(() => {
    if (!latitude || !longitude) return;

    const last = lastLocationRef.current;
    const locationChanged =
      !last ||
      Math.abs(last.lat - latitude) > 0.0001 ||
      Math.abs(last.lng - longitude) > 0.0001;

    if (locationChanged) {
      lastLocationRef.current = { lat: latitude, lng: longitude };
      refetchWithLocation(latitude, longitude);
    }
  }, [latitude, longitude, refetchWithLocation]);

  const displayPharmacies =
    pharmacies.length > 0 ? pharmacies : initialPharmacies;

  return (
    <MapWithControls
      center={cityCenter}
      zoom={14}
      minZoom={10}
      pharmacies={displayPharmacies}
      timeFilter={timeFilter}
      citySlug={citySlug}
    />
  );
}
