import { cityApi } from "@/entities/city";
import { pharmacyApi, type TimeFilter } from "@/entities/pharmacy";
import { CitySidebar } from "@/widgets/sidebar";
import { Sidebar } from "@/shared/ui/sidebar";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ slug: string; time?: string[] }>;
}

function isValidTime(t: string): t is TimeFilter {
  return ["now", "today", "tomorrow"].includes(t);
}

export default async function CitySidebarPage({ params }: Props) {
  const { slug, time } = await params;

  const timeSegment = time?.[0];

  const timeFilter: TimeFilter =
    timeSegment && isValidTime(timeSegment) ? timeSegment : "now";

  const [cityRes, pharmaciesRes] = await Promise.all([
    cityApi.getCityBySlug(slug),
    pharmacyApi.getCityPharmacies(slug, timeFilter),
  ]);

  if (!cityRes.data) {
    return notFound();
  }

  const pharmacies = pharmaciesRes || [];

  return (
    <Sidebar>
      <CitySidebar
        cityName={cityRes.data.name}
        citySlug={slug}
        activeTime={timeFilter}
        pharmacies={pharmacies}
      />
    </Sidebar>
  );
}
