import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import fs from "fs";
import { extractPublicId } from "./helpers";
import path from "path";
import { PDFDocument } from "pdf-lib";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Compresses a PDF file before uploading to Cloudinary
 * @param pdfPath Path to the original PDF file
 * @returns Path to the compressed PDF or original if compression fails
 */
async function compressPDF(pdfPath: string): Promise<string> {
  try {
    // Read the PDF file
    const pdfBytes = fs.readFileSync(pdfPath);

    // Load the PDF document
    const pdfDoc = await PDFDocument.load(pdfBytes, {
      updateMetadata: false, // Don't update metadata (saves some space)
      ignoreEncryption: true, // Ignore encryption if present
    });

    // Compress the PDF with maximum compression options
    const compressedBytes = await pdfDoc.save({
      addDefaultPage: false,
      useObjectStreams: true,
      // These options provide maximum compression
      objectsPerTick: 100, // Process more objects per tick for better compression
    });

    // Write the compressed PDF to a new file
    const compressedPath = path.join(
      path.dirname(pdfPath),
      `compressed-${path.basename(pdfPath)}`
    );
    fs.writeFileSync(compressedPath, compressedBytes);

    // Compare sizes and use the smaller one
    const originalSize = fs.statSync(pdfPath).size;
    const compressedSize = fs.statSync(compressedPath).size;

    console.log(
      `Original PDF size: ${(originalSize / 1024).toFixed(
        2
      )}KB, Compressed size: ${(compressedSize / 1024).toFixed(2)}KB`
    );

    if (compressedSize < originalSize) {
      // Delete the original if compression was successful
      fs.unlinkSync(pdfPath);
      return compressedPath;
    } else {
      // Delete the compressed version if it's not smaller
      fs.unlinkSync(compressedPath);
      return pdfPath;
    }
  } catch (error) {
    console.error("Error compressing PDF:", error);
    // Return original path if compression fails
    return pdfPath;
  }
}

/**
 * Uploads a file to Cloudinary with size optimization
 * @param localFilePath Path to the file on local filesystem
 * @param folder Cloudinary folder to upload to
 * @param type Resource type (auto, raw, image, video)
 * @returns Cloudinary upload response or null if upload failed
 */
const uploadOnCloudinary = async (
  localFilePath: string,
  folder: string,
  type: "auto" | "raw" | "image" | "video" = "auto"
) => {
  if (!localFilePath) return null;

  let fileToUpload = localFilePath;

  try {
    // Compress PDF file if applicable
    if (localFilePath.toLowerCase().endsWith(".pdf") && type === "raw") {
      fileToUpload = await compressPDF(localFilePath);
    }

    // Check file size before uploading
    const fileSizeInMB = fs.statSync(fileToUpload).size / (1024 * 1024);
    if (fileSizeInMB > 9.5) {
      // Set a threshold just below your 10MB limit
      console.warn(
        `File is too large (${fileSizeInMB.toFixed(
          2
        )}MB) and may exceed Cloudinary limits.`
      );
    }

    // Upload with optimization options
    const response = await cloudinary.uploader.upload(fileToUpload, {
      resource_type: type,
      folder,
      use_filename: true,
      unique_filename: false,
      overwrite: true,
      // Add these options to help with size
      quality: "auto", // Let Cloudinary optimize quality
      fetch_format: "auto", // Optimize format
      // Only include image optimization if type is 'image'
      ...(type === "image" && {
        transformation: [
          { width: "auto", crop: "scale", quality: "auto:good" },
        ],
      }),
    });

    // Clean up temporary files
    if (fileToUpload !== localFilePath && fs.existsSync(fileToUpload)) {
      fs.unlinkSync(fileToUpload);
    }

    // Remove the original local file after successful upload
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    return response;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);

    // Clean up temporary files
    if (localFilePath !== fileToUpload && fs.existsSync(fileToUpload)) {
      fs.unlinkSync(fileToUpload);
    }

    // Clean up the locally saved temporary file as the upload operation failed
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    return null;
  }
};

/**
 * Gets a downloadable URL for files uploaded to Cloudinary
 * For regular media (images/videos), returns the secure_url directly
 * For raw files and PDFs, creates a downloadable link
 *
 * @param cloudinaryResponse The response from Cloudinary upload
 * @param customFilename Optional custom filename for download (defaults to original filename)
 * @returns Downloadable URL string
 */
const getDownloadableCloudinaryUrl = (
  cloudinaryResponse: any,
  customFilename?: string
): string => {
  if (!cloudinaryResponse || !cloudinaryResponse.secure_url) {
    return "";
  }

  // Extract file info
  const isRawFile = cloudinaryResponse.resource_type === "raw";
  const originalUrl = cloudinaryResponse.secure_url;

  // For images and videos, return the URL as is
  if (!isRawFile) {
    return originalUrl;
  }

  // For raw files (including PDFs), create a download link
  // Get the original filename or use custom filename if provided
  const originalFilename =
    cloudinaryResponse.original_filename ||
    path.basename(cloudinaryResponse.public_id);

  const filename = customFilename || originalFilename;

  // Create a download URL using Cloudinary's API
  return cloudinary.url(cloudinaryResponse.public_id, {
    resource_type: "raw",
    type: "upload",
    flags: `attachment:${filename}`,
  });
};

/**
 * Alternative function if you only have the URL and not the full Cloudinary response
 * Less reliable but can be used in some cases
 */
const getDownloadableUrlFromString = (
  fileUrl: string,
  filename: string = "download"
): string => {
  if (!fileUrl || typeof fileUrl !== "string") return "";

  // Check if it's a raw file URL
  const isRawFile = fileUrl.includes("/raw/upload/");

  if (!isRawFile) {
    return fileUrl; // Return as is for regular media
  }

  // Add download parameter for raw files
  return `${fileUrl}?dl=${filename}`;
};

/**
 * Extracts the public ID and resource type from a Cloudinary URL
 *
 * @param fileUrl Cloudinary URL (can be regular URL or download URL)
 * @returns Object containing publicId and resourceType, or null if extraction failed
 */
const extractCloudinaryInfo = (
  fileUrl: string
): {
  publicId: string;
  resourceType: string;
} | null => {
  try {
    // Handle cases where URL includes query parameters
    const urlWithoutParams = fileUrl.split("?")[0];

    // Parse the URL
    const parsedUrl = new URL(urlWithoutParams);
    const pathSegments = parsedUrl.pathname
      .split("/")
      .filter((segment) => segment.length > 0);

    // Find resource type (image, video, raw)
    let resourceType = "image"; // Default
    if (pathSegments.includes("raw")) {
      resourceType = "raw";
    } else if (pathSegments.includes("video")) {
      resourceType = "video";
    }

    // Find the upload segment index
    const uploadIndex = pathSegments.findIndex(
      (segment) => segment === "upload"
    );
    if (uploadIndex === -1) {
      console.error("Could not find upload segment in URL:", fileUrl);
      return null;
    }

    // Extract public ID: everything after 'upload' segment
    let publicIdSegments = pathSegments.slice(uploadIndex + 1);

    // IMPORTANT: Check for transformation parameters and remove them
    // fl_attachment is a transformation parameter, not part of the public ID
    if (
      publicIdSegments.length > 0 &&
      publicIdSegments[0].startsWith("fl_attachment:")
    ) {
      publicIdSegments = publicIdSegments.slice(1);
    }

    // Handle version prefix (v1234567890)
    if (publicIdSegments.length > 0 && publicIdSegments[0].match(/^v\d+$/)) {
      publicIdSegments = publicIdSegments.slice(1);
    }

    // Join segments and decode URI components to handle spaces and special characters
    const publicId = decodeURIComponent(publicIdSegments.join("/"));

    // If the public ID is empty, it's not a valid Cloudinary URL
    if (!publicId) {
      console.error("Could not extract public ID from URL:", fileUrl);
      return null;
    }

    return { publicId, resourceType };
  } catch (error) {
    console.error("Error extracting Cloudinary info from URL:", error);
    return null;
  }
};

/**
 * Deletes a file from Cloudinary storage based on its URL
 *
 * @param fileUrl Cloudinary URL of the file to delete (can be regular URL or download URL)
 * @returns Promise that resolves to true if deletion was successful, false otherwise
 */
const deleteFromCloudinary = async (fileUrl: string): Promise<boolean> => {
  try {
    // Extract public ID and resource type from URL
    const cloudinaryInfo = extractCloudinaryInfo(fileUrl);

    if (!cloudinaryInfo) {
      console.error("Could not extract necessary info from URL:", fileUrl);
      return false;
    }

    const { publicId, resourceType } = cloudinaryInfo;

    // Delete the resource from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });

    // Check if deletion was successful
    if (result && result.result === "ok") {
      return true;
    } else {
      console.warn(`Deletion returned unexpected result:`, result);

      // If file deletion failed, let's try some fallback approaches
      if (result.result === "not found") {
        // Approach 1: Try again with the public ID exactly as it appears in the URL (without decoding)
        try {
          // Get the raw public ID from the URL without decoding
          const rawPublicId = extractRawPublicIdFromUrl(fileUrl);
          if (rawPublicId) {
            console.log(`Trying deletion with raw public ID: ${rawPublicId}`);
            const rawResult = await cloudinary.uploader.destroy(rawPublicId, {
              resource_type: resourceType,
            });

            if (rawResult && rawResult.result === "ok") {
              console.log(
                `Successfully deleted file using raw public ID: ${rawPublicId}`
              );
              return true;
            }
          }
        } catch (rawErr) {
          console.error("Error with raw public ID deletion attempt:", rawErr);
        }

        // Approach 2: Try to list files with similar name to find the correct one
        try {
          const filenamePart = publicId.includes("/")
            ? publicId.substring(publicId.lastIndexOf("/") + 1)
            : publicId;

          // Get folder from the public ID (if any)
          const folderPath = publicId.includes("/")
            ? publicId.substring(0, publicId.lastIndexOf("/"))
            : "";

          // List resources in the folder if folder exists
          if (folderPath) {
            try {
              const resources = await cloudinary.api.resources({
                type: "upload",
                resource_type: resourceType,
                prefix: folderPath,
                max_results: 100,
              });

              // Try to find a matching resource
              const matchingResource = resources.resources?.find(
                (r: { public_id: string }) =>
                  r.public_id.includes(filenamePart) ||
                  r.public_id.endsWith(filenamePart)
              );

              if (matchingResource) {
                const matchResult = await cloudinary.uploader.destroy(
                  matchingResource.public_id,
                  {
                    resource_type: resourceType,
                  }
                );

                if (matchResult && matchResult.result === "ok") {
                  return true;
                }
              }
            } catch (listErr) {
              console.error("Error listing resources:", listErr);
            }
          }
        } catch (searchErr) {
          console.error("Error searching for similar files:", searchErr);
        }
      }

      return false;
    }
  } catch (error) {
    console.error("Error deleting file from Cloudinary:", error);
    return false;
  }
};

/**
 * Extracts the raw public ID from a URL without decoding
 * Used as a fallback method for deletion
 */
const extractRawPublicIdFromUrl = (fileUrl: string): string | null => {
  try {
    const urlWithoutParams = fileUrl.split("?")[0];
    const parsedUrl = new URL(urlWithoutParams);
    const pathSegments = parsedUrl.pathname
      .split("/")
      .filter((segment) => segment.length > 0);

    const uploadIndex = pathSegments.findIndex(
      (segment) => segment === "upload"
    );
    if (uploadIndex === -1) return null;

    let publicIdSegments = pathSegments.slice(uploadIndex + 1);

    // Remove transformation parameters
    if (
      publicIdSegments.length > 0 &&
      publicIdSegments[0].startsWith("fl_attachment:")
    ) {
      publicIdSegments = publicIdSegments.slice(1);
    }

    // Remove version prefix
    if (publicIdSegments.length > 0 && publicIdSegments[0].match(/^v\d+$/)) {
      publicIdSegments = publicIdSegments.slice(1);
    }

    return publicIdSegments.join("/");
  } catch (error) {
    console.error("Error extracting raw public ID:", error);
    return null;
  }
};

export {
  uploadOnCloudinary,
  deleteFromCloudinary,
  extractCloudinaryInfo,
  getDownloadableCloudinaryUrl,
  getDownloadableUrlFromString,
};
