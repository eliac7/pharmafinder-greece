import { cityApi } from "@/entities/city";
import { pharmacyApi, type TimeFilter } from "@/entities/pharmacy";
import { getLocationFromCookies } from "@/features/locate-user/lib/location-cookie";
import { Sidebar } from "@/shared/ui/sidebar";
import { CitySidebar } from "@/widgets/sidebar";
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

  const userLocation = await getLocationFromCookies();

  const [cityRes, pharmaciesRes] = await Promise.all([
    cityApi.getCityBySlug(slug),
    pharmacyApi.getCityPharmacies(
      slug,
      timeFilter,
      userLocation?.latitude,
      userLocation?.longitude
    ),
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
