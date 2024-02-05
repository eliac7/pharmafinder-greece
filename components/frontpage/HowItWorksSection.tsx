import { howItWorks } from "@/data/howItWorks";
import HowItWorksSectionCard from "./HowItWorksSectionCard";

function HowItWorks() {
  return (
    <section className="flex flex-col items-center justify-center bg-complementary-700 py-5">
      <div className=" container mx-auto flex h-full w-full flex-col items-center justify-center  gap-y-6 px-2 text-center text-white">
        <h1 className="py-2 text-center text-2xl font-bold text-white">
          Πώς λειτουργεί το PharmaFinder;
        </h1>
        <p className="mt-2 text-center text-sm text-gray-300">
          Το PharmaFinder σας βοηθά να βρείτε το φαρμακείο που σας εξυπηρετεί
          στην περιοχή σας.
        </p>
        <ul className="list-none ">
          {howItWorks.map((item, index) => (
            <li
              key={index}
              className="my-2 flex flex-col items-stretch overflow-hidden tablet:flex-row"
            >
              <HowItWorksSectionCard icon={item.icon} text={item.text} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default HowItWorks;
