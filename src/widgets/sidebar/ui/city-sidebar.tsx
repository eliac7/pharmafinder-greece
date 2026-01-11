"use client";

import { Search, Crosshair } from "lucide-react";
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

import { SearchCity } from "@/features/search-city/ui/search-city";
import { CityTimeFilter } from "@/features/find-pharmacies/ui/city-time-filter";
import {
  type TimeFilter,
  type Pharmacy,
} from "@/entities/pharmacy/model/types";
import { CityPharmacyList } from "@/widgets/sidebar/ui/city-pharmacy-list";
import { SidebarBranding, SidebarCopyright } from "./sidebar-shared";

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
  pharmacies,
  ...props
}: CitySidebarProps) {
  return (
    <Sidebar {...props}>
      <SidebarHeader className="px-6 pt-6 pb-4">
        <SidebarBranding />

        <div className="relative">
          <SearchCity />
        </div>

        <div className="mt-4 px-1 space-y-3">
          <div>
            <span className="text-xs font-medium text-muted-foreground mb-3 block">
              Εφημερίες σε{" "}
              <span className="text-foreground font-bold">{cityName}</span>
            </span>
            <CityTimeFilter citySlug={citySlug} activeTime={activeTime} />
          </div>
        </div>

        <SidebarSeparator className="mt-4" />
      </SidebarHeader>

      <SidebarContent className="px-4">
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
          <SidebarGroupContent>
            <CityPharmacyList
              pharmacies={pharmacies}
              count={pharmacies.length}
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
