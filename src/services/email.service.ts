import { Event, EventRegistration, EventTicket } from "@prisma/client";
import { sendEventRegistrationConfirmationEmail } from "../utils/mail";
import prisma from "../db";

export class EmailService {
  async sendRegistrationConfirmation(
    event: any,
    registration: EventRegistration,
    ticket?: any
  ) {
    const student = await prisma.student.findUnique({
      where: { id: registration.studentId },
    });

    if (!student) return;

    let entryInstructions: string | undefined = undefined;

    if (event.eventType === "Physical") {
      entryInstructions =
        "Please present the attached QR code at the event entrance. This ticket allows one-time entry only. Do not share your QR code with others.";
    }

    await sendEventRegistrationConfirmationEmail(student.email, {
      studentName: student.firstName + " " + student.lastName,
      eventTitle: event.title,
      eventStartDate: event.startDate?.toLocaleDateString() ?? "",
      eventEndDate: event.endDate?.toLocaleDateString() ?? "",
      eventStartTime: event.startTime ?? undefined,
      eventEndTime: event.endTime ?? undefined,
      eventVenue: event.venueName || event.venueAddress || undefined,
      eventType: event.eventType || "",
      societyName: event.society.name,
      ticketQrCode: ticket?.qrCode,
      entryInstructions,
      platform: event.platform ?? undefined,
      meetingLink: event.meetingLink ?? undefined,
      accessInstructions: event.accessInstructions ?? undefined,
    });
  }
}
