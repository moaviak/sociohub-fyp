import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { extractPublicId } from "./helpers";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath: string, folder: string) => {
  try {
    if (!localFilePath) return null;
    //upload the file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
      folder,
    });
    // file has been uploaded successfull
    //console.log("file is uploaded on cloudinary ", response.url);
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath); // remove the locally saved temporary file as the upload operation got failed
    return null;
  }
};

/**
 * Deletes a Cloudinary resource using its URL
 * @param url - The full Cloudinary resource URL
 * @param resourceType - The type of resource ('image' or 'video'), default is 'image'
 * @returns Deletion result or error
 */
const deleteResourceByUrl = async (
  url: string,
  resourceType: "image" | "video" = "image"
) => {
  const publicId = extractPublicId(url);

  if (!publicId) {
    console.error("Invalid URL: Could not extract public_id");
    return { success: false, error: "Invalid URL" };
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    console.log("Delete Response:", result);
    return { success: true, result };
  } catch (error) {
    console.error("Error deleting resource:", error);
    return { success: false, error };
  }
};

export { uploadOnCloudinary, deleteResourceByUrl };
