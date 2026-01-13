"use client";

import { Crosshair } from "lucide-react";
import { useMap } from "@/shared/ui/map";
import { useLocateMe } from "@/features/locate-user";
import { cn, useMapStore } from "@/shared";
import { useCityPharmaciesStore, usePharmacies } from "@/entities/pharmacy";
import { Button } from "@/shared/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip";
import * as React from "react";

export function MapControls() {
  const { map } = useMap();
  const { locate, isLoading } = useLocateMe();
  const setFlyTo = useMapStore((state) => state.flyTo);

  const handleLocate = () => {
    locate();
  };

  return (
    <div className="absolute bottom-20 right-4 flex flex-col gap-2 z-10 md:bottom-8">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="secondary"
            size="icon"
            className="rounded-full shadow-lg h-12 w-12 bg-background border-border text-foreground hover:bg-accent"
            onClick={handleLocate}
            disabled={isLoading}
          >
            <Crosshair className={cn("h-5 w-5", isLoading && "animate-spin")} />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>Εντοπισμός θέσης</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
