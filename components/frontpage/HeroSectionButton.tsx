import Link from "next/link";
import { useLocationContext } from "@/context/LocationContext";
import { FaArrowRight } from "react-icons/fa";

export default function HeroText() {
  const { latitude, longitude } = useLocationContext().location;

  return (
    <div className="mt-10 flex items-center justify-center gap-x-6">
      <Link
        href={
          latitude && longitude
            ? "/app?radius=3&time=now"
            : `/app?time=now&layer=road&searchType=city`
        }
        className="rounded-md bg-complementary-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-complementary-700  focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-complementary-200"
      >
        {latitude && longitude
          ? "Βρείτε φαρμακεία στην τοποθεσία σας"
          : "Βρείτε φαρμακεία στην πόλη σας"}{" "}
        <FaArrowRight className="hidden h-4 w-4 tablet:inline-block" />
      </Link>
    </div>
  );
}
