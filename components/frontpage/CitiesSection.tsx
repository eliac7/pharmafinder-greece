"use client";
import { DynamicThumbnailMap } from "../maps/Index";

export default function Cities() {
  return (
    <section className="bg-primary-700 py-6">
      <div className=" mx-auto flex h-full w-full max-w-4xl flex-col  items-center justify-center gap-y-12 text-center text-white">
        <h1 className="text-center text-xl  font-bold text-gray-100">
          Επιλέξτε μια πόλη για να δείτε τα εφημερεύοντα φαρμακεία της
        </h1>
        <p className="text-md text-center text-gray-200">
          Είτε βρίσκεστε στην Αθήνα, τη Θεσσαλονίκη, την Πάτρα ή οπουδήποτε
          αλλού, το PharmaFinder σας βοηθά να βρείτε εφημερεύοντα φαρμακεία στην
          πόλη σας. Απλά κάντε κλικ στην πόλη που σας ενδιαφέρει.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-x-2">
          <DynamicThumbnailMap
            hoverText="Αθήνα"
            latitude={37.98381}
            longitude={23.727539}
            url="/app?time=now&searchType=city&city=athina"
            zoom={10}
          />
          <DynamicThumbnailMap
            hoverText="Θεσσαλονίκη"
            latitude={40.6403}
            longitude={22.9439}
            url="/app?time=now&searchType=city&city=thessaloniki"
            zoom={10}
          />
          <DynamicThumbnailMap
            hoverText="Πάτρα"
            latitude={38.2466}
            longitude={21.7346}
            url="/app?time=now&searchType=city&city=patra"
            zoom={12}
          />
          <DynamicThumbnailMap
            hoverText="Ηράκλειο"
            latitude={35.3387}
            longitude={25.1442}
            url="/app?time=now&searchType=city&city=irakleio"
            zoom={10}
          />
          <DynamicThumbnailMap
            hoverText="Λάρισα"
            latitude={39.6392}
            longitude={22.4194}
            url="/app?time=now&searchType=city&city=larisa"
            zoom={10}
          />
          <DynamicThumbnailMap
            hoverText="Βόλος"
            latitude={39.3622}
            longitude={22.9424}
            url="/app?time=now&searchType=city&city=bolos"
            zoom={10}
          />
          <DynamicThumbnailMap
            hoverText="Ιωάννινα"
            latitude={39.665}
            longitude={20.8534}
            url="/app?time=now&searchType=city&city=ioannina"
            zoom={10}
          />
          <DynamicThumbnailMap
            hoverText="Χανιά"
            latitude={35.5138}
            longitude={24.018}
            url="/app?time=now&searchType=city&city=xania"
            zoom={10}
          />
          <DynamicThumbnailMap
            hoverText="Ρόδος"
            latitude={36.4344}
            longitude={28.2176}
            url="/app?time=now&searchType=city&city=rodos"
            zoom={11}
          />
        </div>
      </div>
    </section>
  );
}
