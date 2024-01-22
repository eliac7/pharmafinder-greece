"use client";
import { useQuery } from "@tanstack/react-query";
import { IPharmacyResponse } from "@/lib/interfaces";
import { useLocationContext } from "@/context/LocationContext";
import { decrypt } from "@/app/api/utils/cryptoUtils";

const fetchPharmacies = async (
  endpoint: string,
  params: { [key: string]: string },
): Promise<IPharmacyResponse> => {
  const query = new URLSearchParams(params).toString();
  const url = `/api/pharmacies/${endpoint}?${query}`;
  const response = await fetch(url);

  if (!response.ok) {
    const errorResponse = await response.json();
    if (errorResponse.message) {
      throw new Error(errorResponse.message);
    }
    throw new Error("Error fetching data");
  }

  const encryptedData = await response.json();

  const secretKey = process.env.NEXT_PUBLIC_CRYPTO_SECRET!;
  const decryptedData = decrypt(encryptedData, secretKey);

  return JSON.parse(decryptedData);
};
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
  time?: "now" | "today" | "tomorrow";
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
          : "nearby_pharmacies_with_hours_tomorrow";
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
