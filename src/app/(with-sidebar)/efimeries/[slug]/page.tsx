import { cityApi } from "@/entities/city";
import { pharmacyApi } from "@/entities/pharmacy";
import {
  buildCanonicalUrl,
  buildSeoDescription,
  buildSeoTitle,
  getDateForTime,
} from "@/shared";
import { getLocationFromCookies } from "@/features/locate-user/lib/location-cookie";

import { Metadata } from "next";
import { notFound } from "next/navigation";
import { CityPharmaciesMap } from "@/widgets/city-pharmacies-map";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const timeFilter = "now";

  const city = await cityApi.getCityBySlug(slug);

  if (!city.data) {
    return {
      title: "Πόλη δεν βρέθηκε",
      description: "Η πόλη δεν βρέθηκε.",
      robots: { index: false, follow: false },
    };
  }

  const cityName = city.data.name;
  const dateString = getDateForTime(timeFilter);

  const title = buildSeoTitle({ cityName, time: timeFilter });
  const description = buildSeoDescription({
    cityName,
    time: timeFilter,
    dateString: dateString ?? "",
    slug,
  });

  const canonical = buildCanonicalUrl(slug, timeFilter);

  return {
    title,
    description,
    robots: { index: false, follow: true },
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "PharmaFinder",
      locale: "el_GR",
      type: "website",
    },
  };
}

export default async function EfimeriesPage({ params }: Props) {
  const { slug } = await params;
  const timeFilter = "now";

  const userLocation = await getLocationFromCookies();

  const [cityRes, pharmaciesRes] = await Promise.all([
    cityApi.getCityBySlug(slug),
    pharmacyApi.getCityPharmacies(
      slug,
      timeFilter,
      userLocation?.latitude,
      userLocation?.longitude,
    ),
  ]);

  if (!cityRes.data) {
    return notFound();
  }

  const pharmacies = pharmaciesRes || [];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Εφημερεύοντα Φαρμακεία ${cityRes.data.name}`,
    description: `Λίστα με τα εφημερεύοντα φαρμακεία στην περιοχή ${cityRes.data.name}`,
    numberOfItems: pharmacies.length,
    itemListElement: pharmacies.map((pharmacy, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Pharmacy",
        name: pharmacy.name,
        telephone: pharmacy.phone,
        address: {
          "@type": "PostalAddress",
          streetAddress: pharmacy.address,
          addressLocality: cityRes.data.name,
          addressCountry: "GR",
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: pharmacy.latitude,
          longitude: pharmacy.longitude,
        },
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <CityPharmaciesMap
        initialPharmacies={pharmacies}
        citySlug={slug}
        timeFilter={timeFilter}
        cityCenter={[
          Number(cityRes.data.longitude),
          Number(cityRes.data.latitude),
        ]}
      />
    </>
  );
}
