import React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Post } from "../../types";

interface PostDetailMediaProps {
  post: Post;
}

export const PostDetailMedia: React.FC<PostDetailMediaProps> = ({ post }) => {
  if (!post.media || post.media.length === 0) {
    return null;
  }

  return (
    <div className="lg:flex-1 lg:flex lg:items-center lg:justify-center lg:bg-gray-100">
      <div className="relative w-full h-full">
        <Carousel className="w-full h-full flex justify-center">
          <CarouselContent className="w-full h-full flex-1">
            {post.media.map((medium) => (
              <CarouselItem key={medium.id}>
                <div className="aspect-square lg:aspect-auto lg:h-full bg-gray-100 overflow-hidden">
                  {medium.type === "IMAGE" ? (
                    <img
                      src={medium.url}
                      alt="Post media"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <video
                      src={medium.url}
                      className="w-full h-full object-contain"
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
              <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white/90 text-gray-900 border border-gray-200 h-8 w-8" />
              <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white/90 text-gray-900 border border-gray-200 h-8 w-8" />
            </>
          )}
        </Carousel>
      </div>
    </div>
  );
};
