"use client";

import * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarSeparator,
  SidebarGroup,
  SidebarGroupContent,
} from "@/shared/ui/sidebar";
import { cn } from "@/shared";
import {
  CityPharmacyList,
  SidebarBranding,
  SidebarCopyright,
} from "@/widgets/sidebar";
import {
  TIME_OPTIONS,
  type TimeFilter,
  type Pharmacy,
  useCityPharmacies,
} from "@/entities/pharmacy";

import { SearchCity, CitySearchModal } from "@/features/search-city";
import { CityTimeFilter } from "@/features/find-pharmacies";
import { ArrowRightLeft } from "lucide-react";

interface CitySidebarProps extends React.ComponentProps<typeof Sidebar> {
  cityName: string;
  citySlug: string;
  activeTime: TimeFilter;
  pharmacies: Pharmacy[];
}

export function CitySidebar({
  cityName,
  citySlug,
  activeTime,
  pharmacies: initialPharmacies,
  ...props
}: CitySidebarProps) {
  const { data: pharmacies } = useCityPharmacies({
    citySlug,
    timeFilter: activeTime,
    initialData: initialPharmacies,
  });

  const displayPharmacies = pharmacies ?? initialPharmacies;

  return (
    <Sidebar {...props}>
      <SidebarHeader className="px-6 pt-6 pb-4">
        <SidebarBranding />

        <div className="relative">
          <SearchCity />
        </div>

        <div className="mt-4 px-1 space-y-3">
          <div>
            <div className="flex items-center gap-1 mb-3">
              <span className="text-xs font-medium text-muted-foreground">
                Εφημερίες σε{" "}
                <span className="text-foreground font-bold">{cityName}</span>
              </span>
              <CitySearchModal
                trigger={
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 text-xs text-teal-700 dark:text-primary font-medium hover:text-teal-600 dark:hover:text-primary/80 transition-colors cursor-pointer"
                  >
                    <ArrowRightLeft className="size-3" />
                    <span>Αλλαγή</span>
                  </button>
                }
              />
            </div>
            <CityTimeFilter citySlug={citySlug} activeTime={activeTime} />
          </div>
        </div>

        <SidebarSeparator className="mt-4" />
      </SidebarHeader>

      <SidebarContent className="px-4">
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
          <SidebarGroupContent>
            <CityPharmacyList
              pharmacies={displayPharmacies}
              count={displayPharmacies.length}
              timeFilter={activeTime}
            />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-6 py-4 border-t border-sidebar-border">
        <SidebarCopyright />
      </SidebarFooter>
    </Sidebar>
  );
}
