"use client";
import dynamic from "next/dynamic";
import LinkButton from "../LinkButton";

const MapFrontPage = dynamic(() => import("@/components/maps/MapFrontPage"), {
  ssr: false,
  loading: () => (
    <div className="h-[35rem] w-full animate-pulse overflow-hidden rounded-lg bg-slate-500" />
  ),
});

export default function Cities() {
  return (
    <section className="bg-primary-700 py-6">
      <div className="container mx-auto flex h-full w-full flex-col items-center  justify-center gap-y-6 px-2 text-center text-white tablet:gap-y-8">
        <h1 className="text-center text-xl font-bold text-gray-100 tablet:text-2xl">
          Επιλέξτε μια από τις κυριότερες πόλεις
        </h1>
        <p className="tablet:text-md text-center text-sm text-gray-200">
          Είτε κατάγεστε από το βόρειο είτε από το νότιο μέρος της Ελλάδος, το
          PharmaFinder σας παρέχει τη δυνατότητα να εντοπίσετε τα φαρμακεία που
          παραμένουν ανοικτά στην περιοχή σας. Απλά επιλέξτε την πόλη που σας
          ενδιαφέρει με ένα απλό κλικ.
        </p>
        <MapFrontPage />
        <div>
          <p className="mb-4 text-sm font-light text-gray-200">
            Δεν βρήκατε την πόλη που σας ενδιαφέρει; Μην ανησυχείτε, μεταβείτε
            στην Εφαρμογή και αναζητήστε την πόλη σας στο επάνω μέρος
          </p>
          <LinkButton
            href="/app?time=now&layer=dark&searchType=city"
            className="bg-complementary-400"
          >
            Μετάβαση στην Εφαρμογή
          </LinkButton>
        </div>
      </div>
    </section>
  );
}
