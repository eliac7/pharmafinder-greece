"use client";

import { useLocateMe } from "@/features/locate-user";
import { cn } from "@/shared";
import { Button } from "@/shared/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip";
import { Crosshair, MapPin } from "lucide-react";
import { useState } from "react";

type MapControlsProps = {
  isAdjusting?: boolean;
  onAdjustChange?: (next: boolean) => void;
};

export function MapControls({
  isAdjusting: controlledAdjusting,
  onAdjustChange,
}: MapControlsProps) {
  const { locate, isLoading } = useLocateMe();
  const [uncontrolledAdjusting, setUncontrolledAdjusting] = useState(false);
  const isAdjusting = controlledAdjusting ?? uncontrolledAdjusting;
  const setIsAdjusting = onAdjustChange ?? setUncontrolledAdjusting;

  const handleLocate = () => {
    locate();
  };

  const handleToggleAdjust = () => {
    setIsAdjusting(!isAdjusting);
  };

  return (
    <div className="absolute bottom-20 right-4 flex flex-col gap-2 z-10 md:bottom-8">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={isAdjusting ? "default" : "secondary"}
            size="icon"
            className={cn(
              "rounded-full shadow-lg h-12 w-12 border-border hover:bg-accent",
              isAdjusting
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-background text-foreground"
            )}
            onClick={handleToggleAdjust}
          >
            <MapPin className="h-5 w-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>{isAdjusting ? "Ακύρωση ορισμού" : "Ορισμός τοποθεσίας"}</p>
        </TooltipContent>
      </Tooltip>

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
