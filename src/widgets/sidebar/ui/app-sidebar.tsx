"use client";

import { Search, Crosshair } from "lucide-react";
import Image from "next/image";
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
import { ThemeToggle } from "@/shared/ui/theme-toggle";
import { PharmacyList } from "@/widgets/sidebar/ui/pharmacy-list";
import { useLocateMe } from "@/features/locate-user/model/use-locate-me";
import { useMapStore } from "@/shared/model/use-map-store";
import { TimeFilterChips } from "@/features/find-pharmacies/ui/time-filter-chips";
import { RadiusChips } from "@/features/find-pharmacies/ui/radius-chips";
import { SearchCity } from "@/features/search-city/ui/search-city";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { locate, isLoading } = useLocateMe();
  const flyTo = useMapStore((state) => state.flyTo);

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

        <div className="mt-4 px-1 space-y-3">
          <div>
            <span className="text-xs font-medium text-muted-foreground mb-1.5 block">
              Χρόνος
            </span>
            <TimeFilterChips />
          </div>
          <div>
            <span className="text-xs font-medium text-muted-foreground mb-1.5 block">
              Ακτίνα Αναζήτησης
            </span>
            <RadiusChips />
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-4">
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
          <SidebarGroupContent>
            <PharmacyList />
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
