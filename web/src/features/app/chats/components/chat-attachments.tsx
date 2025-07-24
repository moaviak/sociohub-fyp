import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Input } from "@/components/ui/input";
import {
  File,
  FileVideo,
  Images,
  Paperclip,
  Plus,
  Send,
  X,
  ArrowLeft,
} from "lucide-react";
import { useSendMessageMutation } from "../api";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { IUser, Message, Attachment } from "../types";
import { addMessage, updateMessage } from "../slice";
import { v4 as uuid } from "uuid";
import { getDocumentIcon } from "./document-icon";

interface FileItem {
  file: File;
  url: string;
  id: string;
  name?: string;
  type?: string;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export const ChatAttachments: React.FC<{ currentSender: IUser }> = ({
  currentSender,
}) => {
  const [sendMessage] = useSendMessageMutation();
  const { activeChat } = useAppSelector((state) => state.chats);
  const dispatch = useAppDispatch();

  const [selectedImages, setSelectedImages] = useState<FileItem[]>([]);
  const [selectedVideos, setSelectedVideos] = useState<FileItem[]>([]);
  const [selectedDocuments, setSelectedDocuments] = useState<FileItem[]>([]);
  const [caption, setCaption] = useState<string>("");
  const [showPopover, setShowPopover] = useState<boolean>(false);
  const [popoverMode, setPopoverMode] = useState<"main" | "preview">("main");
  const [previewType, setPreviewType] = useState<
    "images" | "videos" | "documents" | ""
  >("");
  const [sizeError, setSizeError] = useState<string>("");

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);
  const addMoreImageRef = useRef<HTMLInputElement>(null);
  const addMoreVideoRef = useRef<HTMLInputElement>(null);
  const addMoreDocumentRef = useRef<HTMLInputElement>(null);

  const validateFileSize = (file: File): boolean => {
    if (file.size > MAX_FILE_SIZE) {
      setSizeError(
        `File "${
          file.name
        }" is too large. Maximum size allowed is ${formatFileSize(
          MAX_FILE_SIZE
        )}.`
      );
      return false;
    }
    return true;
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSizeError(""); // Clear previous errors

    if (files.length > 0) {
      const validFiles = files.filter(validateFileSize);

      if (validFiles.length > 0) {
        const imageFiles: FileItem[] = validFiles
          .slice(0, 5 - selectedImages.length)
          .map((file) => ({
            file,
            url: URL.createObjectURL(file),
            id: Math.random().toString(36).substr(2, 9),
            name: file.name,
            type: file.type,
          }));
        setSelectedImages((prev) => [...prev, ...imageFiles]);
        setPreviewType("images");
        setPopoverMode("preview");
      }
    }
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSizeError(""); // Clear previous errors

    if (files.length > 0) {
      const validFiles = files.filter(validateFileSize);

      if (validFiles.length > 0) {
        const videoFiles: FileItem[] = validFiles
          .slice(0, 5 - selectedVideos.length)
          .map((file) => ({
            file,
            url: URL.createObjectURL(file),
            id: Math.random().toString(36).substr(2, 9),
            name: file.name,
            type: file.type,
          }));
        setSelectedVideos((prev) => [...prev, ...videoFiles]);
        setPreviewType("videos");
        setPopoverMode("preview");
      }
    }
  };

  const handleDocumentSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSizeError(""); // Clear previous errors

    if (files.length > 0) {
      const validFiles = files.filter(validateFileSize);

      if (validFiles.length > 0) {
        const documentFiles: FileItem[] = validFiles
          .slice(0, 5 - selectedDocuments.length)
          .map((file) => ({
            file,
            url: URL.createObjectURL(file),
            id: Math.random().toString(36).substr(2, 9),
            name: file.name,
            type: file.type,
          }));
        setSelectedDocuments((prev) => [...prev, ...documentFiles]);
        setPreviewType("documents");
        setPopoverMode("preview");
      }
    }
  };

  const removeImage = (id: string) => {
    setSelectedImages((prev) => {
      const updated = prev.filter((img) => img.id !== id);
      if (updated.length === 0) {
        setPopoverMode("main");
        setCaption("");
        setPreviewType("");
      }
      return updated;
    });
  };

  const removeVideo = (id: string) => {
    setSelectedVideos((prev) => {
      const updated = prev.filter((vid) => vid.id !== id);
      if (updated.length === 0) {
        setPopoverMode("main");
        setCaption("");
        setPreviewType("");
      }
      return updated;
    });
  };

  const removeDocument = (id: string) => {
    setSelectedDocuments((prev) => {
      const updated = prev.filter((doc) => doc.id !== id);
      if (updated.length === 0) {
        setPopoverMode("main");
        setCaption("");
        setPreviewType("");
      }
      return updated;
    });
  };

  const handlePhotosClick = () => {
    setSelectedImages([]);
    setSelectedVideos([]);
    setSelectedDocuments([]);
    setCaption("");
    setSizeError("");
    setPreviewType("images");

    setTimeout(() => {
      imageInputRef.current?.click();
    }, 100);
  };

  const handleVideosClick = () => {
    setSelectedImages([]);
    setSelectedVideos([]);
    setSelectedDocuments([]);
    setCaption("");
    setSizeError("");
    setPreviewType("videos");

    setTimeout(() => {
      videoInputRef.current?.click();
    }, 100);
  };

  const handleDocumentsClick = () => {
    setSelectedImages([]);
    setSelectedVideos([]);
    setSelectedDocuments([]);
    setCaption("");
    setSizeError("");
    setPreviewType("documents");

    setTimeout(() => {
      documentInputRef.current?.click();
    }, 100);
  };

  const handleAddMore = () => {
    setSizeError(""); // Clear previous errors
    if (previewType === "images" && selectedImages.length < 5) {
      addMoreImageRef.current?.click();
    } else if (previewType === "videos" && selectedVideos.length < 5) {
      addMoreVideoRef.current?.click();
    } else if (previewType === "documents" && selectedDocuments.length < 5) {
      addMoreDocumentRef.current?.click();
    }
  };

  const handleAddMoreImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSizeError(""); // Clear previous errors

    if (files.length > 0) {
      const validFiles = files.filter(validateFileSize);

      if (validFiles.length > 0) {
        const remainingSlots = 5 - selectedImages.length;
        const imageFiles: FileItem[] = validFiles
          .slice(0, remainingSlots)
          .map((file) => ({
            file,
            url: URL.createObjectURL(file),
            id: Math.random().toString(36).substring(2, 9),
            name: file.name,
            type: file.type,
          }));
        setSelectedImages((prev) => [...prev, ...imageFiles]);
      }
    }
  };

  const handleAddMoreVideos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSizeError(""); // Clear previous errors

    if (files.length > 0) {
      const validFiles = files.filter(validateFileSize);

      if (validFiles.length > 0) {
        const remainingSlots = 5 - selectedVideos.length;
        const videoFiles: FileItem[] = validFiles
          .slice(0, remainingSlots)
          .map((file) => ({
            file,
            url: URL.createObjectURL(file),
            id: Math.random().toString(36).substring(2, 9),
            name: file.name,
            type: file.type,
          }));
        setSelectedVideos((prev) => [...prev, ...videoFiles]);
      }
    }
  };

  const handleAddMoreDocuments = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSizeError(""); // Clear previous errors

    if (files.length > 0) {
      const validFiles = files.filter(validateFileSize);

      if (validFiles.length > 0) {
        const remainingSlots = 5 - selectedDocuments.length;
        const documentFiles: FileItem[] = validFiles
          .slice(0, remainingSlots)
          .map((file) => ({
            file,
            url: URL.createObjectURL(file),
            id: Math.random().toString(36).substring(2, 9),
            name: file.name,
            type: file.type,
          }));
        setSelectedDocuments((prev) => [...prev, ...documentFiles]);
      }
    }
  };

  const handleSend = async () => {
    if (!activeChat) return;

    let filesToSend: File[] = [];
    if (previewType === "images")
      filesToSend = selectedImages.map((item) => item.file);
    else if (previewType === "videos")
      filesToSend = selectedVideos.map((item) => item.file);
    else if (previewType === "documents")
      filesToSend = selectedDocuments.map((item) => item.file);

    const messageId = uuid();
    const tempAttachments: Attachment[] = filesToSend.map((file) => ({
      id: uuid(),
      url: URL.createObjectURL(file),
      type: file.type.startsWith("image")
        ? "IMAGE"
        : file.type.startsWith("video")
        ? "VIDEO"
        : "DOCUMENT",
      name: file.name,
      size: file.size,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    const newMessage: Message = {
      id: messageId,
      attachments: tempAttachments,
      chatId: activeChat.id,
      content: caption,
      sender: currentSender,
      createdAt: new Date().toISOString(),
      readBy: [],
      senderId: currentSender.id,
      updatedAt: new Date().toISOString(),
      isSending: true,
      isError: false,
    };

    dispatch(
      addMessage({ message: newMessage, currentUserId: currentSender.id })
    );

    // Reset state after sending
    setSelectedImages([]);
    setSelectedVideos([]);
    setSelectedDocuments([]);
    setCaption("");
    setSizeError("");
    setPopoverMode("main");
    setPreviewType("");
    setShowPopover(false);

    try {
      await sendMessage({
        chatId: activeChat.id,
        content: caption,
        files: filesToSend,
      }).unwrap();
    } catch (error) {
      console.error(error);
      dispatch(
        updateMessage({
          id: messageId,
          chatId: activeChat.id,
          updates: { isError: true },
        })
      );
    } finally {
      dispatch(
        updateMessage({
          id: messageId,
          chatId: activeChat.id,
          updates: { isSending: false },
        })
      );
    }
  };

  const handleBackToMain = () => {
    setPopoverMode("main");
    setSizeError(""); // Clear error when going back
  };

  const getCurrentFiles = () => {
    if (previewType === "images") return selectedImages;
    if (previewType === "videos") return selectedVideos;
    if (previewType === "documents") return selectedDocuments;
    return [];
  };

  const currentFiles = getCurrentFiles();
  const canAddMore = currentFiles.length < 5;

  return (
    <>
      {/* Hidden file inputs */}
      <input
        type="file"
        ref={imageInputRef}
        onChange={handleImageSelect}
        accept="image/*"
        multiple
        style={{ display: "none" }}
      />
      <input
        type="file"
        ref={videoInputRef}
        onChange={handleVideoSelect}
        accept=".mp4,.avi,.mov,.wmv,.flv,.webm,.mkv,.m4v,.3gp"
        multiple
        style={{ display: "none" }}
      />
      <input
        type="file"
        ref={documentInputRef}
        onChange={handleDocumentSelect}
        multiple
        style={{ display: "none" }}
      />
      <input
        type="file"
        ref={addMoreImageRef}
        onChange={handleAddMoreImages}
        accept="image/*"
        multiple
        style={{ display: "none" }}
      />
      <input
        type="file"
        ref={addMoreVideoRef}
        onChange={handleAddMoreVideos}
        accept=".mp4,.avi,.mov,.wmv,.flv,.webm,.mkv,.m4v,.3gp"
        multiple
        style={{ display: "none" }}
      />
      <input
        type="file"
        ref={addMoreDocumentRef}
        onChange={handleAddMoreDocuments}
        multiple
        style={{ display: "none" }}
      />

      {/* Single popover with dynamic content */}
      <Popover open={showPopover} onOpenChange={setShowPopover}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 text-primary-600 hover:bg-neutral-100 self-end"
          >
            <Paperclip className="h-5 w-5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className={popoverMode === "preview" ? "w-96" : "w-auto"}
        >
          {popoverMode === "main" ? (
            /* Main attachment selection */
            <div className="space-y-3">
              {sizeError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm">
                  {sizeError}
                </div>
              )}
              <div className="flex gap-x-4 px-4 py-2 justify-around">
                <button
                  onClick={handlePhotosClick}
                  className="flex flex-col items-center b3-regular gap-1 cursor-pointer hover:opacity-80 transition-opacity"
                >
                  <Images className="size-6 text-primary-500" />
                  Photos
                </button>
                <button
                  onClick={handleVideosClick}
                  className="flex flex-col items-center b3-regular gap-1 cursor-pointer hover:opacity-80 transition-opacity"
                >
                  <FileVideo className="size-6 text-secondary-600" />
                  Videos
                </button>
                <button
                  onClick={handleDocumentsClick}
                  className="flex flex-col items-center b3-regular gap-1 cursor-pointer hover:opacity-80 transition-opacity"
                >
                  <File className="size-6 text-accent-500" />
                  Documents
                </button>
              </div>
              <div className="text-xs text-gray-500 text-center px-4">
                Maximum file size: {formatFileSize(MAX_FILE_SIZE)}
              </div>
            </div>
          ) : (
            /* Preview content */
            currentFiles.length > 0 && (
              <div className="space-y-4">
                {/* Back button */}
                <div className="flex items-center gap-2 pb-2 border-b">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBackToMain}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium capitalize">
                    {previewType}
                  </span>
                </div>

                {/* Error message */}
                {sizeError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm">
                    {sizeError}
                  </div>
                )}

                {/* Preview content based on type */}
                {previewType === "documents" ? (
                  /* Document preview - horizontal boxes */
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-3">
                      {currentFiles.map((item) => (
                        <div
                          key={item.id}
                          className="relative bg-gray-50 border rounded-lg p-3 w-20 hover:bg-gray-100 transition-colors"
                        >
                          <button
                            onClick={() => removeDocument(item.id)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-all"
                          >
                            <X className="h-3 w-3" />
                          </button>
                          <div className="flex flex-col items-center gap-2">
                            <div className="flex items-center justify-center">
                              {getDocumentIcon(item.name || "")}
                            </div>
                            <p className="text-xs text-gray-600 text-center line-clamp-2 break-all">
                              {item.name || "Document"}
                            </p>
                            <p className="text-xs text-gray-400 text-center">
                              {formatFileSize(item.file.size)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="text-center text-sm text-gray-500">
                      {currentFiles.length} / 5 documents
                    </div>
                  </div>
                ) : (
                  /* Carousel for images and videos */
                  <div className="relative">
                    <Carousel className="w-full">
                      <CarouselContent>
                        {currentFiles.map((item) => (
                          <CarouselItem key={item.id} className="relative">
                            <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden h-48">
                              {previewType === "images" ? (
                                <img
                                  src={item.url}
                                  alt="Preview"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <video
                                  src={item.url}
                                  className="w-full h-full object-cover"
                                  controls
                                />
                              )}
                              <button
                                onClick={() =>
                                  previewType === "images"
                                    ? removeImage(item.id)
                                    : removeVideo(item.id)
                                }
                                className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-70 transition-all"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                            <div className="text-center text-xs text-gray-500 mt-2">
                              {item.name} • {formatFileSize(item.file.size)}
                            </div>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      {currentFiles.length > 1 && (
                        <>
                          <CarouselPrevious className="left-2 opacity-50 hover:opacity-100" />
                          <CarouselNext className="right-2 opacity-50 hover:opacity-100" />
                        </>
                      )}
                    </Carousel>
                    <div className="text-center text-sm text-gray-500 mt-2">
                      {currentFiles.length} / 5 {previewType}
                    </div>
                  </div>
                )}

                {/* Caption input */}
                <Input
                  placeholder="Add a caption (optional)"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="w-full"
                />

                {/* Action buttons */}
                <div className="flex justify-between items-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddMore}
                    disabled={!canAddMore}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>

                  <Button
                    onClick={handleSend}
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )
          )}
        </PopoverContent>
      </Popover>
    </>
  );
};
