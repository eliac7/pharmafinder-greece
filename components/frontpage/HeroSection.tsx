import dynamic from "next/dynamic";

const HeroButton = dynamic(() => import("./HeroSectionButton"), { ssr: false });

export default function Hero() {
  return (
    <section className="relative flex h-full flex-1 items-center justify-center">
      {" "}
      <video
        autoPlay
        loop
        muted
        className="absolute z-0 h-full w-full object-cover "
      >
        <source src="/hero.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="relative z-10 flex h-full w-full items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm backdrop-filter">
        <div className="sm:py-48 lg:py-36 mx-auto flex h-full w-full max-w-4xl flex-col  items-center justify-center gap-y-12 py-32 text-center text-white">
          <h1 className="sm:text-6xl xl:inline block text-4xl font-bold leading-normal tracking-tight">
            Φαρμακεία σε εφημερία, πάντα στο πλευρό σας, όπου κι αν βρίσκεστε
            στην Ελλάδα.
          </h1>
          <p className="text-md text-gray-300 ">
            Με το <span className="font-extrabold">PharmaFinder</span>, η
            πρόσβαση σε εφημερεύοντα φαρμακεία γίνεται πιο εύκολη από ποτέ.
            Ανακαλύψτε τα πλησιέστερα φαρμακεία που είναι σε εφημερία,
            ανεξάρτητα από το πού βρίσκεστε στην Ελλάδα, οποιαδήποτε στιγμή.
          </p>

          <div className="mt-10 flex items-center justify-center gap-x-6">
            <HeroButton />
          </div>
        </div>
      </div>
    </section>
  );
}
