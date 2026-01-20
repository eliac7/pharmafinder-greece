"use client";

import { type ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/shared/ui/sidebar";
import { type Pharmacy, type TimeFilter } from "@/entities/pharmacy";
import dynamic from "next/dynamic";

const MapWithControls = dynamic(
  () => import("./map-with-controls").then((mod) => mod.MapWithControls),
  {
    ssr: false,
    loading: () => <div className="h-full w-full bg-muted/20 animate-pulse" />,
  }
);

interface MapPageLayoutProps {
  children: ReactNode;
  center?: [number, number];
  zoom?: number;
  minZoom?: number;
  pharmacies?: Pharmacy[];
  timeFilter?: TimeFilter;
}

export function MapPageLayout({
  children,
  center,
  zoom,
  minZoom,
  pharmacies,
  timeFilter,
}: MapPageLayoutProps) {
  return (
    <SidebarProvider open={true} defaultOpen={true}>
      <div className="flex h-screen w-full overflow-hidden bg-background">
        {children}
        <main className="flex-1 relative">
          <MapWithControls
            center={center}
            zoom={zoom}
            minZoom={minZoom}
            pharmacies={pharmacies}
            timeFilter={timeFilter}
          />
          <div className="absolute top-4 left-4 z-10 md:hidden">
            <SidebarTrigger />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
