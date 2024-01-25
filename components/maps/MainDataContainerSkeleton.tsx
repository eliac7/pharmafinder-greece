import PharmacyListSkeleton from "./PharmacyListSkeleton";
import PharmacyMapSkeleton from "./PharmacyMapSkeleton";

function MainDataContainerSkeleton({ isLoading }: { isLoading?: boolean }) {
  return (
    <div className="mx-auto flex h-full w-full overflow-hidden rounded-3xl">
      <div className="w-full flex-1 bg-blue-400 dark:bg-primary-900">
        <PharmacyMapSkeleton />
      </div>
      <div className="w-1/4 bg-white p-4 dark:bg-slate-900">
        <PharmacyListSkeleton />
      </div>
    </div>
  );
}

export default MainDataContainerSkeleton;
