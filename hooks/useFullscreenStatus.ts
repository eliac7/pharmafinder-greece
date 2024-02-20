"use client";

import { LeafletEvent } from "leaflet";
import { useEffect, useState } from "react";
import { useMap } from "react-leaflet";

const useFullscreenStatus = () => {
  const map = useMap();
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = (event: LeafletEvent) => {
      setIsFullscreen(event.type === "enterFullscreen");
    };

    map.on("enterFullscreen", handleFullscreenChange);
    map.on("exitFullscreen", handleFullscreenChange);

    return () => {
      map.off("enterFullscreen", handleFullscreenChange);
      map.off("exitFullscreen", handleFullscreenChange);
    };
  }, [map]);

  return isFullscreen;
};

export default useFullscreenStatus;
