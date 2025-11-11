import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { IUser, RequestAction, UserType } from "../types";
import prisma from "../db";
import { ApiError } from "../utils/ApiError";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary";
import {
  getLocalPath,
  haveMembersPrivilege,
  haveSettingsPrivilege,
} from "../utils/helpers";
import { ApiResponse } from "../utils/ApiResponse";
import {
  sendMemberRemovalStatusEmail,
  sendMemberRemovalStatusNotification,
} from "../services/society-email.service";
import activityService from "../services/activity.service";
import societyService from "../services/society.service";

export const createSociety = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, description } = req.body;
    const { id, email } = req.user as IUser;

    // Verify that advisor exist in advisors list
    const verify = await prisma.societyAdvisor.findUnique({ where: { email } });

    if (!verify) {
      throw new ApiError(403, "Unauthorized: You cannot create a society.");
    }

    const advisor = await prisma.advisor.findUnique({ where: { id } });

    if (!advisor) {
      throw new ApiError(401, "Unauthorized: Advisor doesn't exist.");
    }

    if (advisor.societyId) {
      throw new ApiError(403, "An advisor can only create one society.");
    }

    const logo = req.file?.filename && getLocalPath(req.file?.filename);

    const uploadResult = await uploadOnCloudinary(logo || "", name);

    const society = await prisma.$transaction(async (tx) => {
      const newSociety = await tx.society.create({
        data: {
          name,
          description,
          logo: uploadResult?.secure_url || "",
          advisor: {
            connect: {
              id: advisor.id,
            },
          },
        },
      });

      await tx.role.createMany({
        data: [
          {
            name: "Member",
            societyId: newSociety.id,
            description:
              "A member of the society who participates in activities and events.",
          },
          {
            name: "President",
            societyId: newSociety.id,
            description:
              "The President serves as the official representative of the Society and acts as the primary link between the Society and university administration. They are responsible for overseeing all functional offices, initiating society projects, and co-approving budgets alongside the Vice President, General Secretary, and Treasurer. The President holds the deciding vote in society matters unless a dissent is raised by the Vice President, General Secretary, or Patron. They are required to sign all official documents on behalf of the Society and ensure they are approved by the Patron. Furthermore, the President must adhere to all university policies and procedures and is responsible for ensuring that all members do the same.",
          },
          {
            name: "Vice President",
            societyId: newSociety.id,
            description:
              "The Vice President assists the President in all responsibilities, including overseeing society operations, supporting project execution, and representing the Society when needed. They play a crucial supporting role in leadership, decision-making, and ensuring the smooth execution of society activities.",
          },
          {
            name: "General Secretary",
            societyId: newSociety.id,
            description:
              "The General Secretary is responsible for facilitating the operations of all functional offices within the Society. They work closely with the President in corresponding with the university administration, ensuring smooth project execution, and maintaining momentum for all initiatives. Additionally, the General Secretary prepares and manages operational checklists for events and monitors ongoing tasks to ensure timely completion.",
          },
          {
            name: "Treasurer",
            societyId: newSociety.id,
            description:
              "The Treasurer manages all financial matters of the Society, including maintaining accurate records of income, expenses, and donations. They are responsible for drafting budgets for proposed events, securing necessary approvals from the Patron and Accounts Office, and coordinating with the Accounts Office for the release of petty cash. The Treasurer ensures all receipts and financial documentation are properly recorded and organized, maintaining transparency and accountability in the Society's financial operations.",
          },
        ],
      });

      const advisorUser = await tx.user.findUnique({
        where: { advisorId: advisor.id },
      });

      if (advisorUser) {
        await tx.chat.create({
          data: {
            name: `${newSociety.name} - General`,
            type: "GROUP",
            societyId: newSociety.id,
            adminId: advisorUser.id,
            chatImage: newSociety.logo,
            participants: {
              connect: { id: advisorUser.id },
            },
          },
        });
      }

      return newSociety;
    });

    res
      .status(201)
      .json(new ApiResponse(201, { society }, "Society successfully created."));
  }
);

export const getSocieties = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user as IUser;
    const search = req.query.search as string | undefined;

    const where: any = {};
    if (search) {
      where.AND = [
        {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
          ],
        },
      ];
    }

    const societies = await prisma.society.findMany({
      where: Object.keys(where).length ? where : undefined,
      select: {
        id: true,
        name: true,
        description: true,
        logo: true,
        acceptingNewMembers: true,
        createdAt: true,
        updatedAt: true,
        advisor: {
          select: {
            id: true,
            displayName: true,
            email: true,
            firstName: true,
            lastName: true,
            avatar: true,
            phone: true,
          },
        },
        roles: {
          select: {
            id: true,
            name: true,
            minSemester: true,
          },
        },
        _count: {
          select: {
            members: true,
            joinRequests: true,
          },
        },
        members: {
          where: { studentId: user.id },
          select: { studentId: true },
        },
        joinRequests: {
          where: { studentId: user.id, status: "PENDING" },
          select: { studentId: true },
        },
      },
    });

    const societiesWithStatus = societies.map((society) => ({
      ...society,
      isMember: society.members.length > 0,
      hasRequestedToJoin: society.joinRequests.length > 0,
      members: undefined,
      joinRequests: undefined,
    }));

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          societiesWithStatus,
          "Societies successfully fetched."
        )
      );
  }
);

export const getSociety = asyncHandler(async (req: Request, res: Response) => {
  const { societyId } = req.params;
  const user = req.user as IUser;

  if (!societyId) {
    throw new ApiError(400, "Society id is required.");
  }
  const society = await prisma.society.findUnique({
    where: { id: societyId },
    include: {
      advisor: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          displayName: true,
          avatar: true,
        },
      },
      joinRequests: {
        where: { studentId: user.id, status: "PENDING" },
        select: { studentId: true },
      },
      _count: {
        select: {
          members: true,
          events: {
            where: {
              status: "Upcoming",
              visibility: "Publish",
              isDraft: false,
            },
          },
        },
      },
      members: {
        where: {
          OR: [
            { studentId: user.id },
            {
              roles: {
                some: {
                  role: {
                    name: {
                      in: [
                        "President",
                        "Vice President",
                        "General Secretary",
                        "Treasurer",
                      ],
                    },
                  },
                },
              },
            },
          ],
        },
        select: {
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatar: true,
            },
          },
          roles: {
            select: {
              role: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  });
  if (!society) {
    throw new ApiError(400, "Invalid society id.");
  }

  // Check membership status
  const isMember = society.members.some((m) => m.student.id === user.id);
  const hasRequestedToJoin = society.joinRequests.length > 0;

  // Transform members array to get office bearers
  const officeBearers = [
    "President",
    "Vice President",
    "General Secretary",
    "Treasurer",
  ]
    .map((roleName) => {
      const member = society.members.find((m) =>
        m.roles.some((r) => r.role.name === roleName)
      );

      return member
        ? {
            role: roleName,
            student: {
              id: member.student.id,
              firstName: member.student.firstName,
              lastName: member.student.lastName,
              email: member.student.email,
              avatar: member.student.avatar,
            },
          }
        : null;
    })
    .filter((bearer) => bearer !== null);

  // Remove members from final response and add transformed data
  const responseData = {
    ...society,
    members: undefined,
    joinRequests: undefined,
    upcomingEventsCount: society._count.events,
    officeBearers,
    isMember,
    hasRequestedToJoin,
  };

  return res
    .status(200)
    .json(new ApiResponse(200, responseData, "Society successfully fetched."));
});

export const getSocietyMembers = asyncHandler(
  async (req: Request, res: Response) => {
    const { societyId } = req.params;
    const user = req.user as IUser;
    const search = req.query.search as string | undefined;

    if (!societyId) {
      throw new ApiError(400, "Society ID is required.");
    }

    // 1. Check if the user is the advisor or a member of the society
    const [isAdvisor, isMember] = await prisma.$transaction([
      prisma.advisor.findFirst({
        where: {
          id: user.id,
          societyId: societyId,
        },
        select: { id: true },
      }),
      prisma.studentSociety.findFirst({
        where: {
          studentId: user.id,
          societyId: societyId,
        },
        select: { studentId: true },
      }),
    ]);

    if (!isAdvisor && !isMember) {
      throw new ApiError(
        403,
        "You are not authorized to view members of this society."
      );
    }

    // 2. Fetch members with their roles and privileges
    const where: any = { societyId };
    if (search) {
      where.AND = [
        {
          OR: [
            {
              student: { firstName: { contains: search, mode: "insensitive" } },
            },
            {
              student: { lastName: { contains: search, mode: "insensitive" } },
            },
            { student: { email: { contains: search, mode: "insensitive" } } },
            {
              student: {
                registrationNumber: { contains: search, mode: "insensitive" },
              },
            },
          ],
        },
      ];
    }

    const members = await prisma.studentSociety.findMany({
      where: Object.keys(where).length ? where : undefined,
      select: {
        societyId: true,
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            registrationNumber: true,
            avatar: true,
          },
        },
        roles: {
          select: {
            role: {
              select: {
                id: true,
                name: true,
                privileges: {
                  select: {
                    key: true,
                  },
                },
              },
            },
          },
        },
        interestedRole: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // 3. Format the response
    const formattedMembers = members.map((member) => {
      const allRoles = member.roles.map((r) => r.role);

      // Filter roles: if there are other roles than "Member", exclude "Member"
      const filteredRoles =
        allRoles.length > 1
          ? allRoles.filter((role) => role.name !== "Member")
          : allRoles;

      return {
        id: member.student.id,
        societyId: member.societyId,
        firstName: member.student.firstName,
        lastName: member.student.lastName,
        email: member.student.email,
        registrationNumber: member.student.registrationNumber,
        interestedRole: member.interestedRole,
        roles: filteredRoles.map((role) => ({
          id: role.id,
          name: role.name,
        })),
        avatar: member.student.avatar,
      };
    });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          formattedMembers,
          "Society members fetched successfully."
        )
      );
  }
);

export const getSocietyPeople = asyncHandler(
  async (req: Request, res: Response) => {
    const { societyId } = req.params;
    const user = req.user as IUser;
    const search = req.query.search as string | undefined;

    if (!societyId) {
      throw new ApiError(400, "Society ID is required.");
    }

    // 1. Check if the user is the advisor or a member of the society
    const [isAdvisor, isMember] = await prisma.$transaction([
      prisma.advisor.findFirst({
        where: {
          id: user.id,
          societyId: societyId,
        },
        select: { id: true },
      }),
      prisma.studentSociety.findFirst({
        where: {
          studentId: user.id,
          societyId: societyId,
        },
        select: { studentId: true },
      }),
    ]);

    if (!isAdvisor && !isMember) {
      throw new ApiError(
        403,
        "You are not authorized to view people of this society."
      );
    }

    // 2. Fetch advisor (with search filter if search is provided)
    let advisor = null;
    if (search) {
      advisor = await prisma.advisor.findFirst({
        where: {
          societyId,
          OR: [
            { firstName: { contains: search, mode: "insensitive" } },
            { lastName: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
            { displayName: { contains: search, mode: "insensitive" } },
            { phone: { contains: search, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          avatar: true,
          displayName: true,
          phone: true,
        },
      });
    } else {
      advisor = await prisma.advisor.findFirst({
        where: { societyId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          avatar: true,
          displayName: true,
          phone: true,
        },
      });
    }

    // 3. Fetch members with their roles and privileges
    const where: any = { societyId };
    if (search) {
      where.AND = [
        {
          OR: [
            {
              student: { firstName: { contains: search, mode: "insensitive" } },
            },
            {
              student: { lastName: { contains: search, mode: "insensitive" } },
            },
            { student: { email: { contains: search, mode: "insensitive" } } },
            {
              student: {
                registrationNumber: { contains: search, mode: "insensitive" },
              },
            },
          ],
        },
      ];
    }

    const members = await prisma.studentSociety.findMany({
      where: Object.keys(where).length ? where : undefined,
      select: {
        societyId: true,
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            registrationNumber: true,
            avatar: true,
          },
        },
        roles: {
          select: {
            role: {
              select: {
                id: true,
                name: true,
                privileges: {
                  select: {
                    key: true,
                  },
                },
              },
            },
          },
        },
        interestedRole: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // 4. Format the response
    const formattedMembers = members.map((member) => {
      const allRoles = member.roles.map((r) => r.role);
      const filteredRoles =
        allRoles.length > 1
          ? allRoles.filter((role) => role.name !== "Member")
          : allRoles;
      return {
        id: member.student.id,
        societyId: member.societyId,
        firstName: member.student.firstName,
        lastName: member.student.lastName,
        email: member.student.email,
        registrationNumber: member.student.registrationNumber,
        interestedRole: member.interestedRole,
        roles: filteredRoles.map((role) => ({
          id: role.id,
          name: role.name,
        })),
        avatar: member.student.avatar,
      };
    });

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          advisor: advisor || undefined,
          members: formattedMembers,
        },
        "Society people (advisor and members) fetched successfully."
      )
    );
  }
);

export const removeMember = asyncHandler(
  async (req: Request, res: Response) => {
    const { societyId } = req.params;
    const { studentId, reason } = req.body;
    const user = req.user as IUser;

    if (!societyId || !studentId) {
      throw new ApiError(400, "Society ID and Student ID are required.");
    }

    if (studentId === user.id) {
      throw new ApiError(400, "You can't remove yourself.");
    }

    // Check if the student is actually a member of the society
    const studentMembership = await prisma.studentSociety.findUnique({
      where: {
        studentId_societyId: {
          studentId,
          societyId,
        },
      },
      include: { student: true },
    });

    if (!studentMembership) {
      throw new ApiError(
        400,
        "The specified student is not a member of this society."
      );
    }

    // Start a transaction to delete related records first
    await prisma.$transaction([
      prisma.studentSocietyRole.deleteMany({
        where: { studentId, societyId },
      }),
      prisma.studentSociety.delete({
        where: {
          studentId_societyId: {
            studentId,
            societyId,
          },
        },
      }),
    ]);

    // Send email notification in the background
    sendMemberRemovalStatusEmail({
      studentId,
      societyId,
      reason,
    }).catch((error) => {
      console.error("Background email processing failed:", error);
    });

    sendMemberRemovalStatusNotification({
      studentId,
      societyId,
    }).catch((error) => {
      console.error("Background notification processing failed: ", error);
    });

    if (user.userType === UserType.STUDENT) {
      activityService.createActivityLog({
        studentId: user.id,
        societyId,
        action: "Remove Member",
        description: `${user.firstName} ${user.lastName} removed ${studentMembership.student.firstName} ${studentMembership.student.lastName} from society.`,
        nature: "ADMINISTRATIVE",
      });
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, null, "Member has been successfully removed.")
      );
  }
);

export const updateSettings = asyncHandler(
  async (req: Request, res: Response) => {
    const { societyId } = req.params;
    const { acceptingNewMembers, membersLimit } = req.body;
    const user = req.user as IUser;

    if (!societyId) {
      throw new ApiError(400, "Society id is required.");
    }

    const society = await prisma.society.update({
      where: { id: societyId },
      data: { acceptingNewMembers, membersLimit },
      select: {
        id: true,
        name: true,
        description: true,
        acceptingNewMembers: true,
        membersLimit: true,
      },
    });

    if (!society) {
      throw new ApiError(400, "Invalid society id.");
    }

    if (user.userType === UserType.STUDENT) {
      activityService.createActivityLog({
        studentId: user.id,
        societyId,
        action: "Update Settings",
        description: `${user.firstName} ${user.lastName} updated society settings.`,
        nature: "NEUTRAL",
      });
    }

    return res
      .status(200)
      .json(new ApiResponse(200, society, "Settings updated successfully."));
  }
);

export const updateSocietyProfile = asyncHandler(
  async (req: Request, res: Response) => {
    const { societyId } = req.params;
    const user = req.user as IUser;
    const {
      description,
      statementOfPurpose,
      advisorMessage,
      mission,
      coreValues,
    } = req.body;

    if (!societyId) {
      throw new ApiError(400, "Society id is required.");
    }

    // Only advisor can update
    const society = await prisma.society.findUnique({
      where: { id: societyId },
      select: { id: true, advisor: { select: { id: true } }, logo: true },
    });
    if (!society) {
      throw new ApiError(404, "Society not found.");
    }

    const havePrivilege = haveSettingsPrivilege(user.id, society.id);

    if (!havePrivilege) {
      throw new ApiError(
        403,
        "You don't have permission to update the society profile."
      );
    }

    // Handle logo upload
    let newLogoUrl = society.logo;
    if (req.file) {
      const logoPath = getLocalPath(req.file.filename);
      // Upload new logo
      const uploadResult = await uploadOnCloudinary(
        logoPath,
        societyId,
        "image"
      );
      if (uploadResult?.secure_url) {
        // Delete previous logo if exists
        if (society.logo) {
          deleteFromCloudinary(society.logo);
        }
        newLogoUrl = uploadResult.secure_url;
      }
    }

    // Update the society
    const updatedSociety = await prisma.society.update({
      where: { id: societyId },
      data: {
        logo: newLogoUrl,
        ...(description !== undefined && { description }),
        ...(statementOfPurpose !== undefined && { statementOfPurpose }),
        ...(advisorMessage !== undefined && { advisorMessage }),
        ...(mission !== undefined && { mission }),
        ...(coreValues !== undefined && { coreValues }),
      },
      select: {
        id: true,
        name: true,
        description: true,
        statementOfPurpose: true,
        advisorMessage: true,
        mission: true,
        coreValues: true,
        logo: true,
        updatedAt: true,
      },
    });

    if (user.userType === UserType.STUDENT) {
      activityService.createActivityLog({
        studentId: user.id,
        societyId,
        action: "Update Profile",
        description: `${user.firstName} ${user.lastName} updated society profile.`,
        nature: "NEUTRAL",
      });
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          updatedSociety,
          "Society profile updated successfully."
        )
      );
  }
);

export const getSocietyActivityLogs = asyncHandler(
  async (req: Request, res: Response) => {
    const { societyId } = req.params;
    const user = req.user as IUser;

    if (!user.societyId || user.societyId !== societyId) {
      throw new ApiError(403, "You are not authorized to access this society.");
    }

    const { page = 1, limit = 20, search = "", status } = req.query;

    const activityLogs = await activityService.fetchSocietyActivityLogs({
      societyId,
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      search: search as string,
    });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          activityLogs,
          "Society activity logs fetched successfully."
        )
      );
  }
);

export const getSocietyKPIs = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user as IUser;
    const { societyId } = req.params;

    if (user.societyId !== societyId) {
      throw new ApiError(403, "Only advisors can access this route.");
    }

    const kpis = await societyService.getSocietyKPIs(societyId);

    return res
      .status(200)
      .json(new ApiResponse(200, kpis, "Society KPIs succesfully fetched."));
  }
);
