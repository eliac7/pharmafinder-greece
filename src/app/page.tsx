import { Map } from "@/shared/ui/map";
import { SidebarProvider, SidebarTrigger } from "@/shared/ui/sidebar";
import { AppSidebar } from "@/widgets/sidebar/ui/app-sidebar";
import { MapUpdater } from "@/widgets/map-view/ui/map-updater";
import { UserLocationMarker } from "@/widgets/map-view/ui/user-location-marker";
import { PharmacyMarkers } from "@/widgets/map-view/ui/pharmacy-markers";
import { MapControls } from "@/widgets/map-view/ui/map-controls";

export default function Page() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="relative w-full h-screen overflow-hidden">
        <div className="absolute top-4 left-4 z-10">
          <SidebarTrigger className="bg-card/80 backdrop-blur-sm shadow-md border border-border rounded-full hover:bg-card/90 size-10" />
        </div>
        <Map center={[23.7275, 37.9838]} zoom={13}>
          <MapUpdater />
          <UserLocationMarker />
          <PharmacyMarkers />
        </Map>
        <MapControls />
      </main>
    </SidebarProvider>
  );
}
