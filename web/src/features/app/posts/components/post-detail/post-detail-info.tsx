import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { multiFormatDateString } from "@/lib/utils";
import { Post } from "../../types";
import { Ticket } from "lucide-react";
import { Link } from "react-router";

interface PostDetailInfoProps {
  post: Post;
}

export const PostDetailInfo: React.FC<PostDetailInfoProps> = ({ post }) => {
  return (
    <div className="flex-1 overflow-y-auto py-4 space-y-4">
      {/* Original Post Caption */}
      {post.content && (
        <div className="flex gap-3">
          <Avatar className="w-8 h-8 flex-shrink-0">
            <AvatarImage
              src={
                post.society.logo || "/assets/images/society-placeholder.png"
              }
              alt={post.society.name}
            />
            <AvatarFallback className="bg-gray-200 text-gray-600 text-xs">
              {post.society.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="text-sm">
              {post.event && (
                <Link to={`/event/${post.event.id}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <Ticket className="size-4 text-primary-500" />
                    <span className="text-primary-500 font-semibold text-xs">
                      {post.event.title}
                    </span>
                  </div>
                </Link>
              )}
              <span className="font-semibold text-gray-900 mr-2">
                {post.society.name}
              </span>
              <span className="text-gray-700">{post.content}</span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {multiFormatDateString(post.createdAt)}
            </div>
          </div>
        </div>
      )}

      {/* Comments */}
      {post.comments.map((comment) => {
        const user = comment.author.student || comment.author.advisor!;
        return (
          <div key={comment.id} className="flex gap-3">
            <Avatar className="w-8 h-8 flex-shrink-0">
              <AvatarImage src={user.avatar} />
              <AvatarFallback className="bg-gray-200 text-gray-600 text-xs">
                {user.firstName?.substring(0, 1)}
                {user.lastName?.substring(0, 1)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="text-sm">
                <span className="font-semibold text-gray-900 mr-2">
                  {user.firstName} {user.lastName}
                </span>
                <span className="text-gray-700">{comment.content}</span>
              </div>
              <div className="flex items-center gap-4 mt-1">
                <span className="text-xs text-gray-500">
                  {multiFormatDateString(comment.createdAt)}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
