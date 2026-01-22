"use client";

import * as React from "react";

export const DRAWER_SNAP_POINTS_PERCENTAGES = [0.15, 1];
export const DRAWER_DEFAULT_SNAP_PERCENTAGE = 0.18;

export const DRAWER_SNAP_POINTS = DRAWER_SNAP_POINTS_PERCENTAGES;
export const DRAWER_DEFAULT_SNAP = DRAWER_DEFAULT_SNAP_PERCENTAGE;

/**
 * Hook that returns snap points in pixels based on the actual visual viewport height.
 * This accounts for mobile browser chrome (address bar, toolbar) that affects available space.
 * 
 * @param percentages - Array of percentages (0-1) to convert to pixel values
 * @returns Object with snapPoints array (in pixels) and current viewportHeight
 */
export function useVisualViewportSnapPoints(
  percentages: number[] = DRAWER_SNAP_POINTS_PERCENTAGES
) {
  const [viewportHeight, setViewportHeight] = React.useState<number | null>(null);

  React.useEffect(() => {
    const updateHeight = () => {
      const height = window.visualViewport?.height ?? window.innerHeight;
      setViewportHeight(height);
    };

    updateHeight();

    window.addEventListener("resize", updateHeight);
    
    window.visualViewport?.addEventListener("resize", updateHeight);

    return () => {
      window.removeEventListener("resize", updateHeight);
      window.visualViewport?.removeEventListener("resize", updateHeight);
    };
  }, []);

  const snapPoints = React.useMemo(() => {
    if (viewportHeight === null) {
      return percentages;
    }
    return percentages.map((p) => Math.round(viewportHeight * p));
  }, [viewportHeight, percentages]);

  const defaultSnap = React.useMemo(() => {
    if (viewportHeight === null) {
      return DRAWER_DEFAULT_SNAP_PERCENTAGE;
    }
    return Math.round(viewportHeight * DRAWER_DEFAULT_SNAP_PERCENTAGE);
  }, [viewportHeight]);

  return { snapPoints, defaultSnap, viewportHeight };
}
