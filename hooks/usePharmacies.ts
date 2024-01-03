"use client";
import { useQuery } from "@tanstack/react-query";
import { IPharmacyResponse } from "@/lib/interfaces";
import { useLocationContext } from "@/context/LocationContext";

const fetchPharmacies = async (
  endpoint: string,
  params: { [key: string]: string }
): Promise<IPharmacyResponse> => {
  const query = new URLSearchParams(params).toString();
  const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/${endpoint}?${query}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Network response was not ok");
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

  return useQuery<IPharmacyResponse, Error>({
    queryKey: ["pharmacies", endpoint, updatedParams],
    queryFn: () => fetchPharmacies(endpoint, updatedParams),
  });
};
