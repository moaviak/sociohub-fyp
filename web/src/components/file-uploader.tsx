import React, { useCallback, useState, useEffect } from "react";
import {
  useDropzone,
  FileRejection,
  DropzoneOptions,
  Accept,
} from "react-dropzone";

/**
 * Extended File interface with preview URL
 */
export interface FileWithPreview extends File {
  preview: string;
}

/**
 * Interface for remote image URLs
 */
export interface RemoteImage {
  url: string;
  name?: string;
  id?: string;
  size?: number;
}

/**
 * Props for the FileUploadDropzone component
 */
export interface FileUploaderProps {
  /** Maximum size of each individual file in bytes */
  maxSize?: number;
  /** Maximum total size of all files combined in bytes (optional) */
  maxTotalSize?: number;
  /** Maximum number of files allowed */
  maxFiles?: number;
  /** Whether to allow multiple file selection */
  multiple?: boolean;
  /** MIME types to accept - defaults to images only, unless acceptVideos is true */
  accept?: Accept;
  /** Callback when files are selected or removed */
  onFilesChange?: (files: FileWithPreview[]) => void;
  /** Callback for single file selection (convenience for single file usage) */
  onFileChange?: (file: FileWithPreview | null) => void;
  /** Whether to show file previews */
  showPreviews?: boolean;
  /** Whether to show a remove button for each file */
  showRemoveButton?: boolean;
  /** Optional custom preview renderer */
  renderPreview?: (
    file: FileWithPreview | RemoteImage,
    onRemove: () => void
  ) => React.ReactNode;
  /** Custom validation function */
  validateFile?: (file: File) => string | null;
  /** Custom drag active state class */
  dragActiveClassName?: string;
  /** Custom class for the container */
  className?: string;
  /** Custom placeholder text */
  placeholderText?: {
    main?: string;
    browse?: string;
    sizeLimit?: string;
  };
  /** Initial files */
  initialFiles?: File[];
  /** Whether to show file details (name, size) */
  showFileDetails?: boolean;
  /** Remote image URLs (for edit/update forms) */
  existingImages?: RemoteImage[];
  /** Callback when a remote image is removed */
  onRemoteImageRemove?: (image: RemoteImage, index: number) => void;
  /** Enable multiple file upload mode - overrides multiple prop when true */
  enableMultipleUploads?: boolean;
  /** Whether to accept video files in addition to images */
  acceptVideos?: boolean;
}

/**
 * A flexible file upload component with drag and drop support
 * that can also display existing remote images (for edit forms)
 * Defaults to accepting images only, with optional video support
 */
const FileUploader: React.FC<FileUploaderProps> = ({
  maxSize = 5 * 1024 * 1024, // 5MB default for individual files
  maxTotalSize, // Optional total size limit
  maxFiles = 1,
  multiple = false,
  accept,
  onFilesChange,
  onFileChange,
  showPreviews = true,
  showRemoveButton = true,
  renderPreview,
  validateFile,
  dragActiveClassName = "border-blue-500 bg-blue-50",
  className = "",
  placeholderText,
  initialFiles = [],
  showFileDetails = true,
  existingImages = [],
  onRemoteImageRemove,
  enableMultipleUploads = false,
  acceptVideos = false,
}) => {
  // Determine if multiple uploads should be enabled
  const isMultipleMode = enableMultipleUploads || multiple;
  const effectiveMaxFiles = enableMultipleUploads
    ? maxFiles > 1
      ? maxFiles
      : 10
    : maxFiles;

  // Determine accepted file types - maintain backward compatibility
  const getDefaultAccept = (): Accept => {
    const imageTypes = {
      "image/*": [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".bmp"],
    };

    if (acceptVideos) {
      return {
        ...imageTypes,
        "video/*": [".mp4", ".mov", ".avi", ".mkv", ".webm", ".flv", ".wmv"],
      };
    }

    return imageTypes;
  };

  const effectiveAccept = accept || getDefaultAccept();

  // Generate default placeholder text based on mode and accepted file types
  const getDefaultPlaceholderText = () => {
    const fileTypes = acceptVideos ? "images and videos" : "images";
    const individualSizeText = `Max file size: ${(
      maxSize /
      (1024 * 1024)
    ).toFixed(1)} MB`;
    const totalSizeText = maxTotalSize
      ? ` | Total: ${(maxTotalSize / (1024 * 1024)).toFixed(1)} MB`
      : "";
    const filesText = isMultipleMode ? ` | Max ${effectiveMaxFiles} files` : "";

    return {
      main: isMultipleMode
        ? `Drag your ${fileTypes} or`
        : `Drag your ${fileTypes} or`,
      browse: "browse",
      sizeLimit: `${individualSizeText}${totalSizeText}${filesText}`,
    };
  };

  const defaultPlaceholderText = getDefaultPlaceholderText();
  const finalPlaceholderText = {
    ...defaultPlaceholderText,
    ...placeholderText,
  };

  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [remoteImages, setRemoteImages] = useState<RemoteImage[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Process existing remote images if provided
  useEffect(() => {
    if (existingImages && existingImages.length > 0) {
      setRemoteImages(existingImages);
    }
  }, [existingImages]);

  // Process initial files if provided
  useEffect(() => {
    if (initialFiles.length > 0) {
      const processedFiles = initialFiles.map((file) => {
        const fileWithPreview = file as FileWithPreview;
        fileWithPreview.preview = URL.createObjectURL(file);
        return fileWithPreview;
      });

      setFiles(processedFiles);

      if (onFilesChange) {
        onFilesChange(processedFiles);
      }

      if (onFileChange && !isMultipleMode) {
        onFileChange(processedFiles[0] || null);
      }
    }

    // Clean up previews on unmount
    return () => {
      files.forEach((file) => {
        URL.revokeObjectURL(file.preview);
      });
    };
  }, [files, initialFiles, isMultipleMode, onFileChange, onFilesChange]);

  // Calculate how many files can still be uploaded
  const getRemainingSlots = useCallback(() => {
    return effectiveMaxFiles - (files.length + remoteImages.length);
  }, [files.length, effectiveMaxFiles, remoteImages.length]);

  // Calculate current total size of files
  const getCurrentTotalSize = useCallback(() => {
    return files.reduce((total, file) => total + file.size, 0);
  }, [files]);

  // Custom validation function for file constraints
  const validateFiles = useCallback(
    (filesToValidate: File[]): string | null => {
      // Check individual file sizes
      for (const file of filesToValidate) {
        if (file.size > maxSize) {
          return `File "${file.name}" exceeds maximum size of ${(
            maxSize /
            (1024 * 1024)
          ).toFixed(1)} MB`;
        }
      }

      // Check custom validation if provided
      if (validateFile) {
        for (const file of filesToValidate) {
          const error = validateFile(file);
          if (error) {
            return error;
          }
        }
      }

      // Check total size limit if specified
      if (maxTotalSize && isMultipleMode) {
        const currentSize = getCurrentTotalSize();
        const newFilesSize = filesToValidate.reduce(
          (total, file) => total + file.size,
          0
        );
        const totalSize = currentSize + newFilesSize;

        if (totalSize > maxTotalSize) {
          return `Total file size would exceed limit of ${(
            maxTotalSize /
            (1024 * 1024)
          ).toFixed(1)} MB`;
        }
      }

      // Check file count
      const remainingSlots = getRemainingSlots();
      if (filesToValidate.length > remainingSlots) {
        return `Maximum ${effectiveMaxFiles} file${
          effectiveMaxFiles > 1 ? "s" : ""
        } allowed`;
      }

      return null;
    },
    [
      maxSize,
      maxTotalSize,
      isMultipleMode,
      getCurrentTotalSize,
      getRemainingSlots,
      effectiveMaxFiles,
      validateFile,
    ]
  );

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      // Clear any previous errors
      setErrorMessage(null);

      // Handle dropzone rejections first (file type, etc.)
      if (fileRejections.length > 0) {
        const { code } = fileRejections[0].errors[0];
        if (code === "file-invalid-type") {
          setErrorMessage(
            acceptVideos
              ? "Please upload valid images or videos only"
              : "Please upload valid images only"
          );
        } else {
          setErrorMessage("Error uploading file");
        }
        return;
      }

      // No accepted files to process
      if (acceptedFiles.length === 0) {
        return;
      }

      // Use our custom validation
      const validationError = validateFiles(acceptedFiles);
      if (validationError) {
        setErrorMessage(validationError);
        return;
      }

      // Files are valid, process them
      const newFiles = acceptedFiles.map((file) => {
        const fileWithPreview = file as FileWithPreview;
        fileWithPreview.preview = URL.createObjectURL(file);
        return fileWithPreview;
      });

      // Either replace or append based on multiple mode
      let updatedFiles: FileWithPreview[];

      if (isMultipleMode) {
        updatedFiles = [...files, ...newFiles];
      } else {
        // In single mode, remove remote images when a new file is added
        if (remoteImages.length > 0) {
          setRemoteImages([]);
        }
        // Clean up old previews in single mode
        files.forEach((file) => {
          URL.revokeObjectURL(file.preview);
        });
        updatedFiles = [newFiles[0]]; // Only keep the first file in single mode
      }

      setFiles(updatedFiles);

      // Invoke callbacks
      if (onFilesChange) {
        onFilesChange(updatedFiles);
      }

      if (onFileChange && !isMultipleMode) {
        onFileChange(updatedFiles[0] || null);
      }
    },
    [
      acceptVideos,
      validateFiles,
      isMultipleMode,
      files,
      remoteImages.length,
      onFilesChange,
      onFileChange,
    ]
  );

  const removeFile = useCallback(
    (indexToRemove: number) => {
      // Remove the file at the specified index
      const updatedFiles = files.filter((_, index) => index !== indexToRemove);

      // Revoke the preview URL to prevent memory leaks
      if (files[indexToRemove]) {
        URL.revokeObjectURL(files[indexToRemove].preview);
      }

      setFiles(updatedFiles);
      setErrorMessage(null); // Clear errors when removing files

      // Invoke callbacks
      if (onFilesChange) {
        onFilesChange(updatedFiles);
      }

      if (onFileChange && !isMultipleMode) {
        onFileChange(updatedFiles[0] || null);
      }
    },
    [files, isMultipleMode, onFileChange, onFilesChange]
  );

  const removeRemoteImage = useCallback(
    (indexToRemove: number) => {
      const imageToRemove = remoteImages[indexToRemove];
      const updatedRemoteImages = remoteImages.filter(
        (_, index) => index !== indexToRemove
      );

      setRemoteImages(updatedRemoteImages);
      setErrorMessage(null); // Clear errors when removing images

      // Invoke callback if provided
      if (onRemoteImageRemove && imageToRemove) {
        onRemoteImageRemove(imageToRemove, indexToRemove);
      }
    },
    [remoteImages, onRemoteImageRemove]
  );

  // Configure dropzone options - don't use maxSize here as we handle it in custom validation
  const dropzoneOptions: DropzoneOptions = {
    onDrop,
    maxFiles: getRemainingSlots() > 0 ? getRemainingSlots() : 0,
    multiple: isMultipleMode && getRemainingSlots() > 1,
    accept: effectiveAccept,
    disabled: getRemainingSlots() <= 0,
    // Don't use maxSize here - we handle it in custom validation
    noClick: false,
    noKeyboard: false,
  };

  const { getRootProps, getInputProps, isDragActive } =
    useDropzone(dropzoneOptions);

  // Enhanced preview renderer for local files (supports videos)
  const defaultRenderLocalPreview = (file: FileWithPreview, index: number) => {
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");

    return (
      <div
        key={`file-${file.name}-${index}`}
        className="relative inline-block m-2"
      >
        <div className="relative w-24 h-24 border rounded overflow-hidden bg-gray-100">
          {isImage ? (
            <img
              src={file.preview}
              alt={file.name}
              className="w-full h-full object-cover"
            />
          ) : isVideo ? (
            <div className="relative w-full h-full">
              <video
                src={file.preview}
                className="w-full h-full object-cover"
                muted
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                <svg
                  className="w-6 h-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <svg
                className="w-12 h-12 text-gray-500"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 1v5h5v11H6V4h7zm-2 8H8v1h3v-1zm0 2H8v1h3v-1zm0 2H8v1h3v-1zm5-3h-3v4h3v-4z" />
              </svg>
            </div>
          )}
        </div>

        {showRemoveButton && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              removeFile(index);
            }}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
            type="button"
            aria-label="Remove file"
          >
            ✕
          </button>
        )}

        {showFileDetails && (
          <div className="mt-1 text-center">
            <p
              className="text-xs text-gray-700 truncate max-w-24"
              title={file.name}
            >
              {file.name.length > 15
                ? `${file.name.substring(0, 12)}...`
                : file.name}
            </p>
            <p className="text-xs text-gray-500">
              {(file.size / (1024 * 1024)).toFixed(1)} MB
            </p>
            {isVideo && (
              <p className="text-xs text-blue-600 font-medium">Video</p>
            )}
          </div>
        )}
      </div>
    );
  };

  // Default preview renderer for remote images (enhanced to show media type)
  const defaultRenderRemotePreview = (image: RemoteImage, index: number) => {
    const isVideo = image.name
      ?.toLowerCase()
      .match(/\.(mp4|mov|avi|mkv|webm|flv|wmv)$/);

    return (
      <div
        key={`remote-${image.id || index}`}
        className="relative inline-block m-2"
      >
        <div className="relative w-24 h-24 border rounded overflow-hidden bg-gray-100">
          {isVideo ? (
            <div className="relative w-full h-full">
              <video
                src={image.url}
                className="w-full h-full object-cover"
                muted
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                <svg
                  className="w-6 h-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          ) : (
            <img
              src={image.url}
              alt={image.name || "Existing media"}
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute bottom-0 right-0 bg-blue-500 text-white text-xs px-1">
            Existing
          </div>
        </div>

        {showRemoveButton && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              removeRemoteImage(index);
            }}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
            type="button"
            aria-label="Remove media"
          >
            ✕
          </button>
        )}

        {showFileDetails && (
          <div className="mt-1 text-center">
            <p
              className="text-xs text-gray-700 truncate max-w-24"
              title={image.name || "Existing media"}
            >
              {image.name && image.name.length > 15
                ? `${image.name.substring(0, 12)}...`
                : image.name || "Media"}
            </p>
            {image.size && (
              <p className="text-xs text-gray-500">
                {(image.size / (1024 * 1024)).toFixed(1)} MB
              </p>
            )}
            {isVideo && (
              <p className="text-xs text-blue-600 font-medium">Video</p>
            )}
          </div>
        )}
      </div>
    );
  };

  const totalItemsCount = files.length + remoteImages.length;
  const currentTotalSize = getCurrentTotalSize();

  return (
    <div className={`w-full ${className}`}>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer flex flex-col items-center justify-center transition-colors ${
          isDragActive
            ? dragActiveClassName
            : errorMessage
            ? "border-red-300"
            : totalItemsCount > 0
            ? "border-green-500"
            : "border-neutral-400"
        }`}
        style={{ minHeight: "160px" }}
      >
        <input {...getInputProps()} />

        {totalItemsCount === 0 ? (
          <>
            <div className="mb-4">
              <svg
                className={`w-12 h-12 mx-auto ${
                  isDragActive
                    ? "text-blue-500"
                    : errorMessage
                    ? "text-red-500"
                    : "text-blue-600"
                }`}
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z" />
              </svg>
            </div>

            <p className="text-lg font-medium">
              {finalPlaceholderText.main}{" "}
              <span className="text-blue-600">
                {finalPlaceholderText.browse}
              </span>
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {finalPlaceholderText.sizeLimit}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {acceptVideos
                ? "Supports images and videos"
                : "Supports images only"}
            </p>

            {errorMessage && (
              <p className="mt-2 text-sm text-red-500">{errorMessage}</p>
            )}
          </>
        ) : showPreviews ? (
          <div className="w-full">
            <div
              className={`flex ${
                isMultipleMode ? "flex-wrap justify-center" : "justify-center"
              }`}
            >
              {/* Render remote images first */}
              {remoteImages.map((image, index) =>
                renderPreview
                  ? renderPreview(image, () => removeRemoteImage(index))
                  : defaultRenderRemotePreview(image, index)
              )}

              {/* Then render local files */}
              {files.map((file, index) =>
                renderPreview
                  ? renderPreview(file, () => removeFile(index))
                  : defaultRenderLocalPreview(file, index)
              )}
            </div>
            <div className="text-sm text-gray-500 mt-3">
              <p>
                {isMultipleMode
                  ? `${totalItemsCount} of ${effectiveMaxFiles} ${
                      totalItemsCount === 1 ? "file" : "files"
                    } selected`
                  : "File selected"}
              </p>
              {isMultipleMode && maxTotalSize && (
                <p className="text-xs">
                  Total size: {(currentTotalSize / (1024 * 1024)).toFixed(1)} MB
                  / {(maxTotalSize / (1024 * 1024)).toFixed(1)} MB
                </p>
              )}
              <p className="text-xs">
                Drop new media to{" "}
                {isMultipleMode && getRemainingSlots() > 0
                  ? "add more"
                  : "replace"}
              </p>
            </div>
          </div>
        ) : (
          <div className="w-full text-center">
            <p className="text-green-600 font-medium">
              {isMultipleMode
                ? `${totalItemsCount} files selected`
                : "File selected"}
            </p>
            <div className="text-sm text-gray-500 mt-1">
              {isMultipleMode && maxTotalSize && (
                <p className="text-xs">
                  Total size: {(currentTotalSize / (1024 * 1024)).toFixed(1)} MB
                  / {(maxTotalSize / (1024 * 1024)).toFixed(1)} MB
                </p>
              )}
              <p className="text-xs">
                Drop new media to{" "}
                {isMultipleMode && getRemainingSlots() > 0
                  ? "add more"
                  : "replace"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUploader;
