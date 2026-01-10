import { useQuery } from "@tanstack/react-query";
import { useQueryState, parseAsFloat } from "nuqs";
import { getNearbyPharmaciesOnDuty } from "@/entities/pharmacy/api/pharmacy-api";

export function useNearbyPharmacies() {
  const [lat] = useQueryState("lat", parseAsFloat);
  const [lng] = useQueryState("lng", parseAsFloat);

  const isEnabled = !!lat && !!lng;

  return useQuery({
    queryKey: ["nearby-pharmacies", lat, lng],
    queryFn: () =>
      getNearbyPharmaciesOnDuty({
        latitude: lat!,
        longitude: lng!,
        radius: 5,
        time: "today",
      }),
    enabled: isEnabled,
    staleTime: 1000 * 60 * 5,
  });
}
