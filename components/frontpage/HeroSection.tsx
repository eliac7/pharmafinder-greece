import dynamic from "next/dynamic";
import HeroSectionMouseScroll from "./HeroSectionMouseScroll";

const HeroButton = dynamic(() => import("./HeroSectionButton"), { ssr: false });

export default function Hero() {
  return (
    <section className="relative flex h-full flex-1 items-center justify-center">
      <video
        autoPlay
        loop
        muted
        className="absolute z-0 h-full w-full object-cover"
        poster="/hero.jpg"
      >
        <source src="/hero.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="relative z-10 flex h-dvh w-full items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm backdrop-filter">
        <div className="container mx-auto flex h-full w-full flex-col items-center justify-center gap-y-6 px-2 text-center text-white tablet:px-0">
          <h1 className="text-2xl font-bold tracking-tight tablet:text-4xl">
            Βρείτε εφημερεύοντα φαρμακεία κοντά σας, οποιαδήποτε στιγμή, όπου
            και αν βρίσκεστε στην Ελλάδα
          </h1>
          <p className="tablet:text-md text-sm text-gray-300 ">
            Με το <span className="font-extrabold">PharmaFinder</span>, η
            πρόσβαση σε εφημερεύοντα φαρμακεία γίνεται πιο εύκολη από ποτέ.
            Ανακαλύψτε τα πλησιέστερα φαρμακεία που είναι σε εφημερία,
            ανεξάρτητα από το πού βρίσκεστε στην Ελλάδα, οποιαδήποτε στιγμή.
          </p>

          <div className="flex items-center justify-center gap-x-6 tablet:mt-10">
            <HeroButton />
          </div>
        </div>
      </div>
      <HeroSectionMouseScroll />
    </section>
  );
}
