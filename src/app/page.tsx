export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { Map } from "@/shared/ui/map";
import { MapUpdater } from "@/widgets/map-view/ui/map-updater";
import { UserLocationMarker } from "@/widgets/map-view/ui/user-location-marker";
import { MapControls } from "@/widgets/map-view/ui/map-controls";
import { PharmacyMarkers } from "@/widgets/map-view/ui/pharmacy-markers";

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
        </Suspense>
      </Map>
      <MapControls />
    </>
  );
}
