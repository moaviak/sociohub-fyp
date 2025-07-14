import { EventStatus } from "@prisma/client";
import prisma from "../db";
import { ApiError } from "../utils/ApiError";
import { EventRepository } from "./repositories/event.repository";

export class EventQueryService {
  async getEvents(
    societyId: string | undefined,
    filters: any,
    user: any,
    limit?: number
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

      // Debug log
      console.log("User context:", user);
      console.log("Filters:", filters);
      console.log("Where clause:", JSON.stringify(whereClause, null, 2));

      const events = await prisma.event.findMany({
        where: whereClause,
        orderBy: [
          { isDraft: "asc" },
          { startDate: "asc" },
          { startTime: "asc" },
        ],
        ...(limit ? { take: limit } : {}),
      });

      // Debug log
      console.log("Found events count:", events.length);

      return events;
    } catch (error: any) {
      throw new ApiError(500, "Error fetching events: " + error.message);
    }
  }
}
