import { cityApi } from "@/entities/city/api/city.api";
import { pharmacyApi } from "@/entities/pharmacy/api/pharmacy.api";
import { TimeFilter } from "@/entities/pharmacy/model/types";
import { getDateForTime } from "@/shared/lib/date";
import {
  buildCanonicalUrl,
  buildSeoDescription,
  buildSeoTitle,
} from "@/shared/lib/seo";
import { CitySidebar } from "@/widgets/sidebar/ui/city-sidebar";
import { MapPageLayout } from "@/widgets/map-view/ui/map-page-layout";
import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

interface Props {
  params: Promise<{ slug: string; time?: string[] }>;
}

function isValidTime(t: string): t is TimeFilter {
  return ["now", "today", "tomorrow"].includes(t);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, time } = await params;

  const timeSegment = time?.[0];
  const timeFilter: TimeFilter =
    timeSegment && isValidTime(timeSegment) ? timeSegment : "now";

  if (time && time.length > 0 && !isValidTime(time[0])) {
    return {
      title: "Page Not Found",
    };
  }

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

export default async function EfimeriesPage({ params }: Props) {
  const { slug, time } = await params;

  const timeSegment = time?.[0];

  if (time && time.length > 0) {
    if (!isValidTime(time[0])) {
      return notFound();
    }
    if (time.length > 1) {
      return notFound();
    }
    if (time[0] === "now") {
      redirect(`/efimeries/${slug}`);
    }
  }

  const timeFilter: TimeFilter = (timeSegment as TimeFilter) || "now";

  const [cityRes, pharmaciesRes] = await Promise.all([
    cityApi.getCityBySlug(slug),
    pharmacyApi.getCityPharmacies(slug, timeFilter),
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
      <MapPageLayout
        sidebar={
          <CitySidebar
            cityName={cityRes.data.name}
            citySlug={slug}
            activeTime={timeFilter}
            pharmacies={pharmacies}
          />
        }
        center={[Number(cityRes.data.longitude), Number(cityRes.data.latitude)]}
        zoom={14}
        minZoom={10}
        pharmacies={pharmacies}
        timeFilter={timeFilter}
      />
    </>
  );
}
