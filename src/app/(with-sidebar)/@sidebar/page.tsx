"use client";

import { Crosshair, MapPin, Heart } from "lucide-react";
import { Suspense, useState } from "react";

import { useLocateMe } from "@/features/locate-user/model/use-locate-me";
import { SearchCity } from "@/features/search-city/ui/search-city";
import { FavoritesList } from "@/features/favorites";
import { useMapStore } from "@/shared/model/use-map-store";
import { cn } from "@/shared";
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
import { PharmacyList } from "@/widgets/sidebar/ui/pharmacy-list";
import {
  SidebarBranding,
  SidebarCopyright,
  SidebarFilters,
  SidebarFiltersSkeleton,
  SidebarListSkeleton,
} from "@/widgets/sidebar";

type SidebarTab = "nearby" | "favorites";

export default function SidebarPage() {
  const { locate, isLoading } = useLocateMe();
  const flyTo = useMapStore((state) => state.flyTo);
  const [activeTab, setActiveTab] = useState<SidebarTab>("nearby");

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

        <Suspense fallback={<SidebarFiltersSkeleton />}>
          <SidebarFilters />
        </Suspense>

        <div className="mt-4 flex gap-1 p-1 bg-muted rounded-lg">
          <button
            onClick={() => setActiveTab("nearby")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all",
              activeTab === "nearby"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <MapPin className="size-4" />
            Κοντινά
          </button>
          <button
            onClick={() => setActiveTab("favorites")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all",
              activeTab === "favorites"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Heart className="size-4" />
            Αγαπημένα
          </button>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-4">
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
          <SidebarGroupContent>
            <Suspense fallback={<SidebarListSkeleton />}>
              {activeTab === "nearby" ? <PharmacyList /> : <FavoritesList />}
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
