import {
  uploadOnCloudinary,
  getDownloadableCloudinaryUrl,
} from "../utils/cloudinary";
import prisma from "../db";
import { IUser } from "../types";
import { generateJoinRequestPDF } from "../utils/pdf";
import { extractRegistrationNo } from "../utils/helpers";

interface ProcessPDFParams {
  joinRequestId: string;
  user: IUser;
  society: {
    id: string;
    name: string;
  };
  role: {
    id: string;
    name: string;
  };
  requestData: {
    reason: string;
    expectations: string;
    skills?: string;
    whatsappNo: string;
    semester: number;
  };
}

/**
 * Processes a join request PDF in the background
 * This function should be called without awaiting its result
 */
export const processJoinRequestPDF = async ({
  joinRequestId,
  user,
  society,
  role,
  requestData,
}: ProcessPDFParams): Promise<void> => {
  try {
    // Generate the PDF
    const pdfPath = await generateJoinRequestPDF({
      profileImage: user.avatar || "N/A",
      firstName: user.firstName,
      lastName: user.lastName,
      registrationNo: {
        ...extractRegistrationNo(user.registrationNumber || ""),
      },
      email: user.email,
      whatsappNo: requestData.whatsappNo,
      semester: requestData.semester.toString(),
      society: society.name,
      role: role.name || "N/A",
      reason: requestData.reason,
      expectations: requestData.expectations,
      skills: requestData.skills || "N/A",
    });

    // Upload the PDF to Cloudinary
    const uploadResult = await uploadOnCloudinary(
      pdfPath,
      society.name + "/pdfs",
      "raw"
    );

    if (!uploadResult) {
      throw new Error("Failed to upload PDF to Cloudinary");
    }

    const pdfUrl = getDownloadableCloudinaryUrl(uploadResult);

    // Update the join request with the PDF URL
    await prisma.joinRequest.update({
      where: { id: joinRequestId },
      data: { pdf: pdfUrl },
    });

    console.log(`Successfully processed PDF for join request ${joinRequestId}`);
  } catch (error) {
    console.error(
      `Error processing PDF for join request ${joinRequestId}:`,
      error
    );

    // Update the join request with error status if needed
    // This is optional, but can be useful for monitoring or retry logic
    await prisma.joinRequest.update({
      where: { id: joinRequestId },
      data: {
        // You could add a field like processingStatus or errorMessage if needed
        // processingStatus: "FAILED",
        // errorMessage: error.message
      },
    });

    // Re-throw the error if you want calling code to handle it
    throw error;
  }
};
