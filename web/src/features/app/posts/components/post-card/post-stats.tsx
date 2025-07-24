import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Post } from "../../types";
import { Link } from "react-router";
import { Ticket } from "lucide-react";

interface PostStatsProps {
  post: Post;
  likes: number;
}

export const PostStats: React.FC<PostStatsProps> = ({ post, likes }) => {
  const [expanded, setExpanded] = useState(false);
  const [showSeeMore, setShowSeeMore] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      const lineHeight = parseFloat(
        getComputedStyle(contentRef.current).lineHeight
      );
      const maxHeight = lineHeight * 2;
      setShowSeeMore(contentRef.current.scrollHeight > maxHeight + 2);
    }
  }, [post.content]);

  return (
    <>
      {/* Likes count */}
      <div className="">
        <span className="font-semibold text-sm text-gray-900">
          {likes.toLocaleString()} likes
        </span>
      </div>

      {/* Caption */}
      {post.content && (
        <div className="">
          <div
            ref={contentRef}
            className={`text-sm transition-all duration-200 ${
              !expanded && showSeeMore ? "line-clamp-2" : ""
            }`}
          >
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
            <span className="b3-semibold text-neutral-900 mr-2">
              {post.society.name}
            </span>
            <span className="text-neutral-900 b3-regular">{post.content}</span>
          </div>
          {showSeeMore && (
            <button
              className="text-primary-600 b4-medium mt-1 self-start hover:underline focus:outline-none"
              onClick={() => setExpanded((v) => !v)}
              type="button"
            >
              {expanded ? "See less" : "See more"}
            </button>
          )}
        </div>
      )}

      {/* View comments */}
      <Button
        variant="ghost"
        size="sm"
        className="h-auto p-0 text-sm text-gray-500 hover:text-gray-700 hover:bg-transparent font-normal"
        asChild
      >
        <Link to={`/posts/${post.id}`}>View all comments</Link>
      </Button>
    </>
  );
};
