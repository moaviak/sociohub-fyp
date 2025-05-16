import { sendMemberRemovalEmail } from "../utils/mail";
import prisma from "../db";
import logger from "../logger/winston.logger";
import { createNotification } from "./notification.service";
import { sendNotificationToUsers } from "../socket";
import { io } from "../app";

interface SendMemberRemovalOptions {
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
}: SendMemberRemovalOptions) => {
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

export const sendMemberRemovalStatusNotification = async ({
  studentId,
  societyId,
  reason,
}: SendMemberRemovalOptions) => {
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
        logo: true,
      },
    });

    if (!society) {
      throw new Error(`Society with ID ${societyId} not found`);
    }

    const notification = await createNotification({
      title: `You Have Been Removed from ${society.name}`,
      description: `You have been removed from the \"${society.name}\". You can check your email for the reason or contact the society advisor for more details.`,
      recipients: [
        {
          recipientId: student.id,
          recipientType: "student",
          webRedirectUrl: `/society/${society.name}`,
          mobileRedirectUrl: `/(student-tabs)/society/${society.name}`,
        },
      ],
      image: society.logo,
    });

    if (notification) {
      sendNotificationToUsers(
        io,
        [{ recipientId: student.id, recipientType: "student" }],
        notification
      );
    }
  } catch (error) {
    // Log the error but don't propagate it since this is a background process
    logger.error("Failed to send member removal status email:", error);
  }
};
