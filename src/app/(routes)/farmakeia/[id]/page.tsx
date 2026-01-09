import { pharmacyApi } from "@/entities/pharmacy/api/pharmacy.api";
import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const pharmacy = await pharmacyApi.getPharmacyDetails(Number(id));

  if (!pharmacy || Object.keys(pharmacy).length === 0)
    return { title: "Φαρμακείο Δεν Βρέθηκε" };

  return {
    title: `${pharmacy.name} - ${pharmacy.address}`,
    description: `Δείτε πληροφορίες, τηλέφωνο και οδηγίες για το φαρμακείο ${pharmacy.name} στην περιοχή
     ${pharmacy.address}.`,
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const pharmacy = await pharmacyApi.getPharmacyDetails(Number(id));
  return <pre>{JSON.stringify(pharmacy, null, 2)}</pre>;
}
