"use client";

import StatsCard from "./StatsSectionCard";
import { usePharmaciesStats } from "@/hooks/usePharmaciesStats";

function Stats() {
  const endpoints = {
    totalPharmacies: "total_pharmacies",
    totalPharmaciesOnDutyToday: "total_pharmacies_on_duty_today",
    cityMostPharmacies: "city_with_most_pharmacies",
    prefectureMostPharmacies: "prefecture_with_most_pharmacies",
  };
  const { isLoading: isLoadingTotalPharmacies, data: dataTotalPharmacies } =
    usePharmaciesStats(endpoints.totalPharmacies);
  const {
    isLoading: isLoadingTotalPharmaciesOnDutyToday,
    data: dataTotalPharmaciesOnDutyToday,
  } = usePharmaciesStats(endpoints.totalPharmaciesOnDutyToday);
  const {
    isLoading: isLoadingCityMostPharmacies,
    data: dataCityMostPharmacies,
  } = usePharmaciesStats(endpoints.cityMostPharmacies);
  const {
    isLoading: isLoadingPrefectureMostPharmacies,
    data: dataPrefectureMostPharmacies,
  } = usePharmaciesStats(endpoints.prefectureMostPharmacies);

  return (
    <section className="flex flex-col items-center justify-center bg-[#35424a] py-5">
      <div className="container mx-auto flex h-full w-full flex-col items-center justify-center gap-y-6 text-center text-white">
        <h1 className="py-2 text-center text-2xl font-bold text-white">
          Στατιστικά στοιχεία με μια ματιά
        </h1>

        <div className="lg:grid-cols-3 container mx-auto mt-6 grid grid-cols-1 gap-4 px-2 tablet:px-0 md:grid-cols-2">
          <StatsCard
            title="Συνολικά Φαρμακεία"
            isLoading={isLoadingTotalPharmacies}
            data={dataTotalPharmacies}
          />
          <StatsCard
            title="Συνολικά Εφημερεύοντα Φαρμακεία για σήμερα"
            isLoading={isLoadingTotalPharmaciesOnDutyToday}
            data={dataTotalPharmaciesOnDutyToday}
          />
          <StatsCard
            title="Η πόλη με τα περισσότερα φαρμακεία είναι: "
            isLoading={isLoadingCityMostPharmacies}
            data={dataCityMostPharmacies}
          />
          <StatsCard
            title="Η περιφέρεια με τα περισσότερα φαρμακεία είναι: "
            isLoading={isLoadingPrefectureMostPharmacies}
            data={dataPrefectureMostPharmacies}
          />
        </div>
      </div>
    </section>
  );
}

export default Stats;
