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
  /** Maximum size of each file in bytes */
  maxSize?: number;
  /** Maximum number of files allowed */
  maxFiles?: number;
  /** Whether to allow multiple file selection */
  multiple?: boolean;
  /** MIME types to accept */
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
}

/**
 * A flexible file upload component with drag and drop support
 * that can also display existing remote images (for edit forms)
 */
const FileUploader: React.FC<FileUploaderProps> = ({
  maxSize = 5 * 1024 * 1024, // 5MB default
  maxFiles = 1,
  multiple = false,
  accept = { "image/*": [] },
  onFilesChange,
  onFileChange,
  showPreviews = true,
  showRemoveButton = true,
  renderPreview,
  validateFile,
  dragActiveClassName = "border-blue-500 bg-blue-50",
  className = "",
  placeholderText = {
    main: multiple ? "Drag your files or" : "Drag your file or",
    browse: "browse",
    sizeLimit: `Max ${multiple ? maxFiles + " files of " : "file size:"} ${
      maxSize / (1024 * 1024)
    } MB`,
  },
  initialFiles = [],
  showFileDetails = true,
  existingImages = [],
  onRemoteImageRemove,
}) => {
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

      if (onFileChange && !multiple) {
        onFileChange(processedFiles[0] || null);
      }
    }

    // Clean up previews on unmount
    return () => {
      files.forEach((file) => {
        URL.revokeObjectURL(file.preview);
      });
    };
  }, [files, initialFiles, multiple, onFileChange, onFilesChange]);

  // Calculate how many files can still be uploaded
  const getRemainingSlots = useCallback(() => {
    return maxFiles - (files.length + remoteImages.length);
  }, [files.length, maxFiles, remoteImages.length]);

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      // Clear any previous errors
      setErrorMessage(null);

      // Handle rejections
      if (fileRejections.length > 0) {
        const { code } = fileRejections[0].errors[0];
        if (code === "file-too-large") {
          setErrorMessage(
            `File exceeds maximum size of ${maxSize / (1024 * 1024)} MB`
          );
        } else if (code === "file-invalid-type") {
          setErrorMessage("Please upload a valid file type");
        } else if (code === "too-many-files") {
          setErrorMessage(
            `Maximum ${maxFiles} file${maxFiles > 1 ? "s" : ""} allowed`
          );
        } else {
          setErrorMessage("Error uploading file");
        }
        return;
      }

      // Calculate remaining slots, considering both files and remote images
      const remainingSlots = getRemainingSlots();

      if (remainingSlots <= 0) {
        setErrorMessage(
          `Maximum ${maxFiles} file${maxFiles > 1 ? "s" : ""} allowed`
        );
        return;
      }

      // Custom validation
      if (validateFile && acceptedFiles.length > 0) {
        for (const file of acceptedFiles) {
          const error = validateFile(file);
          if (error) {
            setErrorMessage(error);
            return;
          }
        }
      }

      // Handle accepted files
      if (acceptedFiles.length > 0) {
        // Create previews
        const newFiles = acceptedFiles.map((file) => {
          const fileWithPreview = file as FileWithPreview;
          fileWithPreview.preview = URL.createObjectURL(file);
          return fileWithPreview;
        });

        // Calculate how many files we can add based on max and existing remote images
        const canAdd = Math.min(remainingSlots, newFiles.length);

        // Either replace or append based on multiple mode
        let updatedFiles: FileWithPreview[];

        if (multiple) {
          updatedFiles = [...files, ...newFiles.slice(0, canAdd)];
        } else {
          // In single mode, remove remote images when a new file is added
          if (remoteImages.length > 0) {
            setRemoteImages([]);
          }
          updatedFiles = newFiles.slice(0, 1); // Only keep the first file in single mode
        }

        setFiles(updatedFiles);

        // Invoke callbacks
        if (onFilesChange) {
          onFilesChange(updatedFiles);
        }

        if (onFileChange && !multiple) {
          onFileChange(updatedFiles[0] || null);
        }
      }
    },
    [
      getRemainingSlots,
      validateFile,
      maxSize,
      maxFiles,
      multiple,
      onFilesChange,
      onFileChange,
      files,
      remoteImages.length,
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

      // Invoke callbacks
      if (onFilesChange) {
        onFilesChange(updatedFiles);
      }

      if (onFileChange && !multiple) {
        onFileChange(updatedFiles[0] || null);
      }
    },
    [files, multiple, onFileChange, onFilesChange]
  );

  const removeRemoteImage = useCallback(
    (indexToRemove: number) => {
      const imageToRemove = remoteImages[indexToRemove];
      const updatedRemoteImages = remoteImages.filter(
        (_, index) => index !== indexToRemove
      );

      setRemoteImages(updatedRemoteImages);

      // Invoke callback if provided
      if (onRemoteImageRemove && imageToRemove) {
        onRemoteImageRemove(imageToRemove, indexToRemove);
      }
    },
    [remoteImages, onRemoteImageRemove]
  );

  const dropzoneOptions: DropzoneOptions = {
    onDrop,
    maxSize,
    maxFiles: getRemainingSlots() > 0 ? getRemainingSlots() : 1, // Adjust max files based on existing images
    multiple: multiple && getRemainingSlots() > 1,
    accept,
    disabled: getRemainingSlots() <= 0 && !multiple, // Disable dropzone if no slots available in single mode
  };

  const { getRootProps, getInputProps, isDragActive } =
    useDropzone(dropzoneOptions);

  // Default preview renderer for local files
  const defaultRenderLocalPreview = (file: FileWithPreview, index: number) => {
    const isImage = file.type.startsWith("image/");

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
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
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
              {(file.size / 1024).toFixed(1)} KB
            </p>
          </div>
        )}
      </div>
    );
  };

  // Default preview renderer for remote images
  const defaultRenderRemotePreview = (image: RemoteImage, index: number) => {
    return (
      <div
        key={`remote-${image.id || index}`}
        className="relative inline-block m-2"
      >
        <div className="relative w-24 h-24 border rounded overflow-hidden bg-gray-100">
          <img
            src={image.url}
            alt={image.name || "Existing image"}
            className="w-full h-full object-cover"
          />
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
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
            type="button"
            aria-label="Remove image"
          >
            ✕
          </button>
        )}

        {showFileDetails && (
          <div className="mt-1 text-center">
            <p
              className="text-xs text-gray-700 truncate max-w-24"
              title={image.name || "Existing image"}
            >
              {image.name && image.name.length > 15
                ? `${image.name.substring(0, 12)}...`
                : image.name || "Image"}
            </p>
            {image.size && (
              <p className="text-xs text-gray-500">
                {(image.size / 1024).toFixed(1)} KB
              </p>
            )}
          </div>
        )}
      </div>
    );
  };

  const totalItemsCount = files.length + remoteImages.length;

  return (
    <div className={`w-full ${className}`}>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer flex flex-col items-center justify-center ${
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
              {placeholderText.main}{" "}
              <span className="text-blue-600">{placeholderText.browse}</span>
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {placeholderText.sizeLimit}
            </p>

            {errorMessage && (
              <p className="mt-2 text-sm text-red-500">{errorMessage}</p>
            )}
          </>
        ) : showPreviews ? (
          <div className="w-full">
            <div
              className={`flex ${
                multiple ? "flex-wrap justify-center" : "justify-center"
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
            <p className="text-sm text-gray-500 mt-3">
              {multiple
                ? `${totalItemsCount} of ${maxFiles} ${
                    totalItemsCount === 1 ? "file" : "files"
                  } selected`
                : "File selected"}{" "}
              - Drop a new file to{" "}
              {multiple && getRemainingSlots() > 0 ? "add more" : "replace"}
            </p>
          </div>
        ) : (
          <div className="w-full text-center">
            <p className="text-green-600 font-medium">
              {multiple ? `${totalItemsCount} files selected` : "File selected"}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Drop a new file to{" "}
              {multiple && getRemainingSlots() > 0 ? "add more" : "replace"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUploader;
