"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

import { RadiusChips } from "@/features/find-pharmacies/ui/radius-chips";
import { TimeFilterChips } from "@/features/find-pharmacies/ui/time-filter-chips";

export function SidebarFilters() {
  const [isOpen, setIsOpen] = useState(true);

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
            <div className="flex flex-wrap gap-2">
              <TimeFilterChips fullWidth />
            </div>
          </div>
          <div>
            <span className="text-xs font-medium text-muted-foreground mb-3 block">
              Ακτίνα Αναζήτησης
            </span>
            <div className="flex flex-wrap gap-2">
              <RadiusChips fullWidth />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
