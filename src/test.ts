import { v2 as cloudinary } from "cloudinary";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const testCloudinaryDownload = async () => {
  try {
    // Upload a simple text file as raw
    const testFilePath = path.join(
      __dirname,
      "../public/temp",
      "SP22-bcs-051.pdf"
    );

    const uploadResult = await cloudinary.uploader.upload(testFilePath, {
      resource_type: "raw",
      folder: "test-downloads",
    });

    console.log("Upload successful:", uploadResult);

    // Create a direct download link using Cloudinary's API
    const downloadUrl = cloudinary.url(uploadResult.public_id, {
      resource_type: "raw",
      type: "upload",
      flags: "attachment",
    });

    console.log("Direct download URL:", downloadUrl);

    // Alternative approach with query parameter
    const alternativeUrl = `${uploadResult.secure_url}?dl=test.pdf`;
    console.log("Alternative download URL:", alternativeUrl);

    return {
      uploadResult,
      downloadUrl,
      alternativeUrl,
    };
  } catch (error) {
    console.error("Test failed:", error);
    return null;
  }
};

testCloudinaryDownload();
