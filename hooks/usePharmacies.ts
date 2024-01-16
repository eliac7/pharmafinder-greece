"use client";
import { useQuery } from "@tanstack/react-query";
import { IPharmacyResponse } from "@/lib/interfaces";
import { useLocationContext } from "@/context/LocationContext";
import { decrypt } from "@/app/api/utils/cryptoUtils";

const fetchPharmacies = async (
  endpoint: string,
  params: { [key: string]: string }
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
  endpoint,
  ...params
}: {
  endpoint: string;
  [key: string]: string;
}) => {
  const { location } = useLocationContext();

  let updatedParams: { [key: string]: string } = { ...params };

  if (location.latitude !== null && location.longitude !== null) {
    updatedParams.latitude = location.latitude.toString();
    updatedParams.longitude = location.longitude.toString();
  }

  const queryKey = [
    "pharmacies",
    endpoint,
    updatedParams,
    params.radius,
    params.time,
  ];

  return useQuery<IPharmacyResponse, Error>({
    queryKey: queryKey,
    queryFn: () => fetchPharmacies(endpoint, updatedParams),
    refetchOnWindowFocus: false,
    // for 10 minutes
    staleTime: 1000 * 60 * 10,
    retry: 2,
    refetchInterval: 1000 * 60 * 60,
  });
};
