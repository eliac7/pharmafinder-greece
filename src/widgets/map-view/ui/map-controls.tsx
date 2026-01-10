"use client";

import { Crosshair } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { useLocateMe } from "@/features/locate-user/model/use-locate-me";
import { cn } from "@/shared/lib/hooks/utils";
import { useMapStore } from "@/shared/model/use-map-store";

export function MapControls() {
  const { locate, isLoading } = useLocateMe();
  const flyTo = useMapStore((state) => state.flyTo);

  return (
    <>
      <div className="absolute bottom-8 right-8 z-10">
        <Button
          onClick={() => {
            locate((coords) => {
              flyTo([coords.longitude, coords.latitude], 15);
            });
          }}
          disabled={isLoading}
          className={cn(
            "size-14 rounded-full shadow-2xl",
            "bg-primary hover:bg-primary/90 text-primary-foreground",
            "ring-4 ring-primary/20",
            "transition-all duration-200"
          )}
          size="icon"
        >
          <Crosshair className={cn("size-6", isLoading && "animate-spin")} />
        </Button>
      </div>
    </>
  );
}
