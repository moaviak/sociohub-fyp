import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Attachment } from "../types";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export const MediaCarousel: React.FC<{
  isOpen: boolean;
  initialIndex: number;
  attachments: Attachment[];
  onClose: () => void;
}> = ({ isOpen, initialIndex, onClose, attachments }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  const nextImage = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev + 1) % attachments.length);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const prevImage = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex(
      (prev) => (prev - 1 + attachments.length) % attachments.length
    );
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") prevImage();
    if (e.key === "ArrowRight") nextImage();
    if (e.key === "Escape") onClose();
  };

  const goToImage = (index: number) => {
    if (!isTransitioning && index !== currentIndex) {
      setIsTransitioning(true);
      setCurrentIndex(index);
      setTimeout(() => setIsTransitioning(false), 300);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="min-w-[100vw] h-[100vh] p-0 focus:outline-none"
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
        <div className="relative w-full h-full bg-black rounded-lg overflow-hidden">
          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-20 text-white hover:bg-white/20 bg-black/50"
            onClick={onClose}
          >
            <X className="size-4" />
          </Button>

          {/* Navigation Buttons */}
          {attachments.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/50 border-white/20 text-white hover:bg-white/20"
                onClick={prevImage}
                disabled={isTransitioning}
              >
                <ChevronLeft className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/50 border-white/20 text-white hover:bg-white/20"
                onClick={nextImage}
                disabled={isTransitioning}
              >
                <ChevronRight className="size-4" />
              </Button>
            </>
          )}

          {/* Carousel Container - Simplified approach */}
          <div className="relative w-full h-full overflow-hidden">
            <div
              className="flex h-full transition-transform duration-300 ease-in-out"
              style={{
                // Move by 100% of container width for each slide
                transform: `translateX(-${currentIndex * 100}%)`,
              }}
            >
              {attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="flex-shrink-0 flex items-center justify-center p-12"
                  style={{
                    // Each slide takes exactly 100% of the container width
                    width: "100%",
                    height: "100%",
                  }}
                >
                  {attachment.type === "IMAGE" ? (
                    <img
                      src={attachment.url}
                      alt={attachment.name || "Image"}
                      className="max-w-full max-h-full object-contain rounded shadow-2xl"
                    />
                  ) : (
                    <video
                      src={attachment.url}
                      controls
                      className="max-w-full max-h-full object-contain rounded shadow-2xl"
                    >
                      Your browser does not support the video tag.
                    </video>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Indicators */}
          {attachments.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
              {attachments.map((_, index) => (
                <button
                  key={index}
                  className={cn(
                    "w-2 h-2 rounded-full transition-colors duration-200",
                    index === currentIndex ? "bg-white" : "bg-white/50"
                  )}
                  onClick={() => goToImage(index)}
                />
              ))}
            </div>
          )}

          {/* Counter */}
          {attachments.length > 1 && (
            <div className="absolute top-4 left-4 z-20 text-white text-sm bg-black/50 px-3 py-1 rounded">
              {currentIndex + 1} / {attachments.length}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
