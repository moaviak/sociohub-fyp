import {
  sendRequestApprovalEmail,
  sendRequestRejectionEmail,
} from "../utils/mail";
import prisma from "../db";
import logger from "../logger/winston.logger";
import { createNotification } from "./notification.service";
import { sendNotificationToUsers } from "../socket";
import { io } from "../app";

interface SendRequestOptions {
  requestId?: string;
  studentId: string;
  societyId: string;
  action: "ACCEPT" | "REJECT";
  rejectionReason?: string;
}

/**
 * Sends an email notification about request approval/rejection in the background
 * This function is meant to be called without awaiting its result
 */
export const sendRequestStatusEmail = async ({
  requestId,
  studentId,
  societyId,
  action,
  rejectionReason,
}: SendRequestOptions) => {
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

    if (action === "ACCEPT") {
      // Get the role information (needed for approval email)
      const memberRole = await prisma.role.findFirst({
        where: {
          name: "Member",
          societyId,
        },
        select: {
          id: true,
          name: true,
        },
      });

      if (!memberRole) {
        throw new Error(
          `Default member role not found for society ${societyId}`
        );
      }

      // Send approval email
      await sendRequestApprovalEmail(student.email, {
        studentName,
        societyName: society.name,
        roleName: memberRole.name,
      });

      logger.info(
        `Sent approval email to ${student.email} for society ${society.name}`
      );
    } else if (action === "REJECT") {
      // Send rejection email
      await sendRequestRejectionEmail(student.email, {
        studentName,
        societyName: society.name,
        rejectionReason: rejectionReason || undefined,
      });

      logger.info(
        `Sent rejection email to ${student.email} for society ${society.name}`
      );
    }
  } catch (error) {
    // Log the error but don't propagate it since this is a background process
    logger.error("Failed to send request status email:", error);
  }
};

export const sendRequestStatusNotification = async ({
  studentId,
  societyId,
  action,
  rejectionReason,
}: SendRequestOptions) => {
  try {
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

    if (action === "ACCEPT") {
      const notification = await createNotification({
        title: "Your Join Request Has Been Approved",
        description: `Congratulations! Your request to join the "${society.name}" has been accepted. You are now a member of the society.`,
        recipients: [
          {
            recipientId: student.id,
            recipientType: "student",
            webRedirectUrl: `/society/${society.id}`,
            mobileRedirectUrl: `/(student-tabs)/society/${society.id}`,
          },
        ],
        image: society.logo,
      });

      if (notification) {
        sendNotificationToUsers(
          io,
          [
            {
              recipientId: student.id,
              recipientType: "student",
            },
          ],
          notification
        );
      }
    } else {
      const notification = await createNotification({
        title: "Your Join Request Has Been Rejected",
        description: `Your request to join the "${society.name}" has been declined. You can check your email for more information or contact the society advisor if needed.`,
        recipients: [
          {
            recipientId: student.id,
            recipientType: "student",
            webRedirectUrl: `/society/${society.id}`,
            mobileRedirectUrl: `/(student-tabs)/society/${society.id}`,
          },
        ],
        image: society.logo,
      });

      if (notification) {
        sendNotificationToUsers(
          io,
          [
            {
              recipientId: student.id,
              recipientType: "student",
            },
          ],
          notification
        );
      }
    }
  } catch (error) {
    logger.error("Failed to send request status notification: ", error);
  }
};
