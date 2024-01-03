"use client";

import MainDataContainer from "@/components/main-data-container";
import { useQuery } from "@tanstack/react-query";
import { IPharmacyResponse } from "@/lib/interfaces";
import cities from "@/data/options.json";
import { calculateTimeUntilMidnight } from "@/lib/utils";
import { useLocationContext } from "@/context/LocationContext";
import { redirect } from "next/navigation";
import MainDataContainerSkeleton from "@/components/main-data-container-skeleton";

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
  searchParams: { date: string };
}) {
  if (
    !searchParams.date ||
    !["now", "today", "tomorrow"].includes(searchParams.date)
  ) {
    redirect(`/city/${params.city}?date=now`);
  }
  const { location } = useLocationContext();
  const isValidCity = cities.some((cityObj) => cityObj.value === params.city);
  const isLocationValid =
    location && location.latitude != null && location.longitude != null;

  const { isPending, isError, data, error } = useQuery({
    queryKey: ["pharmacies", params.city, searchParams.date, location],
    queryFn: () =>
      isLocationValid
        ? getPharmacies(params.city, searchParams.date, {
            latitude: location.latitude!,
            longitude: location.longitude!,
          })
        : getPharmacies(params.city, searchParams.date),
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
    return <MainDataContainerSkeleton isLoading={true} />;
  }
  if (isError) {
    return <div>Error: {error?.message}</div>;
  }

  if (!data || !data.data) {
    return <div>{data.message} </div>;
  }

  const count = data.count;
  const pharmacies = data.data;

  return (
    <MainDataContainer
      pharmacies={pharmacies}
      count={count}
      cityLabel={cityLabel}
    />
  );
}

export default Page;
