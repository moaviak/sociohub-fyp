import React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Post } from "../../types";

interface PostMediaProps {
  post: Post;
}

export const PostMedia: React.FC<PostMediaProps> = ({ post }) => {
  if (!post.media || post.media.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      <Carousel className="w-full">
        <CarouselContent>
          {post.media.map((medium) => (
            <CarouselItem key={medium.id}>
              <div className="aspect-square bg-gray-100">
                {medium.type === "IMAGE" ? (
                  <img
                    src={medium.url}
                    alt="Post media"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <video
                    src={medium.url}
                    className="w-full h-full object-cover"
                    controls
                    autoPlay
                    playsInline
                  />
                )}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        {post.media.length > 1 && (
          <>
            <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white border-none h-8 w-8" />
            <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white border-none h-8 w-8" />
          </>
        )}
      </Carousel>
    </div>
  );
};
