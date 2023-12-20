import dynamic from "next/dynamic";

const PharmacyMap = dynamic(() => import("@/components/maps/pharmacyMap"), {
  ssr: false,
});

const ThumbnailMap = dynamic(() => import("@/components/maps/thumbnailMap"), {
  ssr: false,
});

export { PharmacyMap, ThumbnailMap };
