import { Advisor, Student } from "@prisma/client";
import prisma from "../db";
import { UserType, IUser } from "../types";

export const getAllUsersService = async ({
  page = 1,
  limit = 10,
  search = "",
}: {
  page?: number;
  limit?: number;
  search?: string;
}) => {
  const skip = (page - 1) * limit;
  const searchTerm = `%${search.trim().toLowerCase()}%`;

  let users: any[] = [];
  let totalCount = 0;

  if (search.trim()) {
    // Search query with parameterized search term
    users = await prisma.$queryRaw<any[]>`
      SELECT * FROM (
        (
          SELECT 
            id, email, "firstName", "lastName", avatar, "isEmailVerified", 
            "registrationNumber", NULL as "displayName", NULL as "societyId",
            'STUDENT' as "userType", "createdAt", "updatedAt"
          FROM "Student"
          WHERE (
            LOWER("firstName") LIKE ${searchTerm} OR 
            LOWER("lastName") LIKE ${searchTerm} OR 
            LOWER("email") LIKE ${searchTerm} OR
            LOWER("registrationNumber") LIKE ${searchTerm} OR
            LOWER(CONCAT("firstName", ' ', "lastName")) LIKE ${searchTerm}
          )
        )
        UNION ALL
        (
          SELECT 
            id, email, "firstName", "lastName", avatar, "isEmailVerified",
            NULL as "registrationNumber", "displayName", "societyId",
            'ADVISOR' as "userType", "createdAt", "updatedAt"
          FROM "Advisor"
          WHERE (
            LOWER("firstName") LIKE ${searchTerm} OR 
            LOWER("lastName") LIKE ${searchTerm} OR 
            LOWER("email") LIKE ${searchTerm} OR
            LOWER("displayName") LIKE ${searchTerm} OR
            LOWER(CONCAT("firstName", ' ', "lastName")) LIKE ${searchTerm}
          )
        )
      ) combined_users
      ORDER BY "createdAt" DESC
      LIMIT ${limit} OFFSET ${skip}
    `;

    // Count with search filter using parameterized query
    const countResult = await prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(*) as count FROM (
        (
          SELECT id FROM "Student"
          WHERE (
            LOWER("firstName") LIKE ${searchTerm} OR 
            LOWER("lastName") LIKE ${searchTerm} OR 
            LOWER("email") LIKE ${searchTerm} OR
            LOWER("registrationNumber") LIKE ${searchTerm} OR
            LOWER(CONCAT("firstName", ' ', "lastName")) LIKE ${searchTerm}
          )
        )
        UNION ALL
        (
          SELECT id FROM "Advisor"
          WHERE (
            LOWER("firstName") LIKE ${searchTerm} OR 
            LOWER("lastName") LIKE ${searchTerm} OR 
            LOWER("email") LIKE ${searchTerm} OR
            LOWER("displayName") LIKE ${searchTerm} OR
            LOWER(CONCAT("firstName", ' ', "lastName")) LIKE ${searchTerm}
          )
        )
      ) filtered_users
    `;
    totalCount = Number(countResult[0].count);
  } else {
    // No search - get all users
    users = await prisma.$queryRaw<any[]>`
      (
        SELECT 
          id, email, "firstName", "lastName", avatar, "isEmailVerified", 
          "registrationNumber", NULL as "displayName", NULL as "societyId",
          'STUDENT' as "userType", "createdAt", "updatedAt"
        FROM "Student"
      )
      UNION ALL
      (
        SELECT 
          id, email, "firstName", "lastName", avatar, "isEmailVerified",
          NULL as "registrationNumber", "displayName", "societyId",
          'ADVISOR' as "userType", "createdAt", "updatedAt"
        FROM "Advisor"
      )
      ORDER BY "createdAt" DESC
      LIMIT ${limit} OFFSET ${skip}
    `;

    const [studentCount, advisorCount] = await Promise.all([
      prisma.student.count(),
      prisma.advisor.count(),
    ]);
    totalCount = studentCount + advisorCount;
  }

  const totalPages = Math.ceil(totalCount / limit);

  // Transform the raw result to IUser type
  const transformedUsers: IUser[] = users.map((user) => ({
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    avatar: user.avatar || undefined,
    isEmailVerified: user.isEmailVerified,
    registrationNumber: user.registrationNumber || undefined,
    displayName: user.displayName || undefined,
    societyId: user.societyId || undefined,
    userType: user.userType as UserType,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }));

  return {
    users: transformedUsers,
    totalCount,
    totalPages,
    currentPage: page,
    searchTerm: search,
  };
};

export const getUserByIdService = async (userId: string) => {
  // First try to find in Student table
  const student = await prisma.student.findUnique({
    where: { id: userId },
    include: {
      societies: {
        select: {
          society: true,
          roles: {
            select: {
              role: true,
            },
          },
        },
      },
    },
  });

  if (student) {
    return {
      ...student,
      societies: student.societies.map((society) => ({
        society: society.society,
        roles: society.roles
          .filter(({ role }) => role.name !== "Member")
          .map(({ role }) => role),
      })),
    };
  }

  // If not found in Student, try Advisor table
  const advisor = await prisma.advisor.findUnique({
    where: { id: userId },
    include: {
      society: true,
    },
  });

  if (advisor) {
    return advisor;
  }

  return null;
};

export const updateUserProfileService = async (
  userId: string,
  updateFields: any
): Promise<IUser | null> => {
  // Try to update Student first
  let updatedUser = await prisma.student
    .update({
      where: { id: userId },
      data: {
        firstName: updateFields.firstName,
        lastName: updateFields.lastName,
        phone: updateFields.phone,
        bio: updateFields.bio,
        avatar: updateFields.avatar,
      },
    })
    .catch(() => null);

  if (updatedUser) {
    return {
      id: updatedUser.id,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      avatar: updatedUser.avatar || undefined,
      isEmailVerified: updatedUser.isEmailVerified,
      registrationNumber: updatedUser.registrationNumber,
      displayName: undefined,
      societyId: undefined,
      userType: UserType.STUDENT,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
      bio: updatedUser.bio || undefined,
      phone: updatedUser.phone || undefined,
    };
  }

  // If not a student, try Advisor
  const advisor = await prisma.advisor
    .update({
      where: { id: userId },
      data: {
        firstName: updateFields.firstName,
        lastName: updateFields.lastName,
        phone: updateFields.phone,
        bio: updateFields.bio,
        avatar: updateFields.avatar,
        displayName: updateFields.displayName,
      },
    })
    .catch(() => null);

  if (advisor) {
    return {
      id: advisor.id,
      email: advisor.email,
      firstName: advisor.firstName,
      lastName: advisor.lastName,
      avatar: advisor.avatar || undefined,
      isEmailVerified: advisor.isEmailVerified,
      registrationNumber: undefined,
      displayName: advisor.displayName,
      societyId: advisor.societyId || undefined,
      userType: UserType.ADVISOR,
      createdAt: advisor.createdAt,
      updatedAt: advisor.updatedAt,
      bio: advisor.bio || undefined,
      phone: advisor.phone || undefined,
    };
  }

  return null;
};
