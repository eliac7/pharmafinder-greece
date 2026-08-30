"use client";

import { AlertTriangle, Cross, Loader2, Locate, Maximize, Minus, X } from "lucide-react";
import MapLibreGL, { type MarkerOptions, type PopupOptions } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useTheme } from "next-themes";
import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useId,
  useImperativeHandle,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

import { cn } from "@/shared/lib/hooks/utils";
import React from "react";

type MapContextValue = {
  map: MapLibreGL.Map | null;
  isLoaded: boolean;
  hasError: boolean;
};

const MapContext = createContext<MapContextValue | null>(null);

function useMap() {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error("useMap must be used within a Map component");
  }
  return context;
}

function useLatestRef<T>(value: T) {
  const ref = useRef(value);
  useEffect(() => {
    ref.current = value;
  });
  return ref;
}

type MapLayerMouseEventName = "click" | "mouseenter" | "mouseleave";

function useMapLayerMouseEvent(
  map: MapLibreGL.Map | null,
  isLoaded: boolean,
  eventName: MapLayerMouseEventName,
  layerId: string,
  listener: (event: MapLibreGL.MapLayerMouseEvent) => void,
  enabled = true
) {
  const listenerRef = useLatestRef(listener);

  useEffect(() => {
    if (!isLoaded || !map || !enabled) return;

    const stableListener = (event: MapLibreGL.MapLayerMouseEvent) => {
      listenerRef.current(event);
    };

    map.on(eventName, layerId, stableListener);

    return () => {
      map.off(eventName, layerId, stableListener);
    };
  }, [enabled, eventName, isLoaded, layerId, listenerRef, map]);
}

/**
 * Check if WebGL is supported in the browser
 */
function isWebGLSupported(): boolean {
  if (typeof window === "undefined") return true; // SSR - assume supported

  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    return gl instanceof WebGLRenderingContext;
  } catch {
    return false;
  }
}

type MapErrorFallbackProps = {
  className?: string;
};

function MapErrorFallback({ className }: MapErrorFallbackProps) {
  return (
    <div className={cn("relative w-full h-full flex items-center justify-center bg-muted/50", className)}>
      <div className="flex flex-col items-center gap-3 p-6 text-center max-w-sm">
        <div className="rounded-full bg-destructive/10 p-3">
          <AlertTriangle className="size-6 text-destructive" />
        </div>
        <div className="space-y-1.5">
          <h3 className="font-medium text-sm">Ο χάρτης δεν είναι διαθέσιμος</h3>
          <p className="text-xs text-muted-foreground">
            Το WebGL είναι απενεργοποιημένο στον browser σας. Για να δείτε τον χάρτη, ενεργοποιήστε το WebGL στις ρυθμίσεις του browser.
          </p>
        </div>
        <details className="text-xs text-muted-foreground">
          <summary className="cursor-pointer hover:text-foreground transition-colors">
            Πώς να το ενεργοποιήσω;
          </summary>
          <div className="mt-2 text-left space-y-1 bg-muted p-2 rounded-md">
            <p><strong>Brave:</strong> Settings → Shields → Fingerprinting → Allow</p>
            <p><strong>Chrome:</strong> chrome://flags → WebGL → Enabled</p>
            <p><strong>Firefox:</strong> about:config → webgl.disabled → false</p>
          </div>
        </details>
      </div>
    </div>
  );
}

const defaultStyles = {
  dark: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
  light: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
};

type MapStyleOption = string | MapLibreGL.StyleSpecification;

type MapProps = {
  children?: ReactNode;
  /** Custom map styles for light and dark themes. Overrides the default Carto styles. */
  styles?: {
    light?: MapStyleOption;
    dark?: MapStyleOption;
  };
} & Omit<MapLibreGL.MapOptions, "container" | "style">;

type MapRef = MapLibreGL.Map;

const DefaultLoader = () => (
  <div className="absolute inset-0 flex items-center justify-center">
    <div className="flex gap-1">
      <span className="size-1.5 rounded-full bg-muted-foreground/60 animate-pulse" />
      <span className="size-1.5 rounded-full bg-muted-foreground/60 animate-pulse [animation-delay:150ms]" />
      <span className="size-1.5 rounded-full bg-muted-foreground/60 animate-pulse [animation-delay:300ms]" />
    </div>
  </div>
);

type MapState = {
  mapInstance: MapLibreGL.Map | null;
  isLoaded: boolean;
  isStyleLoaded: boolean;
  hasError: boolean;
};

type MapStateAction =
  | { type: "ready"; mapInstance: MapLibreGL.Map }
  | { type: "load" }
  | { type: "style-loading" }
  | { type: "style-loaded" }
  | { type: "error" }
  | { type: "reset" };

const initialMapState: MapState = {
  mapInstance: null,
  isLoaded: false,
  isStyleLoaded: false,
  hasError: false,
};

function mapStateReducer(state: MapState, action: MapStateAction): MapState {
  switch (action.type) {
    case "ready":
      return { ...state, mapInstance: action.mapInstance };
    case "load":
      return { ...state, isLoaded: true };
    case "style-loading":
      return { ...state, isStyleLoaded: false };
    case "style-loaded":
      return { ...state, isStyleLoaded: true };
    case "error":
      return { ...state, hasError: true };
    case "reset":
      return initialMapState;
    default:
      return state;
  }
}

const Map = forwardRef<MapRef, MapProps>(function Map(
  { children, styles, ...props },
  ref
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [{ mapInstance, isLoaded, isStyleLoaded, hasError }, dispatch] =
    useReducer(mapStateReducer, initialMapState);
  const { resolvedTheme } = useTheme();
  const currentStyleRef = useRef<MapStyleOption | null>(null);
  const styleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const mapStyles = useMemo(
    () => ({
      dark: styles?.dark ?? defaultStyles.dark,
      light: styles?.light ?? defaultStyles.light,
    }),
    [styles]
  );
  const initialMapOptionsRef = useRef(props);
  const initialMapStylesRef = useRef(mapStyles);
  const initialThemeRef = useRef(resolvedTheme);

  const clearStyleTimeout = useCallback(() => {
    if (styleTimeoutRef.current) {
      clearTimeout(styleTimeoutRef.current);
      styleTimeoutRef.current = null;
    }
  }, []);

  useImperativeHandle(ref, () => mapInstance as MapLibreGL.Map, [mapInstance]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Check WebGL support before trying to create the map
    if (!isWebGLSupported()) {
      dispatch({ type: "error" });
      return;
    }

    const initialStyles = initialMapStylesRef.current;
    const initialStyle =
      initialThemeRef.current === "dark"
        ? initialStyles.dark
        : initialStyles.light;
    currentStyleRef.current = initialStyle;

    let map: MapLibreGL.Map;

    try {
      map = new MapLibreGL.Map({
        container: containerRef.current,
        style: initialStyle,
        renderWorldCopies: false,
        attributionControl: {
          compact: true,
        },
        ...initialMapOptionsRef.current,
      });
    } catch (error) {
      console.error("Failed to initialize map:", error);
      dispatch({ type: "error" });
      return;
    }

    const styleDataHandler = () => {
      clearStyleTimeout();
      // Delay to ensure style is fully processed before allowing layer operations
      // This is a workaround to avoid race conditions with the style loading
      styleTimeoutRef.current = setTimeout(() => {
        dispatch({ type: "style-loaded" });
      }, 150);
    };
    const loadHandler = () => dispatch({ type: "load" });

    // Handle WebGL context creation errors (e.g., Brave with shields up)
    const errorHandler = (e: ErrorEvent) => {
      if (e.error?.type === "webglcontextcreationerror" ||
        e.error?.message?.includes("WebGL")) {
        console.error("WebGL context creation failed:", e.error);
        dispatch({ type: "error" });
      }
    };

    map.on("load", loadHandler);
    map.on("styledata", styleDataHandler);
    map.on("error", errorHandler);
    dispatch({ type: "ready", mapInstance: map });

    return () => {
      clearStyleTimeout();
      map.off("load", loadHandler);
      map.off("styledata", styleDataHandler);
      map.off("error", errorHandler);
      map.remove();
      dispatch({ type: "reset" });
    };
  }, [clearStyleTimeout]);

  useEffect(() => {
    if (!mapInstance || !resolvedTheme) return;

    const newStyle =
      resolvedTheme === "dark" ? mapStyles.dark : mapStyles.light;

    if (currentStyleRef.current === newStyle) return;

    clearStyleTimeout();
    currentStyleRef.current = newStyle;
    dispatch({ type: "style-loading" });

    mapInstance.setStyle(newStyle, { diff: true });
  }, [mapInstance, resolvedTheme, mapStyles, clearStyleTimeout]);

  const isLoading = !isLoaded || !isStyleLoaded;

  const contextValue = useMemo(
    () => ({
      map: mapInstance,
      isLoaded: isLoaded && isStyleLoaded,
      hasError,
    }),
    [mapInstance, isLoaded, isStyleLoaded, hasError]
  );

  // Show error fallback if WebGL is not available
  if (hasError) {
    return (
      <MapContext.Provider value={contextValue}>
        <MapErrorFallback />
      </MapContext.Provider>
    );
  }

  return (
    <MapContext.Provider value={contextValue}>
      <div ref={containerRef} className="relative w-full h-full">
        {isLoading && <DefaultLoader />}
        {/* SSR-safe: children render only when map is loaded on client */}
        {mapInstance && children}
      </div>
    </MapContext.Provider>
  );
});

type MarkerContextValue = {
  marker: MapLibreGL.Marker;
  map: MapLibreGL.Map | null;
};

const MarkerContext = createContext<MarkerContextValue | null>(null);

function useMarkerContext() {
  const context = useContext(MarkerContext);
  if (!context) {
    throw new Error("Marker components must be used within MapMarker");
  }
  return context;
}

type MapMarkerProps = {
  /** Longitude coordinate for marker position */
  longitude: number;
  /** Latitude coordinate for marker position */
  latitude: number;
  /** Marker subcomponents (MarkerContent, MarkerPopup, MarkerTooltip, MarkerLabel) */
  children: ReactNode;
  /** Callback when marker is clicked */
  onClick?: (e: MouseEvent) => void;
  /** Callback when mouse enters marker */
  onMouseEnter?: (e: MouseEvent) => void;
  /** Callback when mouse leaves marker */
  onMouseLeave?: (e: MouseEvent) => void;
  /** Callback when marker drag starts (requires draggable: true) */
  onDragStart?: (lngLat: { lng: number; lat: number }) => void;
  /** Callback during marker drag (requires draggable: true) */
  onDrag?: (lngLat: { lng: number; lat: number }) => void;
  /** Callback when marker drag ends (requires draggable: true) */
  onDragEnd?: (lngLat: { lng: number; lat: number }) => void;
} & Omit<MarkerOptions, "element">;

function MapMarker({
  longitude,
  latitude,
  children,
  onClick,
  onMouseEnter,
  onMouseLeave,
  onDragStart,
  onDrag,
  onDragEnd,
  draggable = false,
  ...markerOptions
}: MapMarkerProps) {
  const { map } = useMap();
  const handlersRef = useLatestRef({
    onClick,
    onMouseEnter,
    onMouseLeave,
    onDragStart,
    onDrag,
    onDragEnd,
  });

  const [marker] = useState(
    () =>
      new MapLibreGL.Marker({
        ...markerOptions,
        element: document.createElement("div"),
        draggable,
      }).setLngLat([longitude, latitude])
  );

  useEffect(() => {
    const handleClick = (e: MouseEvent) => handlersRef.current.onClick?.(e);
    const handleMouseEnter = (e: MouseEvent) =>
      handlersRef.current.onMouseEnter?.(e);
    const handleMouseLeave = (e: MouseEvent) =>
      handlersRef.current.onMouseLeave?.(e);

    const handleDragStart = () => {
      const lngLat = marker.getLngLat();
      handlersRef.current.onDragStart?.({ lng: lngLat.lng, lat: lngLat.lat });
    };
    const handleDrag = () => {
      const lngLat = marker.getLngLat();
      handlersRef.current.onDrag?.({ lng: lngLat.lng, lat: lngLat.lat });
    };
    const handleDragEnd = () => {
      const lngLat = marker.getLngLat();
      handlersRef.current.onDragEnd?.({ lng: lngLat.lng, lat: lngLat.lat });
    };

    const element = marker.getElement();
    element?.addEventListener("click", handleClick);
    element?.addEventListener("mouseenter", handleMouseEnter);
    element?.addEventListener("mouseleave", handleMouseLeave);
    marker.on("dragstart", handleDragStart);
    marker.on("drag", handleDrag);
    marker.on("dragend", handleDragEnd);

    return () => {
      element?.removeEventListener("click", handleClick);
      element?.removeEventListener("mouseenter", handleMouseEnter);
      element?.removeEventListener("mouseleave", handleMouseLeave);
      marker.off("dragstart", handleDragStart);
      marker.off("drag", handleDrag);
      marker.off("dragend", handleDragEnd);
    };
  }, [marker, handlersRef]);

  useEffect(() => {
    if (!map) return;

    marker.addTo(map);

    return () => {
      marker.remove();
    };
  }, [map, marker]);

  const { offset = [0, 0], rotation, rotationAlignment, pitchAlignment } = markerOptions;

  useEffect(() => {
    if (
      marker.getLngLat().lng !== longitude ||
      marker.getLngLat().lat !== latitude
    ) {
      marker.setLngLat([longitude, latitude]);
    }
    if (marker.isDraggable() !== draggable) {
      marker.setDraggable(draggable);
    }

    const currentOffset = marker.getOffset();
    const [newOffsetX, newOffsetY] = Array.isArray(offset)
      ? offset
      : [offset.x, offset.y];
    if (currentOffset.x !== newOffsetX || currentOffset.y !== newOffsetY) {
      marker.setOffset(offset);
    }

    if (marker.getRotation() !== rotation) {
      marker.setRotation(rotation ?? 0);
    }
    if (marker.getRotationAlignment() !== rotationAlignment) {
      marker.setRotationAlignment(rotationAlignment ?? "auto");
    }
    if (marker.getPitchAlignment() !== pitchAlignment) {
      marker.setPitchAlignment(pitchAlignment ?? "auto");
    }
  }, [
    marker,
    longitude,
    latitude,
    draggable,
    offset,
    rotation,
    rotationAlignment,
    pitchAlignment,
  ]);

  const markerContextValue = useMemo(() => ({ marker, map }), [marker, map]);

  return (
    <MarkerContext.Provider value={markerContextValue}>
      {children}
    </MarkerContext.Provider>
  );
}

type MarkerContentProps = {
  /** Custom marker content. Defaults to a blue dot if not provided */
  children?: ReactNode;
  /** Additional CSS classes for the marker container */
  className?: string;
};

function MarkerContent({ children, className }: MarkerContentProps) {
  const { marker } = useMarkerContext();

  return createPortal(
    <div className={cn("relative cursor-pointer", className)}>
      {children || <DefaultMarkerIcon />}
    </div>,
    marker.getElement()
  );
}

function DefaultMarkerIcon() {
  return (
    <div className="relative size-4 rounded-full border-2 border-white bg-blue-500 shadow-lg" />
  );
}

type MarkerPopupProps = {
  /** Popup content */
  children: ReactNode;
  /** Additional CSS classes for the popup container */
  className?: string;
  /** Show a close button in the popup (default: false) */
  closeButton?: boolean;
  /** Force the popup to be open */
  forceOpen?: boolean;
} & Omit<PopupOptions, "className" | "closeButton">;

function MarkerPopup({
  children,
  className,
  closeButton = false,
  forceOpen,
  ...popupOptions
}: MarkerPopupProps) {
  const { marker, map } = useMarkerContext();
  const container = useMemo(() => document.createElement("div"), []);

  const [popup] = useState(() =>
    new MapLibreGL.Popup({
      offset: 16,
      ...popupOptions,
      closeButton: false,
    })
      .setMaxWidth("none")
      .setDOMContent(container)
  );

  useEffect(() => {
    if (!map) return;

    popup.setDOMContent(container);
    marker.setPopup(popup);

    return () => {
      marker.setPopup(null);
    };
  }, [container, map, marker, popup]);

  useEffect(() => {
    if (forceOpen && map && !popup.isOpen()) {
      popup.addTo(map);
    }
  }, [forceOpen, map, popup]);

  const { offset, maxWidth } = popupOptions;

  useEffect(() => {
    if (!popup.isOpen()) return;
    popup.setOffset(offset ?? 16);
    if (maxWidth) {
      popup.setMaxWidth(maxWidth);
    }
  }, [popup, offset, maxWidth]);

  const handleClose = () => popup.remove();

  return createPortal(
    <div
      className={cn(
        "relative rounded-md border bg-popover p-3 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95",
        className
      )}
    >
      {closeButton && (
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-1 right-1 z-10 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          aria-label="Close popup"
        >
          <X className="size-4" />
          <span className="sr-only">Close</span>
        </button>
      )}
      {children}
    </div>,
    container
  );
}

type MarkerTooltipProps = {
  /** Tooltip content */
  children: ReactNode;
  /** Additional CSS classes for the tooltip container */
  className?: string;
} & Omit<PopupOptions, "className" | "closeButton" | "closeOnClick">;

function MarkerTooltip({
  children,
  className,
  ...popupOptions
}: MarkerTooltipProps) {
  const { marker, map } = useMarkerContext();
  const container = useMemo(() => document.createElement("div"), []);

  const [tooltip] = useState(() =>
    new MapLibreGL.Popup({
      offset: 16,
      ...popupOptions,
      closeOnClick: true,
      closeButton: false,
    }).setMaxWidth("none")
  );

  useEffect(() => {
    if (!map) return;

    tooltip.setDOMContent(container);

    const handleMouseEnter = () => {
      tooltip.setLngLat(marker.getLngLat()).addTo(map);
    };
    const handleMouseLeave = () => tooltip.remove();

    marker.getElement()?.addEventListener("mouseenter", handleMouseEnter);
    marker.getElement()?.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      marker.getElement()?.removeEventListener("mouseenter", handleMouseEnter);
      marker.getElement()?.removeEventListener("mouseleave", handleMouseLeave);
      tooltip.remove();
    };
  }, [container, map, marker, tooltip]);

  const { offset, maxWidth } = popupOptions;

  useEffect(() => {
    if (!tooltip.isOpen()) return;
    tooltip.setOffset(offset ?? 16);
    if (maxWidth) {
      tooltip.setMaxWidth(maxWidth);
    }
  }, [tooltip, offset, maxWidth]);

  return createPortal(
    <div
      className={cn(
        "rounded-md bg-foreground px-2 py-1 text-xs text-background shadow-md animate-in fade-in-0 zoom-in-95",
        className
      )}
    >
      {children}
    </div>,
    container
  );
}

type MarkerLabelProps = {
  /** Label text content */
  children: ReactNode;
  /** Additional CSS classes for the label */
  className?: string;
  /** Position of the label relative to the marker (default: "top") */
  position?: "top" | "bottom";
};

function MarkerLabel({
  children,
  className,
  position = "top",
}: MarkerLabelProps) {
  const positionClasses = {
    top: "bottom-full mb-1",
    bottom: "top-full mt-1",
  };

  return (
    <div
      className={cn(
        "absolute left-1/2 -translate-x-1/2 whitespace-nowrap",
        "text-[10px] font-medium text-foreground",
        positionClasses[position],
        className
      )}
    >
      {children}
    </div>
  );
}

type MapControlsProps = {
  /** Position of the controls on the map (default: "bottom-right") */
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  /** Show zoom in/out buttons (default: true) */
  showZoom?: boolean;
  /** Show compass button to reset bearing (default: false) */
  showCompass?: boolean;
  /** Show locate button to find user's location (default: false) */
  showLocate?: boolean;
  /** Show fullscreen toggle button (default: false) */
  showFullscreen?: boolean;
  /** Additional CSS classes for the controls container */
  className?: string;
  /** Callback with user coordinates when located */
  onLocate?: (coords: { longitude: number; latitude: number }) => void;
};

const positionClasses = {
  "top-left": "top-2 left-2",
  "top-right": "top-2 right-2",
  "bottom-left": "bottom-2 left-2",
  "bottom-right": "bottom-10 right-2",
};

function ControlGroup({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col rounded-md border border-border bg-background shadow-sm overflow-hidden [&>button:not(:last-child)]:border-b [&>button:not(:last-child)]:border-border">
      {children}
    </div>
  );
}

function ControlButton({
  onClick,
  label,
  children,
  disabled = false,
}: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      type="button"
      className={cn(
        "flex items-center justify-center size-8 hover:bg-accent dark:hover:bg-accent/40 transition-colors",
        disabled && "opacity-50 pointer-events-none cursor-not-allowed"
      )}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

function MapControls({
  position = "bottom-right",
  showZoom = true,
  showCompass = false,
  showLocate = false,
  showFullscreen = false,
  className,
  onLocate,
}: MapControlsProps) {
  const { map, isLoaded } = useMap();
  const [waitingForLocation, setWaitingForLocation] = useState(false);

  const handleZoomIn = useCallback(() => {
    map?.zoomTo(map.getZoom() + 1, { duration: 300 });
  }, [map]);

  const handleZoomOut = useCallback(() => {
    map?.zoomTo(map.getZoom() - 1, { duration: 300 });
  }, [map]);

  const handleResetBearing = useCallback(() => {
    map?.resetNorthPitch({ duration: 300 });
  }, [map]);

  const handleLocate = useCallback(() => {
    setWaitingForLocation(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = {
            longitude: pos.coords.longitude,
            latitude: pos.coords.latitude,
          };
          map?.flyTo({
            center: [coords.longitude, coords.latitude],
            zoom: 14,
            duration: 1500,
          });
          onLocate?.(coords);
          setWaitingForLocation(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setWaitingForLocation(false);
        }
      );
    }
  }, [map, onLocate]);

  const handleFullscreen = useCallback(() => {
    const container = map?.getContainer();
    if (!container) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      container.requestFullscreen();
    }
  }, [map]);

  if (!isLoaded) return null;

  return (
    <div
      className={cn(
        "absolute z-10 flex flex-col gap-1.5",
        positionClasses[position],
        className
      )}
    >
      {showZoom && (
        <ControlGroup>
          <ControlButton onClick={handleZoomIn} label="Zoom in">
            <Cross className="size-4" />
          </ControlButton>
          <ControlButton onClick={handleZoomOut} label="Zoom out">
            <Minus className="size-4" />
          </ControlButton>
        </ControlGroup>
      )}
      {showCompass && (
        <ControlGroup>
          <CompassButton onClick={handleResetBearing} />
        </ControlGroup>
      )}
      {showLocate && (
        <ControlGroup>
          <ControlButton
            onClick={handleLocate}
            label="Find my location"
            disabled={waitingForLocation}
          >
            {waitingForLocation ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Locate className="size-4" />
            )}
          </ControlButton>
        </ControlGroup>
      )}
      {showFullscreen && (
        <ControlGroup>
          <ControlButton onClick={handleFullscreen} label="Toggle fullscreen">
            <Maximize className="size-4" />
          </ControlButton>
        </ControlGroup>
      )}
    </div>
  );
}

function CompassButton({ onClick }: { onClick: () => void }) {
  const { isLoaded, map } = useMap();
  const compassRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!isLoaded || !map || !compassRef.current) return;

    const compass = compassRef.current;

    const updateRotation = () => {
      const bearing = map.getBearing();
      const pitch = map.getPitch();
      compass.style.transform = `rotateX(${pitch}deg) rotateZ(${-bearing}deg)`;
    };

    map.on("rotate", updateRotation);
    map.on("pitch", updateRotation);
    updateRotation();

    return () => {
      map.off("rotate", updateRotation);
      map.off("pitch", updateRotation);
    };
  }, [isLoaded, map]);

  return (
    <ControlButton onClick={onClick} label="Reset bearing to north">
      <svg
        ref={compassRef}
        viewBox="0 0 24 24"
        className="size-5 transition-transform duration-200"
        style={{ transformStyle: "preserve-3d" }}
      >
        <path d="M12 2L16 12H12V2Z" className="fill-red-500" />
        <path d="M12 2L8 12H12V2Z" className="fill-red-300" />
        <path d="M12 22L16 12H12V22Z" className="fill-muted-foreground/60" />
        <path d="M12 22L8 12H12V22Z" className="fill-muted-foreground/30" />
      </svg>
    </ControlButton>
  );
}

type MapPopupProps = {
  /** Longitude coordinate for popup position */
  longitude: number;
  /** Latitude coordinate for popup position */
  latitude: number;
  /** Callback when popup is closed */
  onClose?: () => void;
  /** Popup content */
  children: ReactNode;
  /** Additional CSS classes for the popup container */
  className?: string;
  /** Show a close button in the popup (default: false) */
  closeButton?: boolean;
} & Omit<PopupOptions, "className" | "closeButton">;

function MapPopup({
  longitude,
  latitude,
  onClose,
  children,
  className,
  closeButton = false,
  ...popupOptions
}: MapPopupProps) {
  const { map } = useMap();
  const onCloseRef = useLatestRef(onClose);
  const container = useMemo(() => document.createElement("div"), []);

  const [popup] = useState(() =>
    new MapLibreGL.Popup({
      offset: 16,
      ...popupOptions,
      closeButton: false,
    })
      .setMaxWidth("none")
      .setLngLat([longitude, latitude])
  );

  useEffect(() => {
    if (!map) return;

    const onCloseProp = () => onCloseRef.current?.();
    popup.on("close", onCloseProp);

    popup.setDOMContent(container);
    popup.addTo(map);

    return () => {
      popup.off("close", onCloseProp);
      if (popup.isOpen()) {
        popup.remove();
      }
    };
  }, [container, map, onCloseRef, popup]);

  const { offset, maxWidth } = popupOptions;

  useEffect(() => {
    if (!popup.isOpen()) return;

    const lngLat = popup.getLngLat();
    if (lngLat.lng !== longitude || lngLat.lat !== latitude) {
      popup.setLngLat([longitude, latitude]);
    }

    popup.setOffset(offset ?? 16);
    if (maxWidth) {
      popup.setMaxWidth(maxWidth);
    }
  }, [popup, longitude, latitude, offset, maxWidth]);

  const handleClose = () => {
    popup.remove();
    onCloseRef.current?.();
  };

  return createPortal(
    <div
      className={cn(
        "relative rounded-md border bg-popover p-3 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95",
        className
      )}
    >
      {closeButton && (
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-1 right-1 z-10 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          aria-label="Close popup"
        >
          <X className="size-4" />
          <span className="sr-only">Close</span>
        </button>
      )}
      {children}
    </div>,
    container
  );
}

type MapRouteProps = {
  /** Optional unique identifier for the route layer */
  id?: string;
  /** Array of [longitude, latitude] coordinate pairs defining the route */
  coordinates: [number, number][];
  /** Line color as CSS color value (default: "#4285F4") */
  color?: string;
  /** Line width in pixels (default: 3) */
  width?: number;
  /** Line opacity from 0 to 1 (default: 0.8) */
  opacity?: number;
  /** Dash pattern [dash length, gap length] for dashed lines */
  dashArray?: [number, number];
  /** Callback when the route line is clicked */
  onClick?: () => void;
  /** Callback when mouse enters the route line */
  onMouseEnter?: () => void;
  /** Callback when mouse leaves the route line */
  onMouseLeave?: () => void;
  /** Whether the route is interactive - shows pointer cursor on hover (default: true) */
  interactive?: boolean;
};

function MapRoute({
  id: propId,
  coordinates,
  color = "#4285F4",
  width = 3,
  opacity = 0.8,
  dashArray,
  onClick,
  onMouseEnter,
  onMouseLeave,
  interactive = true,
}: MapRouteProps) {
  const { map, isLoaded } = useMap();
  const autoId = useId();
  const id = propId ?? autoId;
  const sourceId = `route-source-${id}`;
  const layerId = `route-layer-${id}`;
  const initialPaintRef = useRef({ color, width, opacity, dashArray });

  // Add source and layer on mount
  useEffect(() => {
    if (!isLoaded || !map) return;
    const initialPaint = initialPaintRef.current;

    map.addSource(sourceId, {
      type: "geojson",
      data: {
        type: "Feature",
        properties: {},
        geometry: { type: "LineString", coordinates: [] },
      },
    });

    map.addLayer({
      id: layerId,
      type: "line",
      source: sourceId,
      layout: { "line-join": "round", "line-cap": "round" },
      paint: {
        "line-color": initialPaint.color,
        "line-width": initialPaint.width,
        "line-opacity": initialPaint.opacity,
        ...(initialPaint.dashArray && {
          "line-dasharray": initialPaint.dashArray,
        }),
      },
    });

    return () => {
      try {
        if (map.getLayer(layerId)) map.removeLayer(layerId);
        if (map.getSource(sourceId)) map.removeSource(sourceId);
      } catch {
        // ignore
      }
    };
  }, [isLoaded, layerId, map, sourceId]);

  // When coordinates change, update the source data
  useEffect(() => {
    if (!isLoaded || !map || coordinates.length < 2) return;

    const source = map.getSource(sourceId) as MapLibreGL.GeoJSONSource;
    if (source) {
      source.setData({
        type: "Feature",
        properties: {},
        geometry: { type: "LineString", coordinates },
      });
    }
  }, [isLoaded, map, coordinates, sourceId]);

  useEffect(() => {
    if (!isLoaded || !map || !map.getLayer(layerId)) return;

    map.setPaintProperty(layerId, "line-color", color);
    map.setPaintProperty(layerId, "line-width", width);
    map.setPaintProperty(layerId, "line-opacity", opacity);
    if (dashArray) {
      map.setPaintProperty(layerId, "line-dasharray", dashArray);
    }
  }, [isLoaded, map, layerId, color, width, opacity, dashArray]);

  useMapLayerMouseEvent(map, isLoaded, "click", layerId, () => {
    onClick?.();
  }, interactive);
  useMapLayerMouseEvent(map, isLoaded, "mouseenter", layerId, () => {
    map?.getCanvas().style.setProperty("cursor", "pointer");
    onMouseEnter?.();
  }, interactive);
  useMapLayerMouseEvent(map, isLoaded, "mouseleave", layerId, () => {
    map?.getCanvas().style.setProperty("cursor", "");
    onMouseLeave?.();
  }, interactive);

  return null;
}

type MapClusterLayerProps<
  P extends GeoJSON.GeoJsonProperties = GeoJSON.GeoJsonProperties
> = {
  /** GeoJSON FeatureCollection data or URL to fetch GeoJSON from */
  data: string | GeoJSON.FeatureCollection<GeoJSON.Point, P>;
  /** Maximum zoom level to cluster points on (default: 14) */
  clusterMaxZoom?: number;
  /** Radius of each cluster when clustering points in pixels (default: 50) */
  clusterRadius?: number;
  /** Colors for cluster circles: [small, medium, large] based on point count (default: ["#51bbd6", "#f1f075", "#f28cb1"]) */
  clusterColors?: [string, string, string];
  /** Point count thresholds for color/size steps: [medium, large] (default: [100, 750]) */
  clusterThresholds?: [number, number];
  /** Color for unclustered individual points (default: "#3b82f6") */
  pointColor?: string;
  /** Callback when an unclustered point is clicked */
  onPointClick?: (
    feature: GeoJSON.Feature<GeoJSON.Point, P>,
    coordinates: [number, number]
  ) => void;
  /** Callback when a cluster is clicked. If not provided, zooms into the cluster */
  onClusterClick?: (
    clusterId: number,
    coordinates: [number, number],
    pointCount: number
  ) => void;
};

function MapClusterLayer<
  P extends GeoJSON.GeoJsonProperties = GeoJSON.GeoJsonProperties
>({
  data,
  clusterMaxZoom = 14,
  clusterRadius = 50,
  clusterColors = ["#51bbd6", "#f1f075", "#f28cb1"],
  clusterThresholds = [100, 750],
  pointColor = "#3b82f6",
  onPointClick,
  onClusterClick,
}: MapClusterLayerProps<P>) {
  const { map, isLoaded } = useMap();
  const id = useId();
  const sourceId = `cluster-source-${id}`;
  const clusterLayerId = `clusters-${id}`;
  const clusterCountLayerId = `cluster-count-${id}`;
  const unclusteredLayerId = `unclustered-point-${id}`;
  const onPointClickRef = useLatestRef(onPointClick);
  const onClusterClickRef = useLatestRef(onClusterClick);
  const initialClusterConfigRef = useRef({
    data,
    clusterMaxZoom,
    clusterRadius,
    clusterColors,
    clusterThresholds,
    pointColor,
  });

  const stylePropsRef = useRef({
    clusterColors,
    clusterThresholds,
    pointColor,
  });

  // Add source and layers on mount
  useEffect(() => {
    if (!isLoaded || !map) return;
    const initialConfig = initialClusterConfigRef.current;

    // Add clustered GeoJSON source
    map.addSource(sourceId, {
      type: "geojson",
      data: initialConfig.data,
      cluster: true,
      clusterMaxZoom: initialConfig.clusterMaxZoom,
      clusterRadius: initialConfig.clusterRadius,
    });

    // Add cluster circles layer
    map.addLayer({
      id: clusterLayerId,
      type: "circle",
      source: sourceId,
      filter: ["has", "point_count"],
      paint: {
        "circle-color": [
          "step",
          ["get", "point_count"],
          initialConfig.clusterColors[0],
          initialConfig.clusterThresholds[0],
          initialConfig.clusterColors[1],
          initialConfig.clusterThresholds[1],
          initialConfig.clusterColors[2],
        ],
        "circle-radius": [
          "step",
          ["get", "point_count"],
          20,
          initialConfig.clusterThresholds[0],
          30,
          initialConfig.clusterThresholds[1],
          40,
        ],
      },
    });

    // Add cluster count text layer
    map.addLayer({
      id: clusterCountLayerId,
      type: "symbol",
      source: sourceId,
      filter: ["has", "point_count"],
      layout: {
        "text-field": "{point_count_abbreviated}",
        "text-size": 12,
      },
      paint: {
        "text-color": "#fff",
      },
    });

    // Add unclustered point layer
    map.addLayer({
      id: unclusteredLayerId,
      type: "circle",
      source: sourceId,
      filter: ["!", ["has", "point_count"]],
      paint: {
        "circle-color": initialConfig.pointColor,
        "circle-radius": 6,
      },
    });

    return () => {
      try {
        if (map.getLayer(clusterCountLayerId))
          map.removeLayer(clusterCountLayerId);
        if (map.getLayer(unclusteredLayerId))
          map.removeLayer(unclusteredLayerId);
        if (map.getLayer(clusterLayerId)) map.removeLayer(clusterLayerId);
        if (map.getSource(sourceId)) map.removeSource(sourceId);
      } catch {
        // ignore
      }
    };
  }, [
    clusterCountLayerId,
    clusterLayerId,
    isLoaded,
    map,
    sourceId,
    unclusteredLayerId,
  ]);

  // Update source data when data prop changes (only for non-URL data)
  useEffect(() => {
    if (!isLoaded || !map || typeof data === "string") return;

    const source = map.getSource(sourceId) as MapLibreGL.GeoJSONSource;
    if (source) {
      source.setData(data);
    }
  }, [isLoaded, map, data, sourceId]);

  // Update layer styles when props change
  useEffect(() => {
    if (!isLoaded || !map) return;

    const prev = stylePropsRef.current;
    const colorsChanged =
      prev.clusterColors !== clusterColors ||
      prev.clusterThresholds !== clusterThresholds;

    // Update cluster layer colors and sizes
    if (map.getLayer(clusterLayerId) && colorsChanged) {
      map.setPaintProperty(clusterLayerId, "circle-color", [
        "step",
        ["get", "point_count"],
        clusterColors[0],
        clusterThresholds[0],
        clusterColors[1],
        clusterThresholds[1],
        clusterColors[2],
      ]);
      map.setPaintProperty(clusterLayerId, "circle-radius", [
        "step",
        ["get", "point_count"],
        20,
        clusterThresholds[0],
        30,
        clusterThresholds[1],
        40,
      ]);
    }

    // Update unclustered point layer color
    if (map.getLayer(unclusteredLayerId) && prev.pointColor !== pointColor) {
      map.setPaintProperty(unclusteredLayerId, "circle-color", pointColor);
    }

    stylePropsRef.current = { clusterColors, clusterThresholds, pointColor };
  }, [
    isLoaded,
    map,
    clusterLayerId,
    unclusteredLayerId,
    clusterColors,
    clusterThresholds,
    pointColor,
  ]);

  useMapLayerMouseEvent(map, isLoaded, "click", clusterLayerId, async (e) => {
    if (!map) return;

    const features = map.queryRenderedFeatures(e.point, {
      layers: [clusterLayerId],
    });
    if (!features.length) return;

    const feature = features[0];
    const clusterId = feature.properties?.cluster_id as number;
    const pointCount = feature.properties?.point_count as number;
    const coordinates = (feature.geometry as GeoJSON.Point).coordinates as [
      number,
      number
    ];

    const latestOnClusterClick = onClusterClickRef.current;
    if (latestOnClusterClick) {
      latestOnClusterClick(clusterId, coordinates, pointCount);
    } else {
      const source = map.getSource(sourceId) as MapLibreGL.GeoJSONSource;
      const zoom = await source.getClusterExpansionZoom(clusterId);
      map.easeTo({
        center: coordinates,
        zoom,
      });
    }
  });
  useMapLayerMouseEvent(map, isLoaded, "click", unclusteredLayerId, (e) => {
    const latestOnPointClick = onPointClickRef.current;
    if (!latestOnPointClick || !e.features?.length) return;

    const feature = e.features[0];
    const coordinates = (
      feature.geometry as GeoJSON.Point
    ).coordinates.slice() as [number, number];

    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
      coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    }

    latestOnPointClick(
      feature as unknown as GeoJSON.Feature<GeoJSON.Point, P>,
      coordinates
    );
  });
  useMapLayerMouseEvent(map, isLoaded, "mouseenter", clusterLayerId, () => {
    map?.getCanvas().style.setProperty("cursor", "pointer");
  });
  useMapLayerMouseEvent(map, isLoaded, "mouseleave", clusterLayerId, () => {
    map?.getCanvas().style.setProperty("cursor", "");
  });
  useMapLayerMouseEvent(map, isLoaded, "mouseenter", unclusteredLayerId, () => {
    if (onPointClickRef.current) {
      map?.getCanvas().style.setProperty("cursor", "pointer");
    }
  });
  useMapLayerMouseEvent(map, isLoaded, "mouseleave", unclusteredLayerId, () => {
    map?.getCanvas().style.setProperty("cursor", "");
  });

  return null;
}

type MapHybridClusterLayerProps<
  P extends GeoJSON.GeoJsonProperties = GeoJSON.GeoJsonProperties
> = {
  /** GeoJSON FeatureCollection data */
  data: GeoJSON.FeatureCollection<GeoJSON.Point, P>;
  /** Maximum zoom level to cluster points on (default: 14) */
  clusterMaxZoom?: number;
  /** Radius of each cluster when clustering points in pixels (default: 50) */
  clusterRadius?: number;
  /** Colors for cluster circles: [small, medium, large] based on point count (default: ["#51bbd6", "#f1f075", "#f28cb1"]) */
  clusterColors?: [string, string, string];
  /** Point count thresholds for color/size steps: [medium, large] (default: [100, 750]) */
  clusterThresholds?: [number, number];
  /** Color of the cluster count text (default: "#ffffff") */
  clusterTextColor?: string;
  /** IDs of features that should always be rendered regardless of clustering/viewport */
  forceVisibleFeatureIds?: (string | number)[];
  /** Render prop for unclustered points */
  children: (features: GeoJSON.Feature<GeoJSON.Point, P>[]) => ReactNode;
  /** Callback when a cluster is clicked */
  onClusterClick?: (
    clusterId: number,
    coordinates: [number, number],
    pointCount: number
  ) => void;
};

const EMPTY_FORCE_VISIBLE_FEATURE_IDS: (string | number)[] = [];

function MapHybridClusterLayer<
  P extends GeoJSON.GeoJsonProperties = GeoJSON.GeoJsonProperties
>({
  data,
  clusterMaxZoom = 14,
  clusterRadius = 50,
  clusterColors = ["#51bbd6", "#f1f075", "#f28cb1"],
  clusterThresholds = [100, 750],
  clusterTextColor = "#ffffff",
  forceVisibleFeatureIds = EMPTY_FORCE_VISIBLE_FEATURE_IDS,
  children,
  onClusterClick,
}: MapHybridClusterLayerProps<P>) {
  const { map, isLoaded } = useMap();
  const id = useId();
  const sourceId = `hybrid-cluster-source-${id}`;
  const clusterLayerId = `hybrid-clusters-${id}`;
  const clusterCountLayerId = `hybrid-cluster-count-${id}`;
  const onClusterClickRef = useLatestRef(onClusterClick);
  const initialClusterConfigRef = useRef({
    data,
    clusterMaxZoom,
    clusterRadius,
    clusterColors,
    clusterThresholds,
    clusterTextColor,
  });

  const [unclusteredFeatures, setUnclusteredFeatures] = useState<
    GeoJSON.Feature<GeoJSON.Point, P>[]
  >([]);

  // Add source and cluster layers
  useEffect(() => {
    if (!isLoaded || !map) return;
    const initialConfig = initialClusterConfigRef.current;

    map.addSource(sourceId, {
      type: "geojson",
      data: initialConfig.data,
      cluster: true,
      clusterMaxZoom: initialConfig.clusterMaxZoom,
      clusterRadius: initialConfig.clusterRadius,
    });

    // Add cluster circles layer
    map.addLayer({
      id: clusterLayerId,
      type: "circle",
      source: sourceId,
      filter: ["has", "point_count"],
      paint: {
        "circle-color": [
          "step",
          ["get", "point_count"],
          initialConfig.clusterColors[0],
          initialConfig.clusterThresholds[0],
          initialConfig.clusterColors[1],
          initialConfig.clusterThresholds[1],
          initialConfig.clusterColors[2],
        ],
        "circle-radius": [
          "step",
          ["get", "point_count"],
          20,
          initialConfig.clusterThresholds[0],
          30,
          initialConfig.clusterThresholds[1],
          40,
        ],
      },
    });

    // Add cluster count text layer
    map.addLayer({
      id: clusterCountLayerId,
      type: "symbol",
      source: sourceId,
      filter: ["has", "point_count"],
      layout: {
        "text-field": "{point_count_abbreviated}",
        "text-size": 12,
      },
      paint: {
        "text-color": initialConfig.clusterTextColor,
      },
    });

    // Hidden transparent layer for unclustered points to enable queryRenderedFeatures
    map.addLayer({
      id: `${sourceId}-hidden-points`,
      type: "circle",
      source: sourceId,
      filter: ["!", ["has", "point_count"]],
      paint: {
        "circle-color": "transparent",
        "circle-radius": 1,
        "circle-opacity": 0,
      },
    });

    return () => {
      try {
        if (map.getLayer(clusterCountLayerId))
          map.removeLayer(clusterCountLayerId);
        if (map.getLayer(clusterLayerId)) map.removeLayer(clusterLayerId);
        if (map.getLayer(`${sourceId}-hidden-points`))
          map.removeLayer(`${sourceId}-hidden-points`);
        if (map.getSource(sourceId)) map.removeSource(sourceId);
      } catch {
        // ignore
      }
    };
  }, [clusterCountLayerId, clusterLayerId, isLoaded, map, sourceId]);

  // Update data
  useEffect(() => {
    if (!isLoaded || !map) return;
    const source = map.getSource(sourceId) as MapLibreGL.GeoJSONSource;
    if (source) {
      source.setData(data);
    }
  }, [isLoaded, map, data, sourceId]);

  // Update layer styles
  useEffect(() => {
    if (!isLoaded || !map || !map.getLayer(clusterLayerId)) return;

    map.setPaintProperty(clusterLayerId, "circle-color", [
      "step",
      ["get", "point_count"],
      clusterColors[0],
      clusterThresholds[0],
      clusterColors[1],
      clusterThresholds[1],
      clusterColors[2],
    ]);

    map.setPaintProperty(clusterLayerId, "circle-radius", [
      "step",
      ["get", "point_count"],
      20,
      clusterThresholds[0],
      30,
      clusterThresholds[1],
      40,
    ]);
  }, [isLoaded, map, clusterLayerId, clusterColors, clusterThresholds]);

  // Update text color
  useEffect(() => {
    if (!isLoaded || !map || !map.getLayer(clusterCountLayerId)) return;
    map.setPaintProperty(clusterCountLayerId, "text-color", clusterTextColor);
  }, [isLoaded, map, clusterCountLayerId, clusterTextColor]);

  // Handle updates to visible unclustered points
  useEffect(() => {
    if (!isLoaded || !map) return;

    let timeoutId: ReturnType<typeof setTimeout>;

    const updateUnclusteredPoints = () => {
      // Query the hidden layer for visible unclustered points
      const features = map.queryRenderedFeatures({
        layers: [`${sourceId}-hidden-points`],
      }) as unknown as GeoJSON.Feature<GeoJSON.Point, P>[];

      // Remove duplicates
      const uniqueFeatures = new globalThis.Map<
        string | number,
        GeoJSON.Feature<GeoJSON.Point, P>
      >();

      // Add forced visible features first (so they are always included)
      if (forceVisibleFeatureIds.length > 0 && data && typeof data !== 'string') {
        data.features.forEach(feature => {
          if (feature.id && forceVisibleFeatureIds.includes(feature.id)) {
            uniqueFeatures.set(feature.id, feature);
          }
        });
      }

      features.forEach((f) => {
        if (f.id !== undefined) uniqueFeatures.set(f.id, f);
      });

      setUnclusteredFeatures(Array.from(uniqueFeatures.values()));
    };

    const onMove = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateUnclusteredPoints, 100);
    };

    // Initial update
    updateUnclusteredPoints();

    map.on("move", onMove);
    map.on("moveend", onMove);
    map.on("zoomend", onMove);

    // Also listen for source data changes (important for theme switches/initial load)
    const onSourceData = (e: MapLibreGL.MapSourceDataEvent) => {
      if (e.sourceId === sourceId && e.isSourceLoaded) {
        onMove();
      }
    };
    map.on("sourcedata", onSourceData);

    return () => {
      map.off("move", onMove);
      map.off("moveend", onMove);
      map.off("zoomend", onMove);
      map.off("sourcedata", onSourceData);
      clearTimeout(timeoutId);
    };
  }, [isLoaded, map, sourceId, data, forceVisibleFeatureIds]);

  useMapLayerMouseEvent(map, isLoaded, "click", clusterLayerId, async (e) => {
    if (!map) return;

    const features = map.queryRenderedFeatures(e.point, {
      layers: [clusterLayerId],
    });
    if (!features.length) return;

    const feature = features[0];
    const clusterId = feature.properties?.cluster_id as number;
    const pointCount = feature.properties?.point_count as number;
    const coordinates = (feature.geometry as GeoJSON.Point).coordinates as [
      number,
      number
    ];

    const latestOnClusterClick = onClusterClickRef.current;
    if (latestOnClusterClick) {
      latestOnClusterClick(clusterId, coordinates, pointCount);
    } else {
      const source = map.getSource(sourceId) as MapLibreGL.GeoJSONSource;
      const zoom = await source.getClusterExpansionZoom(clusterId);
      map.easeTo({
        center: coordinates,
        zoom: zoom + 1,
      });
    }
  });
  useMapLayerMouseEvent(map, isLoaded, "mouseenter", clusterLayerId, () => {
    map?.getCanvas().style.setProperty("cursor", "pointer");
  });
  useMapLayerMouseEvent(map, isLoaded, "mouseleave", clusterLayerId, () => {
    map?.getCanvas().style.setProperty("cursor", "");
  });

  return <>{children(unclusteredFeatures)}</>;
}

export {
  Map,
  MapClusterLayer,
  MapControls,
  MapErrorFallback,
  MapMarker,
  MapPopup,
  MapHybridClusterLayer,
  MapRoute,
  MarkerContent,
  MarkerLabel,
  MarkerPopup,
  MarkerTooltip,
  useMap,
  isWebGLSupported,
};

export type { MapRef };
