import { Suspense } from "react";
import { Map } from "@/shared/ui/map";
import {
  MapControls,
  UserLocationMarker,
  PharmacyMarkers,
  MapUpdater,
} from "@/widgets/map-view";
import { getLocationFromCookies } from "@/features/locate-user/lib/location-cookie";

const DEFAULT_CENTER: [number, number] = [23.7275, 37.9838]; // Athens

export default async function Page() {
  const userLocation = await getLocationFromCookies();
  const center: [number, number] = userLocation
    ? [userLocation.longitude, userLocation.latitude]
    : DEFAULT_CENTER;

  return (
    <>
      <Map center={center} zoom={13} minZoom={10} attributionControl={false}>
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
