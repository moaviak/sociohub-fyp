import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppSelector } from "@/app/hooks";
import { useAddCommentMutation } from "../../api";

export const PostCommentForm: React.FC<{ postId: string }> = ({ postId }) => {
  const currentUser = useAppSelector((state) => state.auth.user);
  const [comment, setComment] = useState("");
  const [addComment, { isLoading }] = useAddCommentMutation();

  const handleComment = async () => {
    if (comment.trim()) {
      await addComment({ postId, content: comment });
      setComment("");
    }
  };

  return (
    <div className="border-t border-gray-100">
      <div className="flex items-center gap-3">
        <Avatar className="size-8">
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
            className="border-none shadow-none text-sm placeholder-gray-500 p-0 h-auto focus-visible:ring-0"
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
  );
};
