import { cityApi } from "@/entities/city/api/city.api";
import { pharmacyApi } from "@/entities/pharmacy/api/pharmacy.api";

import { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ time?: "now" | "today" | "tomorrow" }>;
}

export async function generateMetadata({
  params,
  searchParams,
}: Props): Promise<Metadata> {
  const { slug } = await params;
  const { time } = await searchParams;
  const city = await cityApi.getCityBySlug(slug);
  return {
    title: `Εφημερεύοντα Φαρμακεία ${city.data.name}`,
    description: `Βρείτε όλα τα ανοιχτά και εφημερεύοντα φαρμακεία στην πόλη ${
      city.data.name
    } ${time ? `την ${time}` : ""}.`,
  };
}

export default async function EfimeriesPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { time } = await searchParams;
  const timeFilter = time || "now";

  const pharmacies = await pharmacyApi.getCityPharmacies(slug, timeFilter);

  if (!pharmacies || pharmacies.length === 0) {
    return <div>Δεν βρέθηκαν φαρμακεία</div>;
  }

  return <pre>{JSON.stringify(pharmacies, null, 2)}</pre>;
}
