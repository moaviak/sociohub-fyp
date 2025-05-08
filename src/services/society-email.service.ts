import { sendMemberRemovalEmail } from "../utils/mail";
import prisma from "../db";
import logger from "../logger/winston.logger";

interface SendMemberRemovalEmailOptions {
  studentId: string;
  societyId: string;
  reason?: string;
}

/**
 * Sends an email notification about member removal in the background
 * This function is meant to be called without awaiting its result
 */
export const sendMemberRemovalStatusEmail = async ({
  studentId,
  societyId,
  reason,
}: SendMemberRemovalEmailOptions) => {
  try {
    // Get student details
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    });

    if (!student) {
      throw new Error(`Student with ID ${studentId} not found`);
    }

    // Get society details
    const society = await prisma.society.findUnique({
      where: { id: societyId },
      select: {
        id: true,
        name: true,
      },
    });

    if (!society) {
      throw new Error(`Society with ID ${societyId} not found`);
    }

    // Format student's name
    const studentName = `${student.firstName} ${student.lastName}`;

    // Send member removal email
    await sendMemberRemovalEmail(student.email, {
      studentName,
      societyName: society.name,
      reason: reason || undefined,
    });

    logger.info(
      `Sent member removal email to ${student.email} for society ${society.name}`
    );
  } catch (error) {
    // Log the error but don't propagate it since this is a background process
    logger.error("Failed to send member removal status email:", error);
  }
};
