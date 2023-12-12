import { IPharmacy } from "@/lib/interfaces";

function PharmacyCard({ name, address }: Partial<IPharmacy>) {
  return (
    <div className="block rounded-lg bg-white p-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] dark:bg-neutral-700">
      <h5 className="mb-2 text-xl font-medium leading-tight text-neutral-800 dark:text-neutral-50">
        {name}
      </h5>
      <p className="mb-4 text-base text-neutral-600 dark:text-neutral-200">
        Some quick example text to build on the card title and make up the bulk
        of the card content.
      </p>
    </div>
  );
}

export default PharmacyCard;
