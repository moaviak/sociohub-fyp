import { Skeleton } from "../ui/skeleton";

export const KPICardSkeleton = () => {
  return (
    <div className="flex flex-col justify-between gap-y-6 p-4 bg-white rounded-lg drop-shadow-e1">
      <div className="flex-1 flex items-center justify-between">
        <div className="h-full space-y-3">
          <Skeleton className="w-[115px] h-[20px]" />
          <Skeleton className="w-[115px] h-[34px]" />
        </div>
        <Skeleton className="size-12 rounded-full" />
      </div>
      <Skeleton className="w-full h-[20px]" />
    </div>
  );
};
