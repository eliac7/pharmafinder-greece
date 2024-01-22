"use client";
import Filters from "@/components/global/filters";
import MainDataContainer from "@/components/maps/main-data-container";
import { usePharmacies } from "@/hooks/usePharmacies";
import { cities } from "@/data/cities";
import {
  useQueryState,
  parseAsString,
  parseAsStringEnum,
  parseAsFloat,
} from "nuqs";
import { useMemo } from "react";
import LoadingAnimation from "@/components/maps/loading-animation";

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
      const city = cities.find((city) => city.value === cityQuery);
      return city?.label || "";
    }
    return "";
  }, [cityQuery]);

  const [timeQuery, setTimeQuery] = useQueryState(
    "time",
    parseAsStringEnum<"now" | "today" | "tomorrow">([
      "now",
      "today",
      "tomorrow",
    ]).withDefault("now"),
  );

  const {
    data: pharmacyResponse,
    isError,
    isLoading,
    error,
  } = usePharmacies({
    searchType: searchType,
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
      />
    </>
  );
}

export default Page;
