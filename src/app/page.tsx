import {
  Map,
  MapMarker,
  MarkerContent,
  MarkerPopup,
  MarkerTooltip,
} from "@/components/ui/map";

export default async function Page() {
  return (
    <div className="w-full h-screen">
      <Map center={[23.630208, 37.945028]} zoom={12}>
        <MapMarker longitude={23.630208} latitude={37.945028}>
          <MarkerContent>
            <div className="size-4 rounded-full bg-primary border-2 border-white shadow-lg" />
          </MarkerContent>
          <MarkerTooltip>Piraeus</MarkerTooltip>
          <MarkerPopup>
            <div className="space-y-1">
              <p className="font-medium text-foreground">Piraeus</p>
              <p className="text-xs text-muted-foreground">
                23.630208, 37.945028
              </p>
            </div>
          </MarkerPopup>
        </MapMarker>
      </Map>
    </div>
  );
}
