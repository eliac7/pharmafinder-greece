import { cityApi } from "@/entities/city";
import { pharmacyApi } from "@/entities/pharmacy";
import { getLocationFromCookies } from "@/features/locate-user/lib/location-cookie";
import { Sidebar } from "@/shared/ui/sidebar";
import { CitySidebar } from "@/widgets/sidebar";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ radius?: string | string[] }>;
}

function getRadiusParam(radius: string | string[] | undefined) {
  return Array.isArray(radius) ? radius[0] : radius;
}

export default async function CitySidebarPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const query = await searchParams;
  const timeFilter = "now";

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
        nearbyRadius={getRadiusParam(query?.radius)}
      />
    </Sidebar>
  );
}
