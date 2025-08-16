import { Event, Society } from "@prisma/client";
import { CreateEventInput } from "./event.service";
import { ApiError } from "../utils/ApiError";
import { deleteFromCloudinary } from "../utils/cloudinary";
import { EventRepository } from "./repositories/event.repository";
import prisma from "../db";
import { createNotification } from "./notification.service";
import { sendNotificationToUsers } from "../socket";
import { io } from "../app";
import pushNotificationService from "./push-notification.service";

export class EventStatusService {
  determineUpdatedStatus(
    event: Partial<Event & { society: Society }>,
    update: Partial<
      CreateEventInput & {
        banner?: string;
      }
    >
  ) {
    let newStatus = event.status;
    const prevVisibility = event.visibility;
    const newVisibility = update.visibility ?? prevVisibility;
    if (newVisibility === "Publish" || newVisibility === "Schedule") {
      newStatus = "Upcoming";
    }

    return newStatus;
  }

  async deleteEvent(eventId: string) {
    try {
      // Find the event
      const event = await EventRepository.findEventById(eventId);
      if (!event) {
        throw new ApiError(404, "Event not found");
      }

      // Only allow deletion if event is a draft
      if (event.visibility !== "Draft") {
        throw new ApiError(400, "Only draft events can be deleted");
      }

      // Delete banner from Cloudinary if exists
      if (event.banner) {
        try {
          await deleteFromCloudinary(event.banner);
        } catch (e) {
          // Log error but do not block
        }
      }

      // Delete the event itself (no need to delete tickets/registrations for drafts)
      const deletedEvent = await EventRepository.deleteEvent(eventId);
      return deletedEvent;
    } catch (error: any) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, "Error deleting event: " + error.message);
    }
  }

  async cancelEvent(eventId: string) {
    try {
      const event = await EventRepository.findEventById(eventId);
      if (!event) {
        throw new ApiError(404, "Event not found");
      }
      // Only allow cancellation for Upcoming or Schedule events
      if (
        event.visibility === "Draft" ||
        event.status === "Completed" ||
        event.status === "Cancelled"
      ) {
        throw new ApiError(
          400,
          "Only upcoming or scheduled events can be cancelled"
        );
      }
      const cancelledEvent = await EventRepository.updateEvent(eventId, {
        status: "Cancelled",
      });

      // Fetch all registrations for this event
      const registrations = await prisma.eventRegistration.findMany({
        where: { eventId },
        select: { studentId: true },
      });
      const studentRecipients = registrations.map((r) => ({
        recipientType: "student" as const,
        recipientId: r.studentId,
      }));

      // Delete all registrations for this event
      await prisma.eventRegistration.deleteMany({ where: { eventId } });

      // Send notifications in background
      (async () => {
        if (studentRecipients.length > 0) {
          const notification = await createNotification({
            title: `Event Cancelled: ${event.title}`,
            description: `The event "${event.title}" has been cancelled. We apologize for any inconvenience.`,
            image: event.banner || undefined,
            webRedirectUrl: `/event/${event.id}`,
            mobileRedirectUrl: {
              pathname: "/event/[id]",
              params: { id: event.id },
            },
            recipients: studentRecipients,
          });
          if (notification && io) {
            sendNotificationToUsers(io, studentRecipients, notification);
            pushNotificationService.sendToRecipients(studentRecipients, {
              title: notification.title,
              body: notification.description,
            });
          }
        }
      })();

      return cancelledEvent;
    } catch (error: any) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, "Error cancelling event: " + error.message);
    }
  }
}
