"use client";

import { Search, Crosshair } from "lucide-react";
import * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarSeparator,
} from "@/shared/ui/sidebar";
import { Button } from "@/shared/ui/button";
import {
  PharmacyList,
  SidebarBranding,
  SidebarCopyright,
} from "@/widgets/sidebar";
import { useLocateMe } from "@/features/locate-user";
import { useMapStore } from "@/shared";
import { TimeFilterChips, RadiusChips } from "@/features/find-pharmacies";
import { SearchCity } from "@/features/search-city";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { locate, isLoading, coordinates } = useLocateMe();
  const flyTo = useMapStore((state) => state.flyTo);
  const hasLocation = coordinates !== null;

  return (
    <Sidebar {...props}>
      <SidebarHeader className="px-6 pt-6 pb-4">
        <SidebarBranding />

        <div className="relative">
          <SearchCity />
        </div>

        <div className="mt-4">
          <Button
            onClick={() => {
              locate((coords) => {
                flyTo([coords.longitude, coords.latitude], 15);
              });
            }}
            disabled={isLoading}
            className="w-full h-12 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg transition-all active:scale-95"
            size="lg"
          >
            <Crosshair
              className={`mr-2 size-5 ${isLoading ? "animate-spin" : ""}`}
            />
            {isLoading ? "Εντοπισμός..." : "Εντόπισέ Με"}
          </Button>
        </div>

        <SidebarSeparator className="mt-4" />

        {hasLocation && (
          <div className="mt-4 px-1 space-y-3">
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
      </SidebarHeader>

      <SidebarContent className="px-4">
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
          <SidebarGroupContent>
            <PharmacyList />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-6 py-4 border-t border-sidebar-border">
        <SidebarCopyright />
      </SidebarFooter>
    </Sidebar>
  );
}
