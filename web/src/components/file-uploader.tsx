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
    file: FileWithPreview,
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
}

/**
 * A flexible file upload component with drag and drop support
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
}) => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

        // Either replace or append based on multiple mode
        const updatedFiles = multiple
          ? [...files, ...newFiles].slice(0, maxFiles)
          : newFiles.slice(0, 1); // Only keep the first file in single mode

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
      files,
      maxFiles,
      maxSize,
      multiple,
      onFileChange,
      onFilesChange,
      validateFile,
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

  const dropzoneOptions: DropzoneOptions = {
    onDrop,
    maxSize,
    maxFiles,
    multiple,
    accept,
  };

  const { getRootProps, getInputProps, isDragActive } =
    useDropzone(dropzoneOptions);

  // Default preview renderer
  const defaultRenderPreview = (file: FileWithPreview, index: number) => {
    const isImage = file.type.startsWith("image/");

    return (
      <div key={`${file.name}-${index}`} className="relative inline-block m-2">
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

  return (
    <div className={`w-full ${className}`}>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer flex flex-col items-center justify-center ${
          isDragActive
            ? dragActiveClassName
            : errorMessage
            ? "border-red-300"
            : files.length > 0
            ? "border-green-500"
            : "border-neutral-400"
        }`}
        style={{ minHeight: "160px" }}
      >
        <input {...getInputProps()} />

        {files.length === 0 ? (
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
              {files.map((file, index) =>
                renderPreview
                  ? renderPreview(file, () => removeFile(index))
                  : defaultRenderPreview(file, index)
              )}
            </div>
            <p className="text-sm text-gray-500 mt-3">
              {multiple
                ? `${files.length} of ${maxFiles} files selected`
                : "File selected"}{" "}
              - Drop a new file to {multiple ? "add more" : "replace"}
            </p>
          </div>
        ) : (
          <div className="w-full text-center">
            <p className="text-green-600 font-medium">
              {multiple ? `${files.length} files selected` : "File selected"}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Drop a new file to {multiple ? "add more" : "replace"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUploader;
