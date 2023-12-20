"use client";

import MainDataContainer from "@/components/main-data-container";
import { useQuery } from "@tanstack/react-query";
import { IPharmacyResponse } from "@/lib/interfaces";
import cities from "@/data/options.json";
import { calculateTimeUntilMidnight } from "@/lib/utils";
import { useLocationContext } from "@/context/LocationContext";

async function getPharmacies(
  city: string,
  time: string,
  location?: { latitude: number; longitude: number }
): Promise<IPharmacyResponse> {
  let url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/city/${city}?time=${time}`;
  if (location && location.latitude && location.longitude) {
    url = `${url}&latitude=${location.latitude}&longitude=${location.longitude}`;
  }
  const pharmacies = await fetch(url);
  const res = (await pharmacies.json()) as IPharmacyResponse;
  return res;
}

function Page({
  params,
  searchParams,
}: {
  params: { city: string };
  searchParams: { time: string };
}) {
  const { location } = useLocationContext();
  const isValidCity = cities.some((cityObj) => cityObj.value === params.city);
  const isLocationValid =
    location && location.latitude != null && location.longitude != null;

  const { isPending, isError, data, error } = useQuery({
    queryKey: ["pharmacies", params.city, searchParams.time, location],
    queryFn: () =>
      isLocationValid
        ? getPharmacies(params.city, searchParams.time, {
            latitude: location.latitude!,
            longitude: location.longitude!,
          })
        : getPharmacies(params.city, searchParams.time),
    staleTime: calculateTimeUntilMidnight(),
    enabled: isValidCity && isLocationValid,
  });

  if (!isValidCity) {
    return <div>City not found</div>;
  }

  const cityLabel = cities.find(
    (cityObj) => cityObj.value === params.city
  )?.label;

  if (isPending) {
    return <div>Loading...</div>;
  }
  if (isError) {
    return <div>Error: {error?.message}</div>;
  }

  if (!data || !data.data) {
    return <div>Not available</div>;
  }

  const count = data.count;
  const pharmacies = data.data;

  return (
    <div className="mt-20 grid">
      <MainDataContainer
        pharmacies={pharmacies}
        count={count}
        cityLabel={cityLabel}
      />
    </div>
  );
}

export default Page;
