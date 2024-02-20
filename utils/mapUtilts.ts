export const getTileLayerUrl = (layerName: string) => {
  switch (layerName) {
    case "road":
      return "https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}";
    case "satellite":
      return `https://tiles.stadiamaps.com/tiles/osm_bright/{z}/{x}/{y}{r}.png?api_key=${process.env.NEXT_PUBLIC_STADIA_API_KEY}`;
    case "dark":
      return `https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png?api_key=${process.env.NEXT_PUBLIC_STADIA_API_KEY}`;
    default:
      return "https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}";
  }
};

export const getTileLayerTheme = (resolvedTheme: string | undefined) =>
  resolvedTheme === "dark" ? "dark" : "road";
