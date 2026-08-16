"use client";

import { useQuery } from "@tanstack/react-query";
import {
  pharmacyApi,
  type Pharmacy,
  type TimeFilter,
} from "@/entities/pharmacy";

interface UseCityPharmaciesOptions {
  citySlug: string;
  timeFilter: TimeFilter;
  initialData?: Pharmacy[];
  userLocation?: { lat: number; lng: number } | null;
  enabled?: boolean;
}

export function useCityPharmacies({
  citySlug,
  timeFilter,
  initialData,
  userLocation,
  enabled = true,
}: UseCityPharmaciesOptions) {
  return useQuery({
    queryKey: [
      "city-pharmacies",
      citySlug,
      timeFilter,
      userLocation?.lat,
      userLocation?.lng,
    ],
    queryFn: () =>
      pharmacyApi.getCityPharmacies(
        citySlug,
        timeFilter,
        userLocation?.lat,
        userLocation?.lng
      ),
    initialData,
    enabled: !!citySlug && enabled,
    refetchInterval: 1000 * 60 * 5,
    staleTime: 1000 * 60 * 1,
  });
}
