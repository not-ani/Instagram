import { Skeleton } from "@/components/ui/skeleton";

export function PostSkeleton() {
  return (
    <div className="flex flex-col space-y-4 p-10">
      {/* Post Header */}
      <div className="flex items-center justify-between">
        {/* User info */}
        <div className="flex items-center space-x-2">
          {/* Profile Picture */}
          <Skeleton className="h-12 w-12 rounded-full" />

          {/* User Name */}
          <Skeleton className="h-4 w-24" />
        </div>

        {/* More Icon */}
        <Skeleton className="h-6 w-6 rounded" />
      </div>

      {/* Post Image */}
      <div className="relative w-full">
        <Skeleton className="h-64 w-full" />
      </div>

      {/* Post Actions (Like, Comment) */}
      <div className="flex items-center justify-between">
        {/* Like */}
        <div className="flex items-center space-x-2">
          <Skeleton className="h-6 w-6 rounded" />
          <Skeleton className="h-4 w-8" />
        </div>

        {/* Comment */}
        <div className="flex items-center space-x-2">
          <Skeleton className="h-6 w-6 rounded" />
          <Skeleton className="h-4 w-8" />
        </div>
      </div>

      {/* Post Comments */}
      <div className="flex flex-col space-y-2">
        {/* Comment 1 */}
        <div>
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-16" />
        </div>

        {/* Comment 2 */}
        <div>
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
  );
}


