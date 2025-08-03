import { ActionNature, Prisma } from "@prisma/client";
import prisma from "../db";
import logger from "../logger/winston.logger";

export interface CreateActivityLogInput {
  studentId: string;
  societyId: string;
  action: string;
  description: string;
  nature: ActionNature;
  targetId?: string;
  targetType?: string;
  ipAddress?: string;
  userAgent?: string;
}

class ActivityLogService {
  /**
   * Create a new activity log entry.
   */
  async createActivityLog(input: CreateActivityLogInput) {
    const [student, society] = await Promise.all([
      prisma.student.findUnique({ where: { id: input.studentId } }),
      prisma.society.findUnique({ where: { id: input.societyId } }),
    ]);

    if (!student || !society) {
      logger.error(
        `Fail to create Activity Log as Student or Society is not valid`,
        input
      );
      return;
    }

    return prisma.activityLog.create({
      data: {
        studentId: input.studentId,
        societyId: input.societyId,
        action: input.action,
        description: input.description,
        nature: input.nature,
        targetId: input.targetId,
        targetType: input.targetType,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
      },
    });
  }

  async fetchSocietyActivityLogs({
    societyId,
    page = 1,
    limit = 20,
    search = "",
  }: {
    societyId: string;
    page?: number;
    limit?: number;
    search?: string;
  }) {
    const skip = (page - 1) * limit;
    const whereClause: Prisma.ActivityLogWhereInput = {
      societyId,
    };

    if (search && search.trim()) {
      whereClause.OR = [
        { action: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { student: { firstName: { contains: search, mode: "insensitive" } } },
        { student: { lastName: { contains: search, mode: "insensitive" } } },
        {
          student: {
            registrationNumber: { contains: search, mode: "insensitive" },
          },
        },
        { student: { email: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [activityLogs, total] = await Promise.all([
      prisma.activityLog.findMany({
        where: whereClause,
        orderBy: { timestamp: "desc" },
        include: { student: true },
        skip,
        take: limit,
      }),
      prisma.activityLog.count({ where: whereClause }),
    ]);

    return {
      activityLogs,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      limit,
    };
  }
}

export default new ActivityLogService();
