"use client";

import { useNearbyPharmacies } from "@/features/find-pharmacies/model/use-nearby-pharmacies";
import {
  MapMarker,
  MarkerContent,
  MarkerPopup,
  MarkerTooltip,
} from "@/shared/ui/map";
import { Plus, Phone, MapPin, Clock } from "lucide-react";

export function PharmacyMarkers() {
  const { data } = useNearbyPharmacies();

  if (!data?.data) return null;

  return (
    <>
      {data.data.map((pharmacy) => {
        if (!pharmacy.latitude || !pharmacy.longitude) return null;

        return (
          <MapMarker
            key={pharmacy.id}
            longitude={pharmacy.longitude}
            latitude={pharmacy.latitude}
          >
            <MarkerContent>
              <div className="flex items-center justify-center size-8 rounded-full bg-primary text-primary-foreground shadow-md border-2 border-white hover:scale-110 transition-transform">
                <Plus className="size-5 font-bold" />
              </div>
            </MarkerContent>

            <MarkerTooltip>{pharmacy.name}</MarkerTooltip>

            <MarkerPopup>
              <div className="flex flex-col gap-2 min-w-[200px]">
                <h4 className="font-semibold text-sm">{pharmacy.name}</h4>

                <div className="flex items-start gap-2 text-xs text-muted-foreground">
                  <MapPin className="size-3.5 mt-0.5 shrink-0" />
                  <span>
                    {pharmacy.address}, {pharmacy.city}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Phone className="size-3.5 shrink-0" />
                  <a
                    href={`tel:${pharmacy.phone}`}
                    className="hover:text-primary"
                  >
                    {pharmacy.phone}
                  </a>
                </div>

                {pharmacy.data_hours.length > 0 && (
                  <div className="flex items-center gap-2 text-xs font-medium text-primary bg-primary/10 p-1.5 rounded-md">
                    <Clock className="size-3.5 shrink-0" />
                    <span>
                      {pharmacy.data_hours[0].open_time} -{" "}
                      {pharmacy.data_hours[0].close_time}
                    </span>
                  </div>
                )}

                <div className="mt-1 pt-2 border-t text-[10px] text-muted-foreground flex justify-between">
                  <span>{pharmacy.distance_km?.toFixed(1)} km</span>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${pharmacy.latitude},${pharmacy.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Οδηγίες
                  </a>
                </div>
              </div>
            </MarkerPopup>
          </MapMarker>
        );
      })}
    </>
  );
}
