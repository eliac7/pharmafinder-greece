"use client";
import { useQuery } from "@tanstack/react-query";
import { IPharmacyResponse } from "@/lib/interfaces";
import { useLocationContext } from "@/context/LocationContext";

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
  return response.json();
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

  // Data are valid until midnight
  const now = new Date();
  const midnight = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    0,
    0,
    0
  );
  const staleTime = midnight.getTime() - now.getTime();

  return useQuery<IPharmacyResponse, Error>({
    queryKey: queryKey,
    queryFn: () => fetchPharmacies(endpoint, updatedParams),
    refetchOnWindowFocus: false,
    staleTime: staleTime,
    retry: false,
  });
};
