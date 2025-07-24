import { Skeleton } from "@/components/ui/skeleton";

export const PostDetailSkeleton = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <Skeleton className="h-8 w-8 rounded-md" />
        <Skeleton className="h-6 w-20" />
        <div className="w-8"></div>
      </div>

      <div className="lg:flex lg:h-screen lg:pt-0">
        {/* Media Section - Edge to Edge */}
        <div className="lg:flex-1 lg:flex lg:items-center lg:justify-center lg:bg-gray-100">
          <Skeleton className="w-full h-full aspect-square lg:aspect-auto" />
        </div>

        {/* Details Section - Increased width */}
        <div className="lg:w-[40%] lg:border-l lg:border-gray-200 bg-white">
          <div className="flex flex-col h-full lg:max-h-screen">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center">
                <Skeleton className="w-8 h-8 rounded-full" />
                <Skeleton className="h-4 w-24 ml-3" />
              </div>
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>

            {/* Comments Section */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Original Post Caption */}
              <div className="flex gap-3">
                <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>

              {/* Comments */}
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))}
            </div>

            {/* Actions and Add Comment */}
            <div className="border-t border-gray-200 p-4 space-y-3">
              {/* Action Buttons */}
              <div className="flex items-center gap-4">
                <Skeleton className="h-6 w-6" />
                <Skeleton className="h-6 w-6" />
              </div>

              {/* Likes count */}
              <Skeleton className="h-4 w-16" />

              {/* Time */}
              <Skeleton className="h-3 w-20" />

              {/* Add comment */}
              <div className="border-t border-gray-200 pt-2">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
