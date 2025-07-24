import React from "react";
import { Heart, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";

interface PostActionsProps {
  isLiked: boolean;
  onLike: () => void;
  postId: string;
}

export const PostActions: React.FC<PostActionsProps> = ({
  isLiked,
  onLike,
  postId,
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          className="h-auto p-0 hover:bg-transparent"
          onClick={onLike}
        >
          <Heart
            size={24}
            className={`${
              isLiked
                ? "fill-red-500 text-red-500"
                : "text-gray-900 hover:text-gray-600"
            } transition-colors`}
          />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-auto p-0 hover:bg-transparent"
          asChild
        >
          <Link to={`/posts/${postId}`}>
            <MessageCircle
              size={24}
              className="text-gray-900 hover:text-gray-600 transition-colors"
            />
          </Link>
        </Button>
      </div>
    </div>
  );
};
