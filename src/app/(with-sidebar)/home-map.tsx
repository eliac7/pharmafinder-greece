"use client";

import dynamic from "next/dynamic";

const MapWithControls = dynamic(
  () => import("@/widgets/map-view").then((mod) => mod.MapWithControls),
  {
    ssr: false,
    loading: () => <div className="h-full w-full bg-muted/20 animate-pulse" />,
  }
);

interface HomeMapProps {
  center: [number, number];
  zoom: number;
  minZoom: number;
}

export function HomeMap(props: HomeMapProps) {
  return <MapWithControls {...props} />;
}
