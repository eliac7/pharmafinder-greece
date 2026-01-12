import { pharmacyApi } from "@/entities/pharmacy/api/pharmacy.api";
import { PharmacyDetailSidebar } from "@/features/pharmacy-detail/ui/pharmacy-detail-sidebar";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function HardNavPharmacyPage({ params }: Props) {
  const { id } = await params;
  const pharmacy = await pharmacyApi.getPharmacyDetails(Number(id));

  if (!pharmacy || Object.keys(pharmacy).length === 0) {
    notFound();
  }

  return <PharmacyDetailSidebar pharmacy={pharmacy} />;
}
