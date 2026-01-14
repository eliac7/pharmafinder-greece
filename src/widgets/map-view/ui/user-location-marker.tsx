"use client";

import { User } from "lucide-react";
import {
  MapMarker,
  MarkerContent,
  MarkerPopup,
  MarkerTooltip,
} from "@/shared/ui/map";
import { useLocationStore } from "@/features/locate-user";

export function UserLocationMarker() {
  const { latitude, longitude } = useLocationStore();

  if (!latitude || !longitude) return null;

  return (
    <MapMarker longitude={longitude} latitude={latitude}>
      <MarkerContent>
        <div className="relative flex items-center justify-center size-8">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-500 opacity-75" />
          <div className="relative flex items-center justify-center size-6 rounded-full bg-blue-500 text-white shadow-lg border-2 border-background">
            <User className="size-3.5" />
          </div>
        </div>
      </MarkerContent>
      <MarkerTooltip>Η τοποθεσία μου</MarkerTooltip>
      <MarkerPopup>
        <div className="space-y-1">
          <p className="font-medium text-foreground">Η τοποθεσία σας</p>
          <p className="text-xs text-muted-foreground">
            {latitude.toFixed(4)}, {longitude.toFixed(4)}
          </p>
        </div>
      </MarkerPopup>
    </MapMarker>
  );
}
