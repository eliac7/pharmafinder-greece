"use client";

import MainDataContainer from "@/components/main-data-container";
import { usePharmacies } from "@/hooks/usePharmacies";
import { parseAsString, useQueryState } from "nuqs";

function Page() {
  const [radiusQuery, setRadiusQuery] = useQueryState(
    "radius",
    parseAsString.withDefault("3")
  );

  const { data, isLoading, error } = usePharmacies({
    endpoint: "nearby_pharmacies",
    radius: radiusQuery,
  });

  if (error) return <div>Error: {error.message}</div>;

  return (
    <MainDataContainer
      pharmacies={data?.data ?? []}
      count={data?.count}
      isLoading={isLoading}
      radius={radiusQuery}
      setRadiusQuery={setRadiusQuery}
    />
  );
}

export default Page;
