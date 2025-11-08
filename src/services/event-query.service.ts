import { EventStatus } from "@prisma/client";
import prisma from "../db";
import { ApiError } from "../utils/ApiError";
import { EventRepository } from "./repositories/event.repository";

export class EventQueryService {
  async getEvents(
    societyId: string | undefined,
    filters: any,
    user: any,
    page: number = 1,
    pageSize: number = 10
  ) {
    try {
      const now = new Date();
      const whereClause: any = {};

      // Only add societyId filter if provided
      if (societyId) {
        whereClause.societyId = societyId;
      }

      // Apply user context globally (not just per society)
      if (!user || user.isMember === false) {
        // Non-members can only see published/scheduled events, never drafts
        whereClause.visibility = { in: ["Publish", "Schedule"] };
        whereClause.isDraft = false;
        whereClause.OR = [
          { publishDateTime: null },
          { publishDateTime: { lte: now } },
        ];
      } else if (user.hasEventsPrivilege === false) {
        // Members without events privilege can't see drafts
        whereClause.isDraft = false;
      }
      // Members with events privilege can see everything, so no extra conditions needed

      // Only apply filters if they are provided
      if (filters && Object.keys(filters).length > 0) {
        // Add status filter if provided
        if (filters.status) {
          switch (filters.status) {
            case "Upcoming":
              whereClause.OR = [
                {
                  AND: [
                    { startDate: { gte: now } },
                    { status: EventStatus.Upcoming },
                  ],
                },
                { status: EventStatus.Ongoing },
              ];
              whereClause.isDraft = false; // Never show drafts for Upcoming
              break;
            case "Past":
              whereClause.AND = [
                {
                  status: {
                    in: [EventStatus.Completed, EventStatus.Cancelled],
                  },
                },
                { isDraft: false }, // Past events should never be drafts
              ];
              break;
            case "Draft":
              if (user?.hasEventsPrivilege) {
                whereClause.isDraft = true;
              } else {
                // If user doesn't have events privilege, return nothing for draft filter
                return [];
              }
              break;
          }
        }

        // Add categories filter if provided
        if (filters.categories && filters.categories.length > 0) {
          whereClause.categories = { hasSome: filters.categories };
        }

        // Add search filter if provided
        if (filters.search) {
          const searchCondition = {
            OR: [
              { title: { contains: filters.search, mode: "insensitive" } },
              {
                description: { contains: filters.search, mode: "insensitive" },
              },
              { tagline: { contains: filters.search, mode: "insensitive" } },
            ],
          };

          // Combine search with existing conditions
          whereClause.AND = whereClause.AND || [];
          whereClause.AND.push(searchCondition);
        }
      }

      const skip = (page - 1) * pageSize;
      const [events, total] = await Promise.all([
        prisma.event.findMany({
          where: whereClause,
          orderBy: [
            { isDraft: "asc" },
            { startDate: "asc" },
            { startTime: "asc" },
          ],
          skip,
          take: pageSize,
        }),
        prisma.event.count({ where: whereClause }),
      ]);

      // Custom sort: Upcoming first, then Ongoing, then Completed, then Cancelled
      const statusOrder: Record<EventStatus, number> = {
        [EventStatus.Upcoming]: 1,
        [EventStatus.Ongoing]: 2,
        [EventStatus.Completed]: 3,
        [EventStatus.Cancelled]: 4,
      };
      const sortedEvents = events.sort((a, b) => {
        const orderA = a.status ? statusOrder[a.status] : 99;
        const orderB = b.status ? statusOrder[b.status] : 99;
        if (orderA !== orderB) return orderA - orderB;
        // fallback to startDate, startTime if same status
        if (a.startDate && b.startDate && a.startDate !== b.startDate)
          return (
            new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
          );
        if (a.startTime && b.startTime && a.startTime !== b.startTime)
          return a.startTime.localeCompare(b.startTime);
        return 0;
      });

      return [sortedEvents, total];
    } catch (error: any) {
      throw new ApiError(500, "Error fetching events: " + error.message);
    }
  }
}
