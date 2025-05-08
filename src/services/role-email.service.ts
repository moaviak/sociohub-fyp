import { sendRoleAssignmentEmail } from "../utils/mail";
import prisma from "../db";
import logger from "../logger/winston.logger";

interface SendRoleAssignmentEmailOptions {
  roleId: string;
  societyId: string;
  memberIds: string[];
}

/**
 * Sends email notifications to students who have been assigned a role
 * This function is meant to be called without awaiting its result
 */
export const sendRoleAssignmentEmails = async ({
  roleId,
  societyId,
  memberIds,
}: SendRoleAssignmentEmailOptions) => {
  try {
    if (!memberIds.length) {
      return; // No members to notify
    }

    // Get role details
    const role = await prisma.role.findUnique({
      where: { id: roleId },
      select: {
        id: true,
        name: true,
        description: true,
        privileges: {
          select: {
            key: true,
          },
        },
      },
    });

    if (!role) {
      throw new Error(`Role with ID ${roleId} not found`);
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

    // Get members' details
    const members = await prisma.student.findMany({
      where: { id: { in: memberIds } },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    });

    if (!members.length) {
      throw new Error(`No members found for the provided IDs`);
    }

    // Format privilege names for email
    const privilegeNames = role.privileges.map((p) => p.key);

    // Send individual emails using To field for all members
    if (members.length === 1) {
      // Just one member, send a personalized email
      const member = members[0];
      const studentName = `${member.firstName} ${member.lastName}`;

      await sendRoleAssignmentEmail(member.email, {
        studentName,
        societyName: society.name,
        societyId: society.id,
        roleName: role.name,
        roleDescription: role.description || undefined,
        privileges: privilegeNames,
      });

      logger.info(
        `Sent role assignment email to ${member.email} for role ${role.name} in society ${society.name}`
      );
    } else {
      // Multiple members, use To field with all emails
      const allEmails = members.map((m) => m.email);

      await sendRoleAssignmentEmail(allEmails, {
        studentName: "Member", // Generic name since it will be sent to multiple people
        societyName: society.name,
        societyId: society.id,
        roleName: role.name,
        roleDescription: role.description || undefined,
        privileges: privilegeNames,
      });

      logger.info(
        `Sent role assignment email to ${members.length} members for role ${role.name} in society ${society.name}`
      );
    }
  } catch (error) {
    // Log the error but don't propagate it since this is a background process
    logger.error("Failed to send role assignment emails:", error);
  }
};
