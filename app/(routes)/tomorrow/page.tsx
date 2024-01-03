import MainDataContainer from "@/components/main-data-container";
import { IPharmacyResponse } from "@/lib/interfaces";

async function getPharmacies(radius: string): Promise<IPharmacyResponse> {
  const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/nearby_pharmacies_with_hours_tomorrow?latitude=37.957569&longitude=23.657761&radius=${radius}`;
  const pharmacies = await fetch(url);
  const res = (await pharmacies.json()) as IPharmacyResponse;
  return res;
}

async function Page({ searchParams }: { searchParams: { radius: string } }) {
  let radius = searchParams.radius?.toString() || "1";
  const { data, count, message, success }: IPharmacyResponse =
    await getPharmacies(radius);

  if (!data && message) {
    return <div className="grid">{message}</div>;
  }
  if (!data) {
    return <div className="grid">Δεν βρέθηκαν φαρμακεία</div>;
  }

  return <MainDataContainer pharmacies={data} count={count} radius={radius} />;
}

export default Page;
