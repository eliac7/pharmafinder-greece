import MainDataContainer from "@/components/main-data-container";
import { IPharmacyResponse } from "@/lib/interfaces";

async function getPharmacies(): Promise<IPharmacyResponse> {
  const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/nearby_pharmacies_with_hours_today?latitude=37.957569&longitude=23.657761&radius=3`;
  const pharmacies = await fetch(url);
  const res = (await pharmacies.json()) as IPharmacyResponse;
  return res;
}

async function Page() {
  const { data, count }: IPharmacyResponse = await getPharmacies();

  if (!data) {
    return <div>Not available</div>;
  }

  return <MainDataContainer pharmacies={data} count={count} />;
}

export default Page;
