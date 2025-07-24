import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAppSelector } from "@/app/hooks";
import { multiFormatDateString } from "@/lib/utils";
import { Post } from "../../types";
import { usePostLikeHandler } from "../../hooks/use-post-like-handler";
import { useAddCommentMutation } from "../../api";

interface PostDetailActionsProps {
  post: Post;
}

export const PostDetailActions: React.FC<PostDetailActionsProps> = ({ post }) => {
  const [comment, setComment] = useState("");
  const currentUser = useAppSelector((state) => state.auth.user);
  const { isLiked, likes, handleLike } = usePostLikeHandler(post);
  const [addComment, { isLoading }] = useAddCommentMutation();

  const handleComment = async () => {
    if (comment.trim()) {
      await addComment({ postId: post.id, content: comment });
      setComment("");
    }
  };

  return (
    <div className="border-t border-gray-200 py-4 space-y-1">
      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-0 hover:bg-transparent"
            onClick={handleLike}
          >
            <Heart
              size={24}
              className={`${isLiked
                  ? "fill-red-500 text-red-500"
                  : "text-gray-900 hover:text-gray-600"
                } transition-colors`}
            />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-0 hover:bg-transparent"
          >
            <MessageCircle
              size={24}
              className="text-gray-900 hover:text-gray-600 transition-colors"
            />
          </Button>
        </div>
      </div>

      {/* Likes count */}
      <div>
        <span className="font-semibold text-sm text-gray-900">
          {likes.toLocaleString()} likes
        </span>
      </div>

      {/* Time */}
      <div>
        <span className="text-xs text-gray-500 uppercase">
          {multiFormatDateString(post.createdAt)}
        </span>
      </div>

      {/* Add comment */}
      <div className="border-t border-gray-200 pt-2">
        <div className="flex items-center gap-3">
          <Avatar className="w-8 h-8">
            <AvatarImage src={currentUser!.avatar} />
            <AvatarFallback className="bg-gray-200 text-gray-600 text-xs">
              {currentUser!.firstName?.substring(0, 1)}
              {currentUser!.lastName?.substring(0, 1)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 flex items-center gap-2">
            <Input
              type="text"
              placeholder="Add a comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="border-none shadow-none text-sm placeholder-gray-500 p-0 h-auto focus-visible:ring-0 bg-transparent text-gray-900"
              onKeyDown={(e) =>
                e.key === "Enter" && !e.shiftKey && handleComment()
              }
              disabled={isLoading}
            />
            {comment.trim() && (
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 text-blue-500 hover:text-blue-600 hover:bg-transparent font-semibold text-sm"
                onClick={handleComment}
                disabled={isLoading}
              >
                Post
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

