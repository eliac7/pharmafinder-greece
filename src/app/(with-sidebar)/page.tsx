export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { Map } from "@/shared/ui/map";
import {
  MapControls,
  UserLocationMarker,
  PharmacyMarkers,
  MapUpdater,
} from "@/widgets/map-view";

export default function Page() {
  return (
    <>
      <Map
        center={[23.7275, 37.9838]}
        zoom={13}
        minZoom={10}
        attributionControl={false}
      >
        <Suspense fallback={null}>
          <MapUpdater />
          <UserLocationMarker />
          <PharmacyMarkers />
          <MapControls />
        </Suspense>
      </Map>
    </>
  );
}
