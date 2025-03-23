import { Skeleton } from "@/components/ui/skeleton";

export const AppSkeleton = () => {
  return (
    <div className="flex">
      <div className="flex flex-col gap-y-2 items-center px-2 py-4">
        <Skeleton className="h-[60px] w-[200px] rounded-lg mb-6" />

        <Skeleton className="h-[60px] w-[220px] rounded-md" />
        <Skeleton className="h-[60px] w-[220px] rounded-md" />
        <Skeleton className="h-[60px] w-[220px] rounded-md" />
        <Skeleton className="h-[60px] w-[220px] rounded-md" />
        <Skeleton className="h-[60px] w-[220px] rounded-md" />
        <Skeleton className="h-[60px] w-[220px] rounded-md" />
        <Skeleton className="h-[60px] w-[220px] rounded-md" />
        <Skeleton className="h-[60px] w-[220px] rounded-md" />
      </div>

      <div className="flex-1 flex flex-col p-4">
        <div className="w-full h-[60px] flex justify-between items-center">
          <Skeleton className="w-lg h-9 rounded-xl" />

          <div className="flex items-center gap-x-4">
            <Skeleton className="w-10 h-10 rounded-full" />
            <Skeleton className="h-[60px] w-[220px]" />
          </div>
        </div>

        <div className="flex-1 grid grid-cols-2 px-4 py-8">
          <div className="flex flex-col gap-y-4">
            <div className="flex gap-x-2">
              <Skeleton className="w-[120px] h-[80px]" />
              <div className="flex flex-col gap-y-2">
                <Skeleton className="w-[80px] h-[20px]" />
                <Skeleton className="w-[240px] h-[20px]" />
                <Skeleton className="w-[140px] h-[20px]" />
              </div>
            </div>
            <div className="flex gap-x-2">
              <Skeleton className="w-[120px] h-[80px]" />
              <div className="flex flex-col gap-y-2">
                <Skeleton className="w-[80px] h-[20px]" />
                <Skeleton className="w-[240px] h-[20px]" />
                <Skeleton className="w-[140px] h-[20px]" />
              </div>
            </div>
            <div className="flex gap-x-2">
              <Skeleton className="w-[120px] h-[80px]" />
              <div className="flex flex-col gap-y-2">
                <Skeleton className="w-[80px] h-[20px]" />
                <Skeleton className="w-[240px] h-[20px]" />
                <Skeleton className="w-[140px] h-[20px]" />
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-y-4">
            <div className="flex gap-x-2">
              <Skeleton className="w-[50px] h-[50px] rounded-full" />
              <div className="flex flex-col gap-y-2">
                <Skeleton className="w-[140px] h-[20px]" />
                <Skeleton className="w-[240px] h-[20px]" />
                <Skeleton className="w-[350px] h-[80px]" />
              </div>
            </div>
            <div className="flex gap-x-2">
              <Skeleton className="w-[50px] h-[50px] rounded-full" />
              <div className="flex flex-col gap-y-2">
                <Skeleton className="w-[140px] h-[20px]" />
                <Skeleton className="w-[240px] h-[20px]" />
                <Skeleton className="w-[350px] h-[80px]" />
              </div>
            </div>
            <div className="flex gap-x-2">
              <Skeleton className="w-[50px] h-[50px] rounded-full" />
              <div className="flex flex-col gap-y-2">
                <Skeleton className="w-[140px] h-[20px]" />
                <Skeleton className="w-[240px] h-[20px]" />
                <Skeleton className="w-[350px] h-[80px]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
