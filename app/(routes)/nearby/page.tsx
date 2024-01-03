"use client";

import MainDataContainer from "@/components/main-data-container";
import MainDataContainerSkeleton from "@/components/main-data-container-skeleton";
import { usePharmacies } from "@/hooks/usePharmacies";

function Page({ searchParams }: { searchParams: { radius: string } }) {
  const radius = searchParams.radius?.toString() || "3";

  const { data, isLoading, error } = usePharmacies({
    endpoint: "nearby_pharmacies",
    radius,
  });

  if (isLoading) return <MainDataContainerSkeleton />;
  if (error) return <div>Error: {error.message}</div>;
  if (!data) return <div>No data available</div>;

  return (
    <MainDataContainer
      pharmacies={data?.data ?? []}
      count={data.count}
      radius={radius}
    />
  );
}

export default Page;
