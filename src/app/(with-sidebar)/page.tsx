import { MapWithControls } from "@/widgets/map-view";
import { getLocationFromCookies } from "@/features/locate-user/lib/location-cookie";

const DEFAULT_CENTER: [number, number] = [23.7275, 37.9838]; // Athens

export default async function Page() {
  const userLocation = await getLocationFromCookies();
  const center: [number, number] = userLocation
    ? [userLocation.longitude, userLocation.latitude]
    : DEFAULT_CENTER;

  return (
    <>
      <MapWithControls center={center} zoom={13} minZoom={10} />
    </>
  );
}
