import React, { useState, useRef } from "react";
import { Camera, X, Upload } from "lucide-react";

interface PhotoUploadProps {
  onFileSelect?: (file: File) => void;
  onFileRemove?: () => void;
  accept?: string;
  maxSizeMB?: number;
  className?: string;
  disabled?: boolean;
  uploadText?: string;
  dragText?: string;
  initialImage?: string;
  onInitialImageRemove?: () => void;
}

export const PhotoUpload: React.FC<PhotoUploadProps> = ({
  onFileSelect,
  onFileRemove,
  accept = "image/*",
  maxSizeMB = 5,
  className = "",
  disabled = false,
  uploadText = "Upload Photo",
  dragText = "Drop your photo here",
  initialImage,
  onInitialImageRemove,
}) => {
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [hasInitialImage, setHasInitialImage] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize with existing image
  React.useEffect(() => {
    if (initialImage) {
      setHasInitialImage(true);
    }
  }, [initialImage]);

  const handleFiles = (files: FileList): void => {
    const file = files[0]; // Only handle single file

    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert(`${file.name} is not a valid image file`);
      return;
    }

    // Validate file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      alert(`${file.name} is too large. Maximum size is ${maxSizeMB}MB`);
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      if (e.target?.result) {
        setPreview(e.target.result as string);
        setHasInitialImage(false); // Clear initial image when new file is selected
      }
    };
    reader.readAsDataURL(file);

    onFileSelect?.(file);
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    e.preventDefault();
    if (disabled) return;

    const files = e.target.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
  };

  const handleClick = (): void => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const removePhoto = (): void => {
    if (preview) {
      setPreview(null);
      onFileRemove?.();
    } else if (hasInitialImage) {
      setHasInitialImage(false);
      onInitialImageRemove?.();
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const currentImage = preview || (hasInitialImage ? initialImage : null);
  const hasImage = !!currentImage;

  return (
    <div className={`w-full ${className}`}>
      {/* Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-full w-24 h-24 mx-auto
          flex flex-col items-center justify-center cursor-pointer
          transition-all duration-200 ease-in-out overflow-hidden
          ${
            dragActive
              ? "border-blue-400 bg-blue-50"
              : "border-gray-300 bg-gray-50 hover:bg-gray-100"
          }
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          disabled={disabled}
          className="hidden"
        />

        {hasImage ? (
          // Display current image
          <>
            <img
              src={currentImage}
              alt="Selected photo"
              className="w-full h-full object-cover rounded-full"
            />

            {/* Remove button overlay */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removePhoto();
              }}
              className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 
                       text-white rounded-full p-1 transition-colors duration-200
                       shadow-lg z-10"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Change photo indicator */}
            <div
              className="absolute inset-0 bg-black opacity-0 hover:bg-opacity-30 
                          rounded-full transition-all duration-200 flex items-center justify-center"
            >
              <Camera className="w-6 h-6 text-white opacity-0 hover:opacity-100 transition-opacity duration-200" />
            </div>
          </>
        ) : (
          // Display upload placeholder
          <>
            <div className="flex flex-col items-center justify-center text-center">
              <div className="bg-gray-600 rounded-lg p-3 mb-2">
                <Camera className="w-6 h-6 text-white" />
              </div>
            </div>

            {dragActive && (
              <div className="absolute inset-0 bg-blue-100 bg-opacity-50 rounded-full flex items-center justify-center">
                <Upload className="w-8 h-8 text-blue-500" />
              </div>
            )}
          </>
        )}
      </div>

      {/* Upload Text - Now clickable */}
      <div className="text-center mt-3">
        <button
          type="button"
          onClick={handleClick}
          disabled={disabled}
          className={`text-primary-500 b3-medium hover:text-primary-600 transition-colors duration-200 
                     ${
                       disabled
                         ? "cursor-not-allowed opacity-50"
                         : "cursor-pointer"
                     }`}
        >
          {dragActive ? dragText : hasImage ? "Change Photo" : uploadText}
        </button>
      </div>
    </div>
  );
};
