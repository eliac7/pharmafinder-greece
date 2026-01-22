"use client";

import { Crosshair, Heart, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Suspense, useState } from "react";

import { FavoritesList } from "@/features/favorites";
import { RadiusChips } from "@/features/find-pharmacies/ui/radius-chips";
import { TimeFilterChips } from "@/features/find-pharmacies/ui/time-filter-chips";
import { useLocateMe } from "@/features/locate-user/model/use-locate-me";
import { SearchCity } from "@/features/search-city/ui/search-city";
import { cn } from "@/shared";
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
import {
  SidebarBranding,
  SidebarCopyright,
  SidebarFilters,
  SidebarFiltersSkeleton,
  SidebarListSkeleton,
} from "@/widgets/sidebar";
import { PharmacyList } from "@/widgets/sidebar/ui/pharmacy-list";

type SidebarTab = "nearby" | "favorites";

export default function SidebarPage() {
  const { locate, isLoading } = useLocateMe();
  const flyTo = useMapStore((state) => state.flyTo);
  const [activeTab, setActiveTab] = useState<SidebarTab>("nearby");

  const handleLocate = () => {
    locate((coords) => {
      flyTo([coords.longitude, coords.latitude], 15);
    });
  };

  return (
    <Sidebar>
      {/* Mobile Header */}
      <SidebarHeader className="px-4 pt-4 pb-2 gap-3 md:hidden">
        <div className="flex items-center gap-3">
          <Link href="/" className="shrink-0">
            <Image
              src="/pharmacy.png"
              alt="Pharmafinder"
              width={36}
              height={36}
              className="object-contain"
            />
          </Link>
          <div className="flex-1 relative">
            <SearchCity onLocate={handleLocate} isLocating={isLoading} />
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 -mx-4 px-4 mask-fade-right">
          <button
            onClick={() => setActiveTab("nearby")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap border",
              activeTab === "nearby"
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-sidebar-accent/50 text-muted-foreground border-border hover:bg-sidebar-accent hover:text-foreground"
            )}
          >
            <MapPin className="size-3.5" />
            Κοντινά
          </button>

          <button
            onClick={() => setActiveTab("favorites")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap border",
              activeTab === "favorites"
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-sidebar-accent/50 text-muted-foreground border-border hover:bg-sidebar-accent hover:text-foreground"
            )}
          >
            <Heart className="size-3.5" />
            Αγαπημένα
          </button>

          <div className="w-px h-6 bg-border shrink-0 mx-1" />

          {/* Direct rendering of chips for mobile, skipping SidebarFilters wrapper to avoid hydration mismatch if we change it later */}
          <Suspense fallback={null}>
            <div className="contents">
              <TimeFilterChips />
              <RadiusChips />
            </div>
          </Suspense>
        </div>
      </SidebarHeader>

      {/* Desktop Header */}
      <SidebarHeader className="hidden md:block px-6 pt-6 pb-4">
        <SidebarBranding />

        <div className="relative mt-2">
          <SearchCity />
        </div>

        <div className="mt-4">
          <Button
            onClick={handleLocate}
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
        <SidebarGroup className="group-data-[collapsible=icon]:hidden pt-0 md:pt-2">
          <SidebarGroupContent>
            {/* Mobile-only header for results count */}
            <div className="flex md:hidden items-center justify-between mb-2 px-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {activeTab === "nearby" ? "Αποτελεσματα" : "Αγαπημενα"}
              </span>
            </div>

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
