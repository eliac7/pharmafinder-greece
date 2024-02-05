import { getTileLayerUrl } from "@/utils/mapUtilts";
import React from "react";
import { TileLayer } from "react-leaflet";

interface TileLayerComponentProps {
  layerName: string;
  [key: string]: any;
}

const CustomTileLayer: React.FC<TileLayerComponentProps> = ({
  layerName,
  ...props
}) => {
  return (
    <TileLayer
      url={getTileLayerUrl(layerName)}
      subdomains={["mt0", "mt1", "mt2", "mt3"]}
      {...props}
    />
  );
};

export default CustomTileLayer;
