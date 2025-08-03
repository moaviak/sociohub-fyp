import prisma from "../db";
import { ApiError } from "../utils/ApiError";

class SociteyService {
  async getSocietyKPIs(societyId: string) {
    const society = await prisma.society.findUnique({
      where: { id: societyId },
      include: {
        _count: {
          select: {
            members: true,
            events: {
              where: {
                status: { in: ["Upcoming", "Ongoing"] },
                isDraft: { not: true },
                visibility: { not: "Draft" },
              },
            },
            teams: true,
          },
        },
      },
    });

    if (!society) {
      throw new ApiError(404, "Society not found");
    }

    const upcomingEvents = await prisma.event.findMany({
      where: {
        societyId,
        status: "Upcoming",
        isDraft: { not: true },
        visibility: { not: "Draft" },
      },
      select: { id: true },
    });
    const upcomingEventIds = upcomingEvents.map((e) => e.id);

    let upcomingEventRegistrationsCount = 0;
    if (upcomingEventIds.length > 0) {
      upcomingEventRegistrationsCount = await prisma.eventRegistration.count({
        where: {
          eventId: { in: upcomingEventIds },
          status: "APPROVED",
        },
      });
    }

    return {
      members: society._count.members,
      activeEvents: society._count.events,
      totalTeams: society._count.teams,
      upcomingEventRegistrations: upcomingEventRegistrationsCount,
    };
  }
}

export default new SociteyService();
