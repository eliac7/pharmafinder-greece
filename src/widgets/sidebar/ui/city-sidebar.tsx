"use client";

import { Search, Crosshair } from "lucide-react";
import Image from "next/image";
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
import { ThemeToggle } from "@/shared/ui/theme-toggle";
import { SearchCity } from "@/features/search-city/ui/search-city";
import { CityTimeFilter } from "@/features/find-pharmacies/ui/city-time-filter";
import {
  type TimeFilter,
  type Pharmacy,
} from "@/entities/pharmacy/model/types";
import { CityPharmacyList } from "@/widgets/sidebar/ui/city-pharmacy-list";

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
        <div className="flex items-center gap-3 mb-6">
          <div className="relative size-10 shrink-0">
            <Image
              src="/pharmacy.png"
              alt="Pharmafinder"
              fill
              className="object-contain"
            />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-sidebar-foreground">
            Pharmafinder
          </h1>
        </div>

        <div className="relative">
          <SearchCity />
        </div>

        <div className="mt-4 px-1 space-y-3">
          <div>
            <span className="text-xs font-medium text-muted-foreground mb-1.5 block">
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
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
            <span>© {new Date().getFullYear()} Pharmafinder</span>
            <span className="flex gap-1">
              Made by{" "}
              <a
                href="https://ilias.dev"
                target="_blank"
                rel="noreferrer"
                className="font-medium hover:text-primary hover:underline transition-colors"
              >
                Ilias Thalassochoritis
              </a>
            </span>
          </div>
          <ThemeToggle />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
