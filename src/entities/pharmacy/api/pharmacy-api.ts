import { fetchAPI } from "@/shared/api/base";
import { PharmaciesWithCount } from "../model/types";

interface GetNearbyPharmaciesParams {
  latitude: number;
  longitude: number;
  radius?: number;
  time?: "now" | "today" | "tomorrow";
}

export async function getNearbyPharmaciesOnDuty({
  latitude,
  longitude,
  radius = 5,
  time = "now",
}: GetNearbyPharmaciesParams): Promise<PharmaciesWithCount> {
  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    radius: radius.toString(),
    time,
  });

  return fetchAPI<PharmaciesWithCount>(`/nearby_pharmacies/on_duty?${params}`);
}
