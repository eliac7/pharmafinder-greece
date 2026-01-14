"use client";

import { useEffect, useRef } from "react";
import { type Pharmacy, type TimeFilter } from "@/entities/pharmacy";
import { useCityPharmaciesStore } from "@/entities/pharmacy/model/use-city-pharmacies";
import { useLocationStore } from "@/features/locate-user";
import { MapWithControls } from "@/widgets/map-view";

interface CityPageClientProps {
  initialPharmacies: Pharmacy[];
  citySlug: string;
  timeFilter: TimeFilter;
  cityCenter: [number, number];
}

export function CityPageClient({
  initialPharmacies,
  citySlug,
  timeFilter,
  cityCenter,
}: CityPageClientProps) {
  const initialized = useRef(false);
  const lastLocationRef = useRef<{ lat: number; lng: number } | null>(null);

  const { initialize, pharmacies, refetchWithLocation } =
    useCityPharmaciesStore();
  const { latitude, longitude } = useLocationStore();

  if (!initialized.current) {
    initialize(citySlug, timeFilter, initialPharmacies);

    const hasDistances = initialPharmacies.some(
      (p) => typeof p.distance_km === "number" && p.distance_km > 0
    );

    if (hasDistances && latitude && longitude) {
      lastLocationRef.current = { lat: latitude, lng: longitude };
    }
    initialized.current = true;
  }

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
