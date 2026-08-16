"use client";

import { useQuery } from "@tanstack/react-query";

import { queryCityAction, type DutyTime } from "@/entities/pharmacy";

export function useProductCityPharmacies(citySlug: string, time: DutyTime) {
  return useQuery({
    queryKey: ["product-city-pharmacies", citySlug, time],
    queryFn: () => queryCityAction(citySlug, time),
    enabled: Boolean(citySlug),
    staleTime: 60_000,
    retry: false,
  });
}
