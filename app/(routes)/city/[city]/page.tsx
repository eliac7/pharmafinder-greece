"use client";

import MainDataContainer from "@/components/maps/main-data-container";
import { usePharmacies } from "@/hooks/usePharmacies";

import cities from "@/data/options.json";
import { parseAsString, useQueryState } from "nuqs";
import toast from "react-hot-toast";
import { redirect, useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
function Page({
  params,
  searchParams,
}: {
  params: {
    city: string;
  };
  searchParams: { date: string };
}) {
  const router = useRouter();
  const allowedDates = useMemo(() => ["now", "today", "tomorrow"], []);

  const [dateQuery, setDateQuery] = useQueryState(
    "date",
    parseAsString.withDefault("now")
  );
  const isValidCity = useMemo(
    () => cities.some((cityObj) => cityObj.value === params.city),
    [params.city]
  );

  const cityLabel = useMemo(() => {
    return cities.find((cityObj) => cityObj.value === params.city)?.label;
  }, [params.city]);

  useEffect(() => {
    if (!isValidCity) {
      toast.error("Η πόλη που ζητήσατε δεν βρέθηκε");
      router.push("/city/");
    }
  }, [isValidCity, router]);

  // Validate and set default for dateQuery
  useEffect(() => {
    const dateFromUrl = searchParams.date || "now";
    if (!allowedDates.includes(dateFromUrl)) {
      setDateQuery("now"); // Reset to default;
      toast.error(
        "Η τιμή που δώσατε για την παράμετρο 'date' δεν είναι έγκυρη. Παρακαλώ δώστε 'now', 'today' ή 'tomorrow'. Γίνεται ανακατεύθυνση στην τιμή 'now'.",
        {
          duration: 10000,
        }
      );
      router.push(`?date=now`, undefined);
    } else {
      setDateQuery(dateFromUrl);
    }
  }, [router, setDateQuery, searchParams.date, allowedDates]);

  const { data, isLoading, error } = usePharmacies({
    endpoint: "city",
    city_slug: params.city,
    city_name: cityLabel ?? "",
    time: dateQuery,
  });

  return (
    <MainDataContainer
      pharmacies={data?.data ?? []}
      count={data?.count}
      isLoading={isLoading}
      cityLabel={cityLabel}
      isError={error}
    />
  );
}

export default Page;
