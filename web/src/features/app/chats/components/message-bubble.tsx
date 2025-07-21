import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Message } from "../types";
import { Button } from "@/components/ui/button";
import { InfoIcon, Loader2, Download } from "lucide-react";
import { Hint } from "@/components/hint";
import { MediaCarousel } from "./media-carousel";
import { getDocumentIcon } from "./document-icon";
import { MessageOptions } from "./message-option";

const formatFileSize = (bytes?: number): string => {
  if (!bytes) return "Unknown size";
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
};

const getGridClass = (count: number): string => {
  if (count === 1) return "grid-cols-1";
  if (count === 2) return "grid-cols-2";
  if (count === 3) return "grid-cols-2";
  if (count >= 4) return "grid-cols-2";
  return "grid-cols-1";
};

const getAttachmentClass = (count: number, index: number): string => {
  if (count === 1) {
    return "col-span-1 aspect-square";
  }
  if (count === 2) {
    return "col-span-1 aspect-square";
  }
  if (count === 3) {
    if (index === 0) {
      return "col-span-2 aspect-square";
    }
    return "col-span-1 aspect-square";
  }
  if (count >= 4) {
    return "col-span-1 aspect-square";
  }
  return "col-span-1 aspect-square";
};

const downloadFile = async (url: string, filename: string) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    console.error("Download failed:", error);
  }
};

export const MessageBubble: React.FC<{
  message: Message;
  isSender: boolean;
  isFirstInGroup: boolean;
}> = ({ message, isSender, isFirstInGroup }) => {
  const [carouselOpen, setCarouselOpen] = useState(false);
  const [selectedAttachmentIndex, setSelectedAttachmentIndex] = useState(0);

  const mediaAttachments = message.attachments?.filter(
    (att) => att.type === "IMAGE" || att.type === "VIDEO"
  );
  const documentAttachments = message.attachments?.filter(
    (att) => att.type === "DOCUMENT"
  );

  const openCarousel = (index: number) => {
    setSelectedAttachmentIndex(index);
    setCarouselOpen(true);
  };

  const displayAttachments = mediaAttachments?.slice(0, 4);
  const remainingCount = mediaAttachments
    ? Math.max(0, mediaAttachments.length - 4)
    : 0;

  return (
    <>
      <div
        className={cn(
          "w-full flex items-center gap-x-2 group",
          isSender ? "flex-row-reverse" : "justify-start"
        )}
      >
        {message.isSending && (
          <Loader2 className="size-4 animate-spin text-neutral-500" />
        )}

        <div
          className={cn(
            "max-w-[65%] rounded-lg relative overflow-hidden",
            isSender ? "bg-primary-500" : "bg-neutral-200",
            isFirstInGroup && (isSender ? "rounded-tr-none" : "rounded-tl-none")
          )}
        >
          {/* Media Attachments Grid */}
          {mediaAttachments && mediaAttachments.length > 0 && (
            <div
              className={cn(
                "grid gap-1 p-1 max-w-xs",
                getGridClass(mediaAttachments.length)
              )}
            >
              {displayAttachments?.map((attachment, index) => (
                <div
                  key={attachment.id}
                  className={cn(
                    "relative cursor-pointer overflow-hidden rounded group/attachment",
                    getAttachmentClass(mediaAttachments?.length, index)
                  )}
                  onClick={() => openCarousel(index)}
                >
                  {attachment.type === "IMAGE" ? (
                    <img
                      src={attachment.url}
                      alt={attachment.name || "Image"}
                      className="w-full h-full object-cover transition-transform group-hover/attachment:scale-105"
                    />
                  ) : (
                    <div className="relative w-full h-full">
                      <video
                        src={attachment.url}
                        className="w-full h-full object-cover"
                        muted
                      />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <div className="w-12 h-12 bg-black/50 rounded-full flex items-center justify-center">
                          <div className="w-0 h-0 border-l-[8px] border-l-white border-y-[6px] border-y-transparent ml-1" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Show count overlay for 4th item if there are more attachments */}
                  {index === 3 && remainingCount > 0 && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                      <span className="text-white font-semibold text-lg">
                        +{remainingCount}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Text Content */}
          {message.content && (
            <div
              className={cn(
                "px-4 py-2 b3-regular",
                isSender ? "text-white" : "text-neutral-900",
                mediaAttachments && mediaAttachments.length > 0 && "pt-1"
              )}
            >
              {message.content}
            </div>
          )}

          {/* Document Attachments */}
          {documentAttachments && documentAttachments.length > 0 && (
            <div
              className={cn(
                "px-4 space-y-2",
                message.content ||
                  (mediaAttachments && mediaAttachments.length > 0)
                  ? "py-2"
                  : "py-3"
              )}
            >
              {documentAttachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className={cn(
                    "flex items-center gap-3 p-2 rounded cursor-pointer transition-colors group/document"
                  )}
                >
                  {getDocumentIcon(attachment.name || "document")}
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        "font-medium text-sm truncate",
                        isSender ? "text-white" : "text-neutral-900"
                      )}
                    >
                      {attachment.name || "Document"}
                    </p>
                    <p
                      className={cn(
                        "text-xs",
                        isSender ? "text-primary-200" : "text-neutral-500"
                      )}
                    >
                      {attachment.type} • {formatFileSize(attachment.size)}
                    </p>
                  </div>

                  {/* Download Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "h-8 w-8 flex-shrink-0 bg-transparent!",
                      isSender
                        ? "text-neutral-200 hover:text-white"
                        : "text-neutral-500"
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadFile(
                        attachment.url,
                        attachment.name || "document"
                      );
                    }}
                  >
                    <Download className="size-5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {message.isError && (
          <Hint description="Unable to sent message">
            <InfoIcon className="text-red-500 size-4" />
          </Hint>
        )}

        <MessageOptions message={message} />
      </div>

      {mediaAttachments && (
        <MediaCarousel
          attachments={mediaAttachments}
          initialIndex={selectedAttachmentIndex}
          isOpen={carouselOpen}
          onClose={() => setCarouselOpen(false)}
        />
      )}
    </>
  );
};
