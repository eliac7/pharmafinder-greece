import PharmacyCard from "@/components/pharmacy-card";
import { IPharmacy, IPharmacyResponse } from "../lib/interfaces";
import dynamic from "next/dynamic";
import GetLocation from "@/components/get-location";

const PharmacyMap = dynamic(() => import("@/components/map"), {
  ssr: false,
});

async function getPharmacies(): Promise<IPharmacyResponse> {
  const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/nearby_pharmacies_with_hours_now?latitude=37.957569&longitude=23.657761&radius=2`;

  const pharmacies = await fetch(url, { next: { revalidate: 3600 } });

  const res = (await pharmacies.json()) as IPharmacyResponse;

  return res;
}

export default async function Page() {
  const data: IPharmacyResponse = await getPharmacies();

  const { count, message } = data;

  // if there are no data, then we return the message
  if (!count) {
    return (
      <div>
        <h1>Pharmacies</h1>
        <p>{message}</p>
      </div>
    );
  }

  return (
    <div>
      <GetLocation />
      <h1>Pharmacies</h1>
      <p>Total pharmacies: {count}</p>

      {/* <ul className="grid grid-cols-2 gap-4">
        {data.map((pharmacy: IPharmacy) => (
          <li key={pharmacy.id}>
            <PharmacyCard name={pharmacy.name} address={pharmacy.address} />
          </li>
        ))}
      </ul> */}
      {data && <PharmacyMap pharmacies={data.data} />}
    </div>
  );
}
