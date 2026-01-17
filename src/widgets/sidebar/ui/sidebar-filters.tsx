"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";

import { RadiusChips } from "@/features/find-pharmacies/ui/radius-chips";
import { TimeFilterChips } from "@/features/find-pharmacies/ui/time-filter-chips";
import { useLocateMe } from "@/features/locate-user/model/use-locate-me";
import { useIsMobile } from "@/shared/lib/hooks/use-mobile";

export function SidebarFilters() {
  const { coordinates } = useLocateMe();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(true);
  const hasLocation = coordinates !== null;

  useEffect(() => {
    if (isMobile) {
      setTimeout(() => {
        setIsOpen(false);
      }, 100);
    } else {
      setTimeout(() => {
        setIsOpen(true);
      }, 100);
    }
  }, [isMobile, hasLocation]);

  if (!hasLocation) return null;

  return (
    <div className="mt-4 px-1 space-y-3">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-left"
      >
        <div className="text-sm font-semibold text-foreground">Φίλτρα</div>
        {isOpen ? (
          <ChevronUp className="size-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="size-4 text-muted-foreground" />
        )}
      </button>

      {isOpen && (
        <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div>
            <span className="text-xs font-medium text-muted-foreground mb-3 block">
              Χρόνος
            </span>
            <TimeFilterChips />
          </div>
          <div>
            <span className="text-xs font-medium text-muted-foreground mb-3 block">
              Ακτίνα Αναζήτησης
            </span>
            <RadiusChips />
          </div>
        </div>
      )}
    </div>
  );
}
