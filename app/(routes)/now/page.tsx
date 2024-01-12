"use client";
import MainDataContainer from "@/components/main-data-container";
import { usePharmacies } from "@/hooks/usePharmacies";
import { toast } from "react-hot-toast";
import { useQueryState, parseAsString } from "nuqs";

function Page() {
  const [radiusQuery, setRadiusQuery] = useQueryState(
    "radius",
    parseAsString.withDefault("3")
  );

  const { data, isLoading, error } = usePharmacies({
    endpoint: "nearby_pharmacies_with_hours_now",
    radius: radiusQuery,
  });

  return (
    <MainDataContainer
      pharmacies={data?.data ?? []}
      count={data?.count}
      radius={radiusQuery}
      setRadiusQuery={setRadiusQuery}
      isLoading={isLoading}
      isError={error}
    />
  );
}

export default Page;
