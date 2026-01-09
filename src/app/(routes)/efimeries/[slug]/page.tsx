import { cityApi } from "@/entities/city/api/city.api";
import { pharmacyApi } from "@/entities/pharmacy/api/pharmacy.api";
import {
  Map,
  MarkerContent,
  MarkerPopup,
  MarkerTooltip,
} from "@/shared/ui/map";
import { MapMarker } from "@/shared/ui/map";
import { getDateForTime, TIME_TRANSLATIONS } from "@/shared/lib/date";
import { buildSeoDescription } from "@/shared/lib/seo";

import { Metadata } from "next";
import { notFound } from "next/navigation";

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

  if (!city.data) {
    return {
      title: "Πόλη δεν βρέθηκε | PharmaFinder",
      description: "Η πόλη δεν βρέθηκε.",
      robots: { index: false, follow: false },
    };
  }

  const cityName = city.data.name;
  const timeFilter: "now" | "today" | "tomorrow" = time ?? "now";
  const dateString = getDateForTime(timeFilter);

  const timeText = TIME_TRANSLATIONS[timeFilter];
  const title =
    timeFilter === "now"
      ? `Εφημερεύοντα Φαρμακεία ${cityName} – Ανοιχτά Τώρα | PharmaFinder`
      : `Εφημερεύοντα Φαρμακεία ${cityName} – ${timeText} | PharmaFinder`;

  const description = buildSeoDescription({
    cityName,
    time: timeFilter,
    dateString,
  });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL!;
  const pathname = `/efimeries/${slug}`;
  const canonical =
    timeFilter === "now"
      ? `${baseUrl}${pathname}`
      : `${baseUrl}${pathname}?time=${timeFilter}`;

  return {
    metadataBase: new URL(baseUrl),
    title,
    description,

    alternates: {
      canonical,
    },

    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "PharmaFinder",
      locale: "el_GR",
      type: "website",
      images: [
        {
          url: "/og-image.jpg",
          width: 1200,
          height: 628,
          alt: `PharmaFinder – Εφημερεύοντα Φαρμακεία ${cityName}`,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og-image.jpg"],
    },
  };
}

export default async function EfimeriesPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { time } = await searchParams;
  const timeFilter = time || "now";

  const [city, pharmacies] = await Promise.all([
    cityApi.getCityBySlug(slug),
    pharmacyApi.getCityPharmacies(slug, timeFilter),
  ]);

  if (!city.data) {
    return notFound();
  }

  return (
    <div className="h-screen w-full">
      <Map
        center={[Number(city.data.longitude), Number(city.data.latitude)]}
        zoom={14}
      >
        {pharmacies?.map((pharmacy) => {
          return (
            <MapMarker
              key={pharmacy.id}
              longitude={Number(pharmacy.longitude)}
              latitude={Number(pharmacy.latitude)}
            >
              <MarkerContent key={`content-${pharmacy.id}`}>
                <div className="size-4 rounded-full bg-primary border-2 border-white shadow-lg" />
              </MarkerContent>
              <MarkerTooltip key={`tooltip-${pharmacy.id}`}>
                {pharmacy.name}
              </MarkerTooltip>
              <MarkerPopup key={`popup-${pharmacy.id}`}>
                <div className="space-y-1">
                  <p className="font-medium text-foreground">{pharmacy.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {Number(pharmacy.latitude).toFixed(4)},{" "}
                    {Number(pharmacy.longitude).toFixed(4)}
                  </p>
                </div>
              </MarkerPopup>
            </MapMarker>
          );
        })}
      </Map>
    </div>
  );
}
