"use client";

import * as React from "react";

export const DRAWER_SNAP_POINTS_PERCENTAGES = [0.15, 1];
export const DRAWER_DEFAULT_SNAP_PERCENTAGE = 0.18;

export const DRAWER_SNAP_POINTS = DRAWER_SNAP_POINTS_PERCENTAGES;
export const DRAWER_DEFAULT_SNAP = DRAWER_DEFAULT_SNAP_PERCENTAGE;

function getViewportHeightSnapshot() {
  if (typeof window === "undefined") return null;
  return window.visualViewport?.height ?? window.innerHeight;
}

function subscribeToViewportHeight(onStoreChange: () => void) {
  window.addEventListener("resize", onStoreChange);
  window.visualViewport?.addEventListener("resize", onStoreChange);

  return () => {
    window.removeEventListener("resize", onStoreChange);
    window.visualViewport?.removeEventListener("resize", onStoreChange);
  };
}

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
  const viewportHeight = React.useSyncExternalStore(
    subscribeToViewportHeight,
    getViewportHeightSnapshot,
    () => null
  );

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
