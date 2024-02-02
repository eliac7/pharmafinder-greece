"use client";
import MainDataContainer from "@/components/maps/AppContainer";
import { usePharmacies } from "@/hooks/usePharmacies";
import {
  useQueryState,
  parseAsString,
  parseAsStringEnum,
  parseAsFloat,
} from "nuqs";
import { useMemo, useState } from "react";
import LoadingAnimation from "@/components/maps/LoadingAnimation";
import Filters from "@/components/global/FiltersComponent";
import { CitiesData } from "@/data/CitiesData";

export interface IFiltersMobileProps {
  isFilterMobileOpen: boolean;
  setIsFilterMobileOpen: (isFilterMobileOpen: boolean) => void;
}

function Page() {
  const [searchType, setSearchType] = useQueryState(
    "searchType",
    parseAsStringEnum<"nearby" | "city">(["nearby", "city"]).withDefault(
      "nearby",
    ),
  );

  const [radiusQuery, setRadiusQuery] = useQueryState<number>(
    "radius",
    parseAsFloat.withDefault(3),
  );
  const [cityQuery, setCityQuery] = useQueryState<string>(
    "city",
    parseAsString.withDefault(""),
  );

  const cityLabel = useMemo(() => {
    if (cityQuery) {
      const city = CitiesData.find((city) => city.value === cityQuery);
      return city?.label || "";
    }
    return "";
  }, [cityQuery]);

  const [timeQuery, setTimeQuery] = useQueryState(
    "time",
    parseAsStringEnum<"now" | "today" | "tomorrow" | "all">([
      "now",
      "today",
      "tomorrow",
      "all",
    ]).withDefault("now"),
  );

  const [isFilterMobileOpen, setIsFilterMobileOpen] = useState<boolean>(false);

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
      <Filters
        searchType={searchType}
        onSearchTypeChange={setSearchType}
        radiusQuery={radiusQuery}
        onRadiusChange={setRadiusQuery}
        cityQuery={cityQuery}
        cityLabel={cityLabel}
        onCityChange={setCityQuery}
        timeQuery={timeQuery}
        onTimeChange={setTimeQuery}
        isFilterMobileOpen={isFilterMobileOpen}
        setIsFilterMobileOpen={setIsFilterMobileOpen}
      />
      <MainDataContainer
        pharmacies={pharmacyResponse?.data || []}
        count={pharmacyResponse?.count || 0}
        isError={isError}
        error={error}
        radius={radiusQuery.toString()}
        cityLabel={cityLabel.split(" ").slice(0, -1).join(" ")}
        isLoading={isLoading}
        searchType={searchType}
        isFilterMobileOpen={isFilterMobileOpen}
        setIsFilterMobileOpen={setIsFilterMobileOpen}
      />
    </>
  );
}

export default Page;
