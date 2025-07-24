import React from "react";
import { Post } from "../types";
import { Skeleton } from "@/components/ui/skeleton";
import { PostHeader } from "./post-card/post-header";
import { PostMedia } from "./post-card/post-media";
import { PostActions } from "./post-card/post-actions";
import { PostStats } from "./post-card/post-stats";
import { PostCommentForm } from "./post-card/post-comment-form";
import { usePostLikeHandler } from "../hooks/use-post-like-handler";

export const PostCard: React.FC<{ post: Post }> = ({ post }) => {
  const { isLiked, likes, handleLike } = usePostLikeHandler(post);

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden max-w-lg mx-auto shadow-sm p-4">
      <PostHeader post={post} />
      <PostMedia post={post} />
      <div className="space-y-2 py-2">
        <PostActions postId={post.id} isLiked={isLiked} onLike={handleLike} />
        <PostStats post={post} likes={likes} />
        <PostCommentForm postId={post.id} />
      </div>
    </div>
  );
};

export const PostCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden max-w-lg mx-auto shadow-sm p-4">
      {/* Header */}
      <div className="flex items-center justify-between py-2">
        <div className="flex items-center">
          <Skeleton className="size-10 rounded-full" />
          <div className="flex flex-col ml-2 space-y-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
        <Skeleton className="h-8 w-8 rounded-md" />
      </div>

      {/* Media Skeleton */}
      <div className="relative">
        <Skeleton className="w-full aspect-square" />
      </div>

      {/* Actions */}
      <div className="space-y-2 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="h-6 w-6" />
            <Skeleton className="h-6 w-6" />
          </div>
        </div>

        {/* Likes count */}
        <div>
          <Skeleton className="h-4 w-16" />
        </div>

        {/* Caption */}
        <div className="space-y-1">
          <div className="flex items-start gap-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-40" />
          </div>
          <Skeleton className="h-4 w-32" />
        </div>

        {/* View comments */}
        <Skeleton className="h-4 w-28" />

        {/* Add comment */}
        <div className="border-t border-gray-100 pt-2">
          <div className="flex items-center gap-3">
            <Skeleton className="size-8 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
