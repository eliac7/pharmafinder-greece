import { type ReactNode } from "react";
import { Map } from "@/shared/ui/map";
import { SidebarProvider, SidebarTrigger } from "@/shared/ui/sidebar";
import { MapUpdater } from "@/widgets/map-view/ui/map-updater";
import { UserLocationMarker } from "@/widgets/map-view/ui/user-location-marker";
import { MapControls } from "@/widgets/map-view/ui/map-controls";
import { PharmacyMarkers } from "@/widgets/map-view/ui/pharmacy-markers";
import type { Pharmacy, TimeFilter } from "@/entities/pharmacy/model/types";
import type MapLibreGL from "maplibre-gl";

interface MapPageLayoutProps {
  sidebar: ReactNode;
  center: [number, number];
  zoom?: number;
  minZoom?: number;
  mapProps?: Omit<
    MapLibreGL.MapOptions,
    "container" | "style" | "center" | "zoom" | "minZoom"
  >;
  pharmacies?: Pharmacy[];
  timeFilter?: TimeFilter;
}

export function MapPageLayout({
  sidebar,
  center,
  zoom = 13,
  minZoom = 10,
  mapProps,
  pharmacies,
  timeFilter,
}: MapPageLayoutProps) {
  return (
    <SidebarProvider>
      {sidebar}
      <main className="relative w-full h-screen overflow-hidden">
        <div className="absolute top-4 left-4 z-10">
          <SidebarTrigger className="bg-card/80 backdrop-blur-sm shadow-md border border-border rounded-full hover:bg-card/90 size-10" />
        </div>
        <Map
          center={center}
          zoom={zoom}
          minZoom={minZoom}
          attributionControl={false}
          {...mapProps}
        >
          <MapUpdater />
          <UserLocationMarker />
          {pharmacies !== undefined || timeFilter !== undefined ? (
            <PharmacyMarkers pharmacies={pharmacies} timeFilter={timeFilter} />
          ) : (
            <PharmacyMarkers />
          )}
        </Map>
        <MapControls />
      </main>
    </SidebarProvider>
  );
}
