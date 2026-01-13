"use client";

import { Crosshair } from "lucide-react";
import { Suspense } from "react";

import { RadiusChips } from "@/features/find-pharmacies/ui/radius-chips";
import { TimeFilterChips } from "@/features/find-pharmacies/ui/time-filter-chips";
import { useLocateMe } from "@/features/locate-user/model/use-locate-me";
import { SearchCity } from "@/features/search-city/ui/search-city";
import { useMapStore } from "@/shared/model/use-map-store";
import { Button } from "@/shared/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarSeparator,
} from "@/shared/ui/sidebar";
import { Skeleton } from "@/shared/ui/skeleton";
import { PharmacyList } from "@/widgets/sidebar/ui/pharmacy-list";
import {
  SidebarBranding,
  SidebarCopyright,
} from "@/widgets/sidebar/ui/sidebar-shared";

function FiltersSkeleton() {
  return (
    <div className="mt-4 px-1 space-y-3">
      <div>
        <Skeleton className="h-3 w-12 mb-3" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-16 rounded-full" />
          <Skeleton className="h-8 w-16 rounded-full" />
          <Skeleton className="h-8 w-20 rounded-full" />
        </div>
      </div>
      <div>
        <Skeleton className="h-3 w-24 mb-3" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-12 rounded-full" />
          <Skeleton className="h-8 w-12 rounded-full" />
          <Skeleton className="h-8 w-14 rounded-full" />
        </div>
      </div>
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="flex flex-col gap-3 py-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex p-4 rounded-2xl bg-card gap-4">
          <Skeleton className="size-12 rounded-xl shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

function SidebarFilters() {
  const { coordinates } = useLocateMe();
  const hasLocation = coordinates !== null;

  if (!hasLocation) return null;

  return (
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
  );
}

export default function SidebarPage() {
  const { locate, isLoading } = useLocateMe();
  const flyTo = useMapStore((state) => state.flyTo);

  return (
    <Sidebar>
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

        <Suspense fallback={<FiltersSkeleton />}>
          <SidebarFilters />
        </Suspense>
      </SidebarHeader>

      <SidebarContent className="px-4">
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
          <SidebarGroupContent>
            <Suspense fallback={<ListSkeleton />}>
              <PharmacyList />
            </Suspense>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-6 py-4 border-t border-sidebar-border">
        <SidebarCopyright />
      </SidebarFooter>
    </Sidebar>
  );
}
