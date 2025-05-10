import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { IUser, RequestAction } from "../types";
import prisma from "../db";
import { ApiError } from "../utils/ApiError";
import { processJoinRequestPDF } from "../services/request.service";
import { ApiResponse } from "../utils/ApiResponse";
import { deleteFromCloudinary } from "../utils/cloudinary";
import {
  sendRequestStatusEmail,
  sendRequestStatusNotification,
} from "../services/request-email.service";
import {
  createNotification,
  findSocietyMembersWithPrivilege,
  getSocietyAdvisor,
} from "../services/notification.service";
import { io } from "../app";
import { sendNotificationToUsers } from "../socket";

export const sendJoinRequest = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      societyId,
      reason,
      expectations,
      skills,
      whatsappNo,
      semester,
      interestedRole,
    } = req.body;
    const user = req.user as IUser;

    // Fetch user, society, and existing join request in a single query
    const [society, role, existingRequest] = await prisma.$transaction([
      prisma.society.findFirst({
        where: {
          id: societyId,
          members: { none: { studentId: user.id } }, // Ensures user is not already a member
        },
      }),
      prisma.role.findFirst({
        where: { id: interestedRole, societyId },
      }),
      prisma.joinRequest.findFirst({
        where: { studentId: user.id, societyId, status: "PENDING" },
      }),
    ]);

    if (!society) {
      throw new ApiError(400, "Invalid society.");
    }

    if (!society.acceptingNewMembers) {
      throw new ApiError(400, "Society is closed for registration.");
    }

    if (!role) {
      throw new ApiError(400, "Invalid role selected.");
    }

    if (existingRequest) {
      throw new ApiError(
        403,
        "You have already requested to join, please wait for approval."
      );
    }

    if (role?.minSemester && semester < role.minSemester) {
      throw new ApiError(
        400,
        `You must be in semester ${role.minSemester} or higher to apply for this role.`
      );
    }

    // Create the join request without PDF initially
    const newRequest = await prisma.joinRequest.create({
      data: {
        reason,
        expectations,
        skills,
        studentId: user.id,
        societyId: society.id,
        whatsappNo,
        semester,
        interestedRoleId: role.id,
        status: "PENDING",
        pdf: null, // Will be updated later
      },
      select: {
        id: true,
        studentId: true,
        societyId: true,
        reason: true,
        expectations: true,
        skills: true,
        whatsappNo: true,
        semester: true,
        interestedRoleId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Start PDF generation and upload in the background
    processJoinRequestPDF({
      joinRequestId: newRequest.id,
      user,
      society,
      role,
      requestData: {
        reason,
        expectations,
        skills,
        whatsappNo,
        semester,
      },
    }).catch((error) => {
      console.error("Background PDF processing failed:", error);
    });

    // Send notification to society members with member_management privilege and advisor
    (async () => {
      try {
        // Find recipients
        const [membersWithPrivilege, advisors] = await Promise.all([
          findSocietyMembersWithPrivilege(society.id, "member_management"),
          getSocietyAdvisor(society.id),
        ]);

        const recipients = [
          ...advisors.map((advisor) => ({
            ...advisor,
            redirectUrl: "/members/requests", // Advisor specific redirectUrl
          })),
          ...membersWithPrivilege.map((member) => ({
            ...member,
            redirectUrl: `/members/${society.id}/requests`, // Member specific redirectUrl
          })),
        ];

        if (recipients.length > 0) {
          // Create a single notification with all recipients
          const notification = await createNotification({
            image: user.avatar,
            title: "New Society Join Request",
            description: `${user.firstName} ${user.lastName} has requested to join ${society.name}. Review and respond to the request in Requests Panel.`,
            recipients,
          });

          // Send real-time notifications to connected users
          if (notification) {
            sendNotificationToUsers(io, recipients, notification);
          }
        }
      } catch (error) {
        console.error("Failed to send notifications:", error);
        // Don't fail the request if notification sending fails
      }
    })();

    return res
      .status(201)
      .json(
        new ApiResponse(
          200,
          newRequest,
          "Join Request has been successfully sent. PDF document is being generated."
        )
      );
  }
);

export const cancelJoinRequest = asyncHandler(
  async (req: Request, res: Response) => {
    const { societyId } = req.params;
    const { id: studentId } = req.user as IUser;

    if (!societyId) {
      throw new ApiError(400, "Role ID is required.");
    }

    // Use transaction to check and delete in one go
    const [request] = await prisma.$transaction([
      prisma.joinRequest.findFirst({
        where: { societyId, studentId, status: "PENDING" },
      }),
      prisma.joinRequest.deleteMany({
        where: { societyId, studentId, status: "PENDING" },
      }),
    ]);

    if (!request) {
      throw new ApiError(400, "No join request found.");
    }

    deleteFromCloudinary(request.pdf || "");

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          request,
          "Join request has been successfully canceled."
        )
      );
  }
);

export const handleRequest = asyncHandler(
  async (req: Request, res: Response) => {
    const { societyId } = req.params;
    const { studentId, action, reason } = req.body;

    // Fetch join request
    const request = await prisma.joinRequest.findFirst({
      where: { societyId, studentId, status: "PENDING" },
    });

    if (!request) {
      throw new ApiError(400, "No pending join request found.");
    }

    if (action === RequestAction.ACCEPT) {
      // Check if already a member (to prevent duplicates)
      const isAlreadyMember = await prisma.studentSociety.findUnique({
        where: {
          studentId_societyId: {
            studentId: request.studentId,
            societyId: request.societyId,
          },
        },
      });

      if (isAlreadyMember) {
        throw new ApiError(400, "Student is already a member of the society.");
      }

      const role = await prisma.role.findFirst({
        where: {
          name: "Member",
          societyId: request.societyId,
        },
      });

      if (!role) {
        throw new ApiError(500, "Default 'Member' role not found.");
      }

      await prisma.$transaction([
        prisma.studentSociety.create({
          data: {
            studentId: request.studentId,
            societyId: request.societyId,
            interestedRoleId: request.interestedRoleId,
          },
        }),
        prisma.studentSocietyRole.create({
          data: {
            roleId: role.id,
            societyId: request.societyId,
            studentId: request.studentId,
          },
        }),
        prisma.joinRequest.update({
          where: { id: request.id },
          data: {
            status: "APPROVED",
            rejectionReason: null,
          },
        }),
      ]);

      // Send approval email in the background (don't await)
      sendRequestStatusEmail({
        requestId: request.id,
        studentId: request.studentId,
        societyId: request.societyId,
        action: "ACCEPT",
      }).catch((error) => {
        console.error("Background email processing failed:", error);
      });

      sendRequestStatusNotification({
        studentId: request.studentId,
        societyId: request.societyId,
        action: "ACCEPT",
      }).catch((error) => {
        console.error("Notification sending failed: ", error);
      });

      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            request,
            "Student has been successfully added to the society."
          )
        );
    } else if (action === RequestAction.REJECT) {
      await prisma.joinRequest.update({
        where: { id: request.id },
        data: {
          status: "REJECTED",
          rejectionReason: reason || null,
        },
      });

      // Send rejection email in the background (don't await)
      sendRequestStatusEmail({
        requestId: request.id,
        studentId: request.studentId,
        societyId: request.societyId,
        action: "REJECT",
        rejectionReason: reason,
      }).catch((error) => {
        console.error("Background email processing failed:", error);
      });

      sendRequestStatusNotification({
        studentId: request.studentId,
        societyId: request.societyId,
        action: "ACCEPT",
      }).catch((error) => {
        console.error("Notification sending failed: ", error);
      });

      return res
        .status(200)
        .json(new ApiResponse(200, request, "Join request has been rejected."));
    }

    throw new ApiError(400, "Invalid action specified.");
  }
);

export const getSocietyRequests = asyncHandler(
  async (req: Request, res: Response) => {
    const { societyId } = req.params;

    if (!societyId) {
      throw new ApiError(400, "Society ID is required.");
    }

    // Fetch society with advisor details
    const society = await prisma.society.findUnique({
      where: { id: societyId },
      select: {
        id: true,
        name: true,
        advisor: {
          select: { id: true },
        },
      },
    });

    if (!society) {
      throw new ApiError(400, "Invalid Society ID.");
    }

    // Fetch join requests
    const requests = await prisma.joinRequest.findMany({
      where: { societyId: society.id, status: "PENDING" },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        studentId: true,
        societyId: true,
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
            registrationNumber: true,
          },
        },
        whatsappNo: true,
        semester: true,
        interestedRole: {
          select: {
            id: true,
            name: true,
          },
        },
        pdf: true,
        reason: true,
        status: true,
        expectations: true,
        skills: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res
      .status(200)
      .json(
        new ApiResponse(200, requests, "Society requests successfully fetched.")
      );
  }
);

export const getRequestsHistory = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
      throw new ApiError(400, "Society ID is required.");
    }

    // Fetch society with advisor details
    const society = await prisma.society.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        advisor: {
          select: { id: true },
        },
      },
    });

    if (!society) {
      throw new ApiError(400, "Invalid Society ID.");
    }

    // Fetch join requests
    const requests = await prisma.joinRequest.findMany({
      where: {
        societyId: society.id,
        OR: [{ status: "APPROVED" }, { status: "REJECTED" }],
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        studentId: true,
        societyId: true,
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
            registrationNumber: true,
          },
        },
        whatsappNo: true,
        semester: true,
        interestedRole: {
          select: {
            id: true,
            name: true,
          },
        },
        pdf: true,
        reason: true,
        status: true,
        rejectionReason: true,
        expectations: true,
        skills: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res
      .status(200)
      .json(
        new ApiResponse(200, requests, "Society requests successfully fetched.")
      );
  }
);
