"use client";

import { useQuery } from "@tanstack/react-query";
import { pharmacyApi } from "../api/pharmacy.api";

export function usePharmacies(lat: number | null, lng: number | null) {
  return useQuery({
    queryKey: ["nearby", lat, lng],
    queryFn: () => pharmacyApi.getNearbyOnDuty(lat!, lng!),
    enabled: !!lat && !!lng,
    staleTime: 1000 * 60 * 5,
    placeholderData: (prev) => prev,
  });
}
