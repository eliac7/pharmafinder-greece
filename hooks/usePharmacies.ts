"use client";
import { useLocationContext } from "@/context/LocationContext";
import { IPharmacyResponse } from "@/lib/interfaces";
import { fetchPharmacies } from "@/actions/fetch-pharmacies";
import { useQuery } from "@tanstack/react-query";

export const usePharmacies = ({
  searchType,
  radius,
  citySlug,
  city,
  time,
}: {
  searchType: "nearby" | "city";
  radius?: number;
  citySlug?: string;
  city?: string;
  time?: "now" | "today" | "tomorrow" | "all";
}) => {
  const { location } = useLocationContext();

  let endpoint = "";
  let params: { [key: string]: any } = {};
  let shouldFetch = true;

  if (searchType === "nearby") {
    endpoint =
      time === "now"
        ? "nearby_pharmacies_with_hours_now"
        : time === "today"
          ? "nearby_pharmacies_with_hours_today"
          : time === "tomorrow"
            ? "nearby_pharmacies_with_hours_tomorrow"
            : "nearby_pharmacies";
    params = {
      latitude: location.latitude,
      longitude: location.longitude,
      radius,
    };
  } else if (searchType === "city") {
    if (!citySlug && !city) {
      shouldFetch = false;
    } else {
      endpoint = "city";
      params = {
        city_slug: citySlug,
        city_name: city,
        time,
        // if location is available, add it to the query
        ...(location.latitude && { latitude: location.latitude }),
        ...(location.longitude && { longitude: location.longitude }),
      };
    }
  }

  const queryKey = ["pharmacies", endpoint, params];

  return useQuery<IPharmacyResponse, Error>({
    queryKey: queryKey,
    queryFn: () => fetchPharmacies(endpoint, params),
    enabled: shouldFetch,
  });
};
