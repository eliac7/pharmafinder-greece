"use client";

import AppContainer from "@/components/maps/AppContainer";
import LoadingAnimation from "@/components/global/LoadingAnimation";
import { useFilters } from "@/context/FiltersContext";
import { usePharmacies } from "@/hooks/usePharmacies";
import dynamic from "next/dynamic";

const FiltersNOSSR = dynamic(
  () => import("@/components/global/FiltersComponent"),
  {
    ssr: false,
  },
);

function Page() {
  const { searchType, radiusQuery, cityQuery, cityLabel, timeQuery } =
    useFilters();

  const {
    data: pharmacyResponse,
    isError,
    isLoading,
    isPending,
    error,
  } = usePharmacies({
    searchType,
    radius: radiusQuery,
    citySlug: cityQuery,
    city: cityLabel,
    time: timeQuery,
  });

  return (
    <>
      {isPending && <LoadingAnimation />}
      <FiltersNOSSR />
      <AppContainer
        pharmacies={pharmacyResponse?.data || []}
        count={pharmacyResponse?.count || 0}
        isError={isError}
        error={error}
        isLoading={isLoading}
      />
    </>
  );
}

export default Page;
