"use client";

import { MapPin, Phone, Clock } from "lucide-react";
import { useNearbyPharmacies } from "@/features/find-pharmacies/model/use-nearby-pharmacies";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { Skeleton } from "@/shared/ui/skeleton";
import { cn } from "@/shared/lib/hooks/utils";
import { useMapStore } from "@/shared/model/use-map-store";

export function PharmacyList() {
  const { data, isLoading, error } = useNearbyPharmacies();
  const flyTo = useMapStore((state) => state.flyTo);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-sm text-destructive">
        Σφάλμα κατά τη φόρτωση των φαρμακείων.
      </div>
    );
  }

  if (!data?.data || data.data.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        Δεν βρέθηκαν φαρμακεία κοντά σας.
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1">
      <div className="flex flex-col gap-2 p-2">
        {data.data.map((pharmacy) => (
          <div
            key={pharmacy.id}
            onClick={() => {
              if (pharmacy.latitude && pharmacy.longitude) {
                flyTo([pharmacy.longitude, pharmacy.latitude], 16);
              }
            }}
            className={cn(
              "flex flex-col gap-2 rounded-lg border bg-card p-3 text-card-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer"
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold line-clamp-2 leading-tight break-words">
                {pharmacy.name}
              </h3>
              {pharmacy.distance_km && (
                <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0 bg-secondary/50 px-1.5 py-0.5 rounded-full">
                  {pharmacy.distance_km.toFixed(1)} χλμ
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <MapPin className="size-3.5 shrink-0" />
              <span className="line-clamp-1 break-all">{pharmacy.address}</span>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Phone className="size-3.5 shrink-0" />
              <span>{pharmacy.phone}</span>
            </div>

            {pharmacy.data_hours.length > 0 && (
              <div className="flex items-center gap-2 text-xs font-medium text-primary bg-primary/10 p-1.5 rounded-md w-fit max-w-full">
                <Clock className="size-3.5 shrink-0" />
                <span className="truncate">
                  {pharmacy.data_hours[0].open_time} -{" "}
                  {pharmacy.data_hours[0].close_time}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
