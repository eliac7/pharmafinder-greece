import { pharmacyApi, getPharmacyCanonicalPath } from "@/entities/pharmacy";
import { Metadata } from "next";
import { ProductPharmacyPage } from "./product-pharmacy-page";

export const revalidate = 3600;

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const pharmacy = await pharmacyApi.getPharmacyDetails(id);

  if (!pharmacy || Object.keys(pharmacy).length === 0) {
    return { title: "Φαρμακείο Δεν Βρέθηκε" };
  }

  return {
    title: `${pharmacy.name} | Φαρμακείο ${pharmacy.city}`,
    description: `Τηλέφωνο: ${pharmacy.phone}. ${pharmacy.address}.`,
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_APP_URL}${getPharmacyCanonicalPath(pharmacy)}`,
    },
    openGraph: {
      url: `${process.env.NEXT_PUBLIC_APP_URL}${getPharmacyCanonicalPath(pharmacy)}`,
    },
  };
}

export default async function PharmacyPage({ params }: Props) {
  const { id } = await params;
  return <ProductPharmacyPage requestedPath={id} />;
}
