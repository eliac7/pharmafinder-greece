import { Skeleton } from "@/shared/ui/skeleton";

export function SidebarFiltersSkeleton() {
  return (
    <div className="mt-4 px-1 space-y-3">
      <div>
        <Skeleton className="h-3 w-12 mb-3" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-16 rounded-full" />
          <Skeleton className="h-8 w-16 rounded-full" />
          <Skeleton className="h-8 w-20 rounded-full" />
        </div>
      </div>
      <div>
        <Skeleton className="h-3 w-24 mb-3" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-12 rounded-full" />
          <Skeleton className="h-8 w-12 rounded-full" />
          <Skeleton className="h-8 w-14 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function SidebarListSkeleton() {
  return (
    <div className="flex flex-col gap-3 py-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex p-4 rounded-2xl bg-card gap-4">
          <Skeleton className="size-12 rounded-xl shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}
