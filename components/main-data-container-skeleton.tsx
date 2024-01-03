import PharmacyListSkeleton from "./pharmacy-list-skeleton";
import PharmacyMapSkeleton from "./pharmacy-map-skeleton";

function MainDataContainerSkeleton({ isLoading }: { isLoading?: boolean }) {
  return (
    <div className="mx-auto flex h-full w-full overflow-hidden rounded-3xl">
      <div className="w-full flex-1 bg-blue-300">
        <PharmacyMapSkeleton />
      </div>
      <div className="w-1/4 bg-white p-4">
        <PharmacyListSkeleton />
      </div>
    </div>
  );
}

export default MainDataContainerSkeleton;