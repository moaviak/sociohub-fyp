import { Attachment, Message, PrismaClient, Team } from "@prisma/client";
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary";
import { getLocalPath } from "../utils/helpers";
import { ApiError } from "../utils/ApiError";
import { sendNotification } from "./cms.service";

const prisma = new PrismaClient();

export class TeamService {
  // Team Management (Society Admin)
  async createTeam(data: any, logoFile?: Express.Multer.File) {
    const student = await prisma.student.findUnique({
      where: { id: data.leadId },
      include: { user: true },
    });

    if (!student) {
      throw new ApiError(400, "Invalid lead id.");
    }

    let logoUrl = null;
    if (logoFile) {
      const localPath = getLocalPath(logoFile.filename);
      const uploadResult = await uploadOnCloudinary(localPath, "team_logos");
      if (!uploadResult) {
        throw new ApiError(500, "Failed to upload team logo");
      }
      logoUrl = uploadResult.secure_url;
    }

    const team = await prisma.$transaction(async (tx) => {
      const society = await tx.society.findUnique({
        where: { id: data.societyId },
      });
      const newTeam = await tx.team.create({
        data: {
          name: data.name,
          description: data.description ?? null,
          leadId: student.id,
          societyId: data.societyId,
          logo: logoUrl,
        },
      });

      await tx.teamMember.create({
        data: {
          teamId: newTeam.id,
          studentId: student.id,
        },
      });

      // Create team chat
      await tx.chat.create({
        data: {
          name: `${society?.name} ${newTeam.name}`,
          adminId: student.user?.id,
          chatImage: newTeam.logo,
          type: "GROUP",
          teamId: newTeam.id,
          participants: {
            connect: { id: student.user?.id },
          },
        },
      });

      return newTeam;
    });

    return team;
  }

  async getTeams(societyId: string) {
    return prisma.team.findMany({
      where: { societyId },
      include: {
        lead: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        members: {
          select: {
            studentId: true,
          },
        },
        _count: {
          select: {
            members: true,
          },
        },
      },
    });
  }

  async getTeamById(teamId: string) {
    return prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: {
          include: {
            student: true,
          },
        },
        lead: true,
        teamTasks: true,
        _count: {
          select: {
            members: true,
            joinRequests: {
              where: { status: "PENDING" },
            },
          },
        },
      },
    });
  }

  async getTeamJoinRequests(teamId: string) {
    const team = await prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      throw new ApiError(404, "Team not found");
    }

    return prisma.teamJoinRequest.findMany({
      where: {
        teamId,
        status: "PENDING",
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async updateTeam(teamId: string, data: any, logoFile?: Express.Multer.File) {
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: true,
      },
    });

    if (!team) {
      throw new ApiError(404, "Team not found");
    }

    let logoUrl = team.logo;

    // Handle logo deletion first if requested
    if (data.deleteLogo === "true" && team.logo) {
      await deleteFromCloudinary(team.logo);
      logoUrl = null;
    }

    // Handle new logo upload if provided
    if (logoFile) {
      const localPath = getLocalPath(logoFile.filename);
      const result = await uploadOnCloudinary(localPath, "team_logos");
      logoUrl = result?.secure_url ?? null;
    }

    // Handle team lead update
    let updateData: any = {
      name: data.name,
      description: data.description,
      logo: logoUrl,
    };

    if (data.leadId && data.leadId !== team.leadId) {
      // Check if new lead is already a member
      const isNewLeadMember = team.members.some(
        (member) => member.studentId === data.leadId
      );

      try {
        return await prisma.$transaction(async (tx) => {
          // If new lead is not a member, add them first
          if (!isNewLeadMember) {
            await tx.teamMember.create({
              data: {
                teamId,
                studentId: data.leadId,
              },
            });
          }

          // Update team with new lead
          const updatedTeam = await tx.team.update({
            where: { id: teamId },
            data: {
              ...updateData,
              leadId: data.leadId,
            },
            include: {
              lead: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  avatar: true,
                },
              },
              members: {
                include: {
                  student: true,
                },
              },
            },
          });

          // Send notifications
          await Promise.all([
            // Notify new lead
            sendNotification(
              "Team Lead Role Assigned",
              `You have been assigned as the team lead for ${updatedTeam.name}.`,
              [
                {
                  recipientId: data.leadId,
                  recipientType: "student",
                  webRedirectUrl: `/team-detail/${teamId}`,
                },
              ]
            ),

            // Notify old lead
            sendNotification(
              "Team Lead Role Changed",
              `You are no longer the team lead for ${updatedTeam.name}.`,
              [
                {
                  recipientId: team.leadId || "",
                  recipientType: "student",
                  webRedirectUrl: `/team-detail/${teamId}`,
                },
              ]
            ),
          ]);

          return updatedTeam;
        });
      } catch (error) {
        if (error instanceof Error) {
          throw new ApiError(
            500,
            `Failed to update team lead: ${error.message}`
          );
        }
        throw new ApiError(500, "Failed to update team lead");
      }
    }

    // If no lead change, just update other fields
    try {
      return await prisma.team.update({
        where: { id: teamId },
        data: updateData,
        include: {
          lead: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          members: {
            include: {
              student: true,
            },
          },
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new ApiError(500, `Failed to update team: ${error.message}`);
      }
      throw new ApiError(500, "Failed to update team");
    }
  }

  async deleteTeam(teamId: string) {
    // First, get all necessary information about the team
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        chat: {
          include: {
            messages: {
              include: {
                attachments: true,
              },
            },
          },
        },
        members: true,
      },
    });

    if (!team) {
      throw new ApiError(404, "Team not found");
    }

    // Delete team and related data in a transaction
    const deletedTeam = await prisma.$transaction(async (tx) => {
      // Delete team members first (due to foreign key constraints)
      await tx.teamMember.deleteMany({
        where: { teamId },
      });

      // Delete team join requests
      await tx.teamJoinRequest.deleteMany({
        where: { teamId },
      });

      // Delete team invitations
      await tx.teamInvitation.deleteMany({
        where: { teamId },
      });

      // Delete team tasks
      await tx.teamTask.deleteMany({
        where: { teamId },
      });

      // Delete the team chat if it exists
      if (team.chat) {
        await tx.chat.delete({
          where: { teamId },
        });
      }

      // Finally delete the team
      return tx.team.delete({
        where: { id: teamId },
      });
    });

    // After successful transaction, clean up media files asynchronously
    this.cleanupTeamMedia(team).catch((error) => {
      console.error("Error cleaning up team media:", error);
    });

    return deletedTeam;
  }

  private async cleanupTeamMedia(team: any) {
    try {
      const cleanupPromises: Promise<any>[] = [];

      // Delete team logo from Cloudinary if it exists
      if (team.logo) {
        cleanupPromises.push(deleteFromCloudinary(team.logo));
      }

      // Delete chat attachments if chat exists
      if (team.chat?.messages) {
        const attachmentUrls: string[] = team.chat.messages
          .flatMap(
            (message: Partial<Message & { attachments: Attachment[] }>) =>
              message.attachments
          )
          .filter((attachment: Attachment) => attachment?.url)
          .map((attachment: Attachment) => attachment.url);

        // Delete each attachment from Cloudinary
        attachmentUrls.forEach((url) => {
          cleanupPromises.push(deleteFromCloudinary(url));
        });
      }

      // Execute all cleanup operations in parallel
      await Promise.all(cleanupPromises);
    } catch (error) {
      console.error("Error in cleanupTeamMedia:", error);
      // Don't throw the error as this is a background operation
    }
  }

  async requestToJoinTeam(teamId: string, studentId: string, message?: string) {
    // Check if team exists
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: {
          where: { studentId },
          select: { studentId: true },
        },
      },
    });

    if (!team) {
      throw new ApiError(404, "Team not found");
    }

    // Check if student is already a member of the team
    if (team.members.length > 0) {
      throw new ApiError(400, "You are already a member of this team");
    }

    // Check if there's already a pending request
    const existingRequest = await prisma.teamJoinRequest.findFirst({
      where: {
        teamId,
        studentId,
        status: "PENDING",
      },
    });

    if (existingRequest) {
      throw new ApiError(
        400,
        "You already have a pending request to join this team"
      );
    }

    // Check if there's already a pending invitation
    const existingInvitation = await prisma.teamInvitation.findFirst({
      where: {
        teamId,
        studentId,
        status: "PENDING",
      },
    });

    if (existingInvitation) {
      throw new ApiError(
        400,
        "You already have a pending invitation to this team"
      );
    }

    // Create the join request
    try {
      const request = await prisma.teamJoinRequest.create({
        data: {
          teamId,
          studentId,
          message,
          status: "PENDING",
        },
        include: {
          team: {
            include: {
              lead: true,
            },
          },
          student: true,
        },
      });

      sendNotification(
        "New Team Join Request",
        `${request.student.firstName} ${request.student.lastName} has requested to join your team: ${request.team.name}.`,
        [
          {
            recipientId: request.team.leadId!,
            recipientType: "student",
            webRedirectUrl: `/team-detail/${request.teamId}`,
          },
        ]
      );

      return request;
    } catch (error) {
      if (error instanceof Error) {
        throw new ApiError(
          500,
          `Failed to create join request: ${error.message}`
        );
      }
      throw new ApiError(500, "Failed to create join request");
    }
  }

  async approveJoinRequest(
    requestId: string,
    respondedById: string,
    responseNote?: string
  ) {
    // Find the request and include necessary relations
    const request = await prisma.teamJoinRequest.findUnique({
      where: { id: requestId },
      include: {
        team: {
          include: {
            members: true,
          },
        },
        student: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!request) {
      throw new ApiError(404, "Join request not found");
    }

    if (request.status !== "PENDING") {
      throw new ApiError(400, "This request has already been processed");
    }

    // Check if student is already a member (double check)
    const existingMembership = request.team.members.find(
      (member) => member.studentId === request.studentId
    );

    if (existingMembership) {
      throw new ApiError(400, "Student is already a member of this team");
    }

    // Process the request in a transaction
    try {
      const result = await prisma.$transaction(async (tx) => {
        // Update request status
        const updatedRequest = await tx.teamJoinRequest.update({
          where: { id: requestId },
          data: {
            status: "APPROVED",
            respondedById,
            responseNote,
            respondedAt: new Date(),
          },
          include: {
            team: true,
            student: true,
          },
        });

        // Add student as team member
        await tx.teamMember.create({
          data: {
            teamId: request.teamId,
            studentId: request.studentId,
          },
        });

        // Get team with chat info
        const team = await tx.team.findUnique({
          where: { id: request.teamId },
          include: { chat: true },
        });

        // Add student to team chat if it exists
        if (team && request.student.user?.id) {
          await tx.chat.update({
            where: { teamId: team?.id },
            data: {
              participants: {
                connect: { id: request.student.user.id },
              },
            },
          });
        }

        return updatedRequest;
      });

      // Send notification to student
      await sendNotification(
        "Team Join Request Approved",
        `Your request to join ${result.team.name} has been approved!`,
        [
          {
            recipientId: result.studentId,
            recipientType: "student",
            webRedirectUrl: `/team-detail/${result.teamId}`,
          },
        ]
      );

      return result;
    } catch (error) {
      if (error instanceof Error) {
        throw new ApiError(
          500,
          `Failed to approve join request: ${error.message}`
        );
      }
      throw new ApiError(500, "Failed to approve join request");
    }
  }

  async rejectJoinRequest(
    requestId: string,
    respondedById: string,
    responseNote?: string
  ) {
    // Find the request and include necessary relations
    const request = await prisma.teamJoinRequest.findUnique({
      where: { id: requestId },
      include: {
        team: true,
        student: true,
      },
    });

    if (!request) {
      throw new ApiError(404, "Join request not found");
    }

    if (request.status !== "PENDING") {
      throw new ApiError(400, "This request has already been processed");
    }

    try {
      // Update request status
      const result = await prisma.teamJoinRequest.update({
        where: { id: requestId },
        data: {
          status: "REJECTED",
          respondedById,
          responseNote,
          respondedAt: new Date(),
        },
        include: {
          team: true,
          student: true,
        },
      });

      // Send notification to student
      await sendNotification(
        "Team Join Request Rejected",
        `Your request to join ${result.team.name} has been rejected${
          responseNote ? `: ${responseNote}` : "."
        }`,
        [
          {
            recipientId: result.studentId,
            recipientType: "student",
            webRedirectUrl: `/team-detail/${result.teamId}`,
          },
        ]
      );

      return result;
    } catch (error) {
      if (error instanceof Error) {
        throw new ApiError(
          500,
          `Failed to reject join request: ${error.message}`
        );
      }
      throw new ApiError(500, "Failed to reject join request");
    }
  }

  async addMemberToTeam(teamId: string, studentId: string, userId: string) {
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: true,
        chat: true,
      },
    });

    if (!team) {
      throw new ApiError(404, "Team not found");
    }

    if (team.leadId !== userId) {
      throw new ApiError(403, "Only team lead can add members");
    }

    // Check if student is already a member
    if (team.members.some((member) => member.studentId === studentId)) {
      throw new ApiError(400, "Student is already a member of this team");
    }

    try {
      const result = await prisma.$transaction(async (tx) => {
        // Add team member
        const member = await tx.teamMember.create({
          data: {
            teamId,
            studentId,
          },
          include: {
            student: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
                user: true,
              },
            },
          },
        });

        // Add to team chat if exists and student has a user account
        if (team.chat && member.student.user?.id) {
          await tx.chat.update({
            where: { teamId: team.id },
            data: {
              participants: {
                connect: { id: member.student.user.id },
              },
            },
          });
        }

        return member;
      });

      // Send notification to added member
      await sendNotification(
        "Added to Team",
        `You have been added to team ${team.name}`,
        [
          {
            recipientId: studentId,
            recipientType: "student",
            webRedirectUrl: `/team-detail/${teamId}`,
          },
        ]
      );

      return result;
    } catch (error) {
      if (error instanceof Error) {
        throw new ApiError(500, `Failed to add team member: ${error.message}`);
      }
      throw new ApiError(500, "Failed to add team member");
    }
  }

  async addTeamMembers(teamId: string, studentIds: string[], userId: string) {
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: true,
        chat: true,
      },
    });

    if (!team) {
      throw new ApiError(404, "Team not found");
    }

    if (team.leadId !== userId) {
      throw new ApiError(403, "Only team lead can add members");
    }

    // Filter out students who are already members
    const existingMemberIds = team.members.map((member) => member.studentId);
    const newMemberIds = studentIds.filter(
      (id) => !existingMemberIds.includes(id)
    );

    if (newMemberIds.length === 0) {
      throw new ApiError(400, "All selected students are already team members");
    }

    // Add all new members in a transaction with increased timeout
    try {
      const addedMembers = await prisma.$transaction(
        async (tx) => {
          // Add team members
          const members = await Promise.all(
            newMemberIds.map((studentId) =>
              tx.teamMember.create({
                data: {
                  teamId,
                  studentId,
                },
                include: {
                  student: {
                    select: {
                      id: true,
                      firstName: true,
                      lastName: true,
                      avatar: true,
                      user: true,
                    },
                  },
                },
              })
            )
          );

          // Add members to team chat if it exists
          if (team.chat) {
            const userIds = members
              .map((member) => member.student.user?.id)
              .filter((id): id is string => id !== undefined);

            if (userIds.length > 0) {
              await tx.chat.update({
                where: { id: team.chat.id },
                data: {
                  participants: {
                    connect: userIds.map((id) => ({ id })),
                  },
                },
              });
            }
          }

          return members;
        },
        {
          timeout: 15000,
        }
      );

      // Send notifications outside the transaction
      await Promise.all(
        addedMembers.map((member) =>
          sendNotification(
            "Added to Team",
            `You have been added to team ${team.name}`,
            [
              {
                recipientId: member.studentId,
                recipientType: "student",
                webRedirectUrl: `/team-detail/${teamId}`,
              },
            ]
          )
        )
      );

      return addedMembers;
    } catch (error) {
      if (error instanceof Error) {
        throw new ApiError(500, `Failed to add team members: ${error.message}`);
      }
      throw new ApiError(500, "Failed to add team members");
    }
  }

  async removeMemberFromTeam(
    teamId: string,
    studentId: string,
    userId: string
  ) {
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: true,
        lead: true,
      },
    });

    if (!team) {
      throw new ApiError(404, "Team not found");
    }

    // Only team lead can remove members
    if (team.leadId !== userId) {
      throw new ApiError(403, "Only team lead can remove members");
    }

    // Can't remove team lead
    if (studentId === team.leadId) {
      throw new ApiError(400, "Cannot remove team lead from the team");
    }

    // Check if student is a member
    if (!team.members.some((member) => member.studentId === studentId)) {
      throw new ApiError(400, "Student is not a member of this team");
    }

    try {
      const result = await prisma.$transaction(async (tx) => {
        // Remove from team members
        const removedMember = await tx.teamMember.delete({
          where: {
            teamId_studentId: {
              teamId,
              studentId,
            },
          },
          include: {
            student: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
                user: true,
              },
            },
          },
        });

        // Remove from team chat if exists
        if (removedMember.student.user?.id) {
          await tx.chat.update({
            where: { teamId },
            data: {
              participants: {
                disconnect: { id: removedMember.student.user.id },
              },
            },
          });
        }

        return removedMember;
      });

      // Send notification to removed member
      await sendNotification(
        "Removed from Team",
        `You have been removed from team ${team.name}`,
        [
          {
            recipientId: studentId,
            recipientType: "student",
            webRedirectUrl: `/teams`,
          },
        ]
      );

      return result;
    } catch (error) {
      if (error instanceof Error) {
        throw new ApiError(
          500,
          `Failed to remove team member: ${error.message}`
        );
      }
      throw new ApiError(500, "Failed to remove team member");
    }
  }

  // Team-Level Task Management
  async createTeamTask(data: {
    teamId: string;
    title: string;
    description?: string;
    dueDate?: Date;
    userId: string;
  }) {
    // Verify team exists
    const team = await prisma.team.findUnique({
      where: { id: data.teamId },
      include: {
        members: true,
      },
    });

    if (!team) {
      throw new ApiError(404, "Team not found");
    }

    if (team.leadId !== data.userId) {
      throw new ApiError(403, "Only team lead can create tasks");
    }

    // Validate due date
    if (data.dueDate && new Date(data.dueDate) < new Date()) {
      throw new ApiError(400, "Due date cannot be in the past");
    }

    try {
      const task = await prisma.teamTask.create({
        data: {
          title: data.title,
          description: data.description,
          dueDate: data.dueDate,
          teamId: data.teamId,
          status: "TO_DO",
        },
        include: {
          team: true,
        },
      });

      // Send notification to team members
      const memberIds = team.members.map((m) => m.studentId);
      await sendNotification(
        "New Team Task Created",
        `A new task "${task.title}" has been created in your team${
          task.dueDate
            ? ` (Due: ${new Date(task.dueDate).toLocaleDateString()})`
            : ""
        }.`,
        memberIds.map((id) => ({
          recipientId: id,
          recipientType: "student",
          webRedirectUrl: `/team-detail/${task.teamId}`,
        }))
      );

      return task;
    } catch (error) {
      if (error instanceof Error) {
        throw new ApiError(500, `Failed to assign team task: ${error.message}`);
      }
      throw new ApiError(500, "Failed to assign team task");
    }
  }

  async assignTeamTask(data: {
    teamId: string;
    title: string;
    description?: string;
    dueDate?: Date;
    assignedById?: string;
    assignedByAdvisorId?: string;
  }) {
    // Verify team exists
    const team = await prisma.team.findUnique({
      where: { id: data.teamId },
      include: {
        members: true,
      },
    });

    if (!team) {
      throw new ApiError(404, "Team not found");
    }

    // Validate due date
    if (data.dueDate && new Date(data.dueDate) < new Date()) {
      throw new ApiError(400, "Due date cannot be in the past");
    }

    try {
      const task = await prisma.teamTask.create({
        data: {
          title: data.title,
          description: data.description,
          dueDate: data.dueDate,
          teamId: data.teamId,
          assignedById: data.assignedById ?? null,
          assignedByAdvisorId: data.assignedByAdvisorId ?? null,
          status: "TO_DO",
        },
        include: {
          team: true,
          assignedBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
        },
      });

      // Send notification to team members
      const memberIds = team.members.map((m) => m.studentId);
      await sendNotification(
        "New Team Task Assigned",
        `A new task "${task.title}" has been assigned to your team${
          task.dueDate
            ? ` (Due: ${new Date(task.dueDate).toLocaleDateString()})`
            : ""
        }.`,
        memberIds.map((id) => ({
          recipientId: id,
          recipientType: "student",
          webRedirectUrl: `/team-detail/${task.teamId}`,
        }))
      );

      return task;
    } catch (error) {
      if (error instanceof Error) {
        throw new ApiError(500, `Failed to assign team task: ${error.message}`);
      }
      throw new ApiError(500, "Failed to assign team task");
    }
  }

  async getTeamTasks(teamId: string) {
    // TODO: Implement logic for FR.TM.4.3
    return prisma.teamTask.findMany({ where: { teamId } });
  }

  async updateTeamTaskStatus(
    taskId: string,
    status: "TO_DO" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED",
    updatedById: string
  ) {
    // Find task and include team lead info
    const task = await prisma.teamTask.findUnique({
      where: { id: taskId },
      include: {
        team: {
          include: {
            lead: true,
          },
        },
      },
    });

    if (!task) {
      throw new ApiError(404, "Task not found");
    }

    // Only team lead can update task status
    if (!task.team?.lead?.id || task.team.lead.id !== updatedById) {
      throw new ApiError(403, "Only team lead can update task status");
    }

    try {
      const updatedTask = await prisma.teamTask.update({
        where: { id: taskId },
        data: {
          status,
          updatedAt: new Date(),
        },
        include: {
          team: true,
          assignedBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
        },
      });

      return updatedTask;
    } catch (error) {
      if (error instanceof Error) {
        throw new ApiError(
          500,
          `Failed to update task status: ${error.message}`
        );
      }
      throw new ApiError(500, "Failed to update task status");
    }
  }

  async leaveTeam(teamId: string, studentId: string) {
    // Verify team and member exists
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: true,
        lead: true,
      },
    });

    if (!team) {
      throw new ApiError(404, "Team not found");
    }

    // Check if user is the team lead
    if (team.leadId === studentId) {
      throw new ApiError(403, "Team lead cannot leave the team");
    }

    // Check if student is a member
    const isMember = team.members.some(
      (member) => member.studentId === studentId
    );
    if (!isMember) {
      throw new ApiError(400, "You are not a member of this team");
    }

    try {
      // Remove member from team
      const removedMember = await prisma.teamMember.delete({
        where: {
          teamId_studentId: {
            teamId,
            studentId,
          },
        },
      });

      return removedMember;
    } catch (error) {
      if (error instanceof Error) {
        throw new ApiError(500, `Failed to leave team: ${error.message}`);
      }
      throw new ApiError(500, "Failed to leave team");
    }
  }
}
