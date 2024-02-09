"use client";

import Filters from "@/components/global/FiltersComponent";
import AppContainer from "@/components/maps/AppContainer";
import LoadingAnimation from "@/components/global/LoadingAnimation";
import { useFilters } from "@/context/FiltersContext";
import { usePharmacies } from "@/hooks/usePharmacies";

function Page() {
  const { searchType, radiusQuery, cityQuery, cityLabel, timeQuery } =
    useFilters();

  const {
    data: pharmacyResponse,
    isError,
    isLoading,
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
      {isLoading && <LoadingAnimation />}
      <Filters />
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
