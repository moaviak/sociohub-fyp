import { EventTicket } from "@prisma/client";
import { ApiError } from "../utils/ApiError";
import QRCode from "qrcode";
import prisma from "../db";

export class EventTicketService {
  async generateTicket(
    registrationId: string,
    event: any,
    studentId: string
  ): Promise<EventTicket> {
    const qrPayload = {
      registrationId,
      eventId: event.id,
      studentId,
      societyId: event.societyId,
    };

    const qrCode = await QRCode.toDataURL(JSON.stringify(qrPayload));

    return prisma.eventTicket.create({
      data: {
        registrationId,
        qrCode,
      },
    });
  }

  async deleteTicket(registrationId: string) {
    return prisma.eventTicket.deleteMany({
      where: { registrationId },
    });
  }

  async scanTicket(ticketData: {
    registrationId: string;
    eventId: string;
    studentId: string;
    societyId: string;
    adminId: string;
  }) {
    const ticket = await this.findTicketWithDetails(ticketData.registrationId);

    if (!ticket) {
      throw new ApiError(404, "Ticket not found");
    }

    this.validateTicketData(ticket, ticketData);
    this.validateTicketUsage(ticket);
    this.validateScanTiming(ticket.registration.event);

    return this.markTicketAsScanned(ticket.id, ticketData.adminId);
  }

  private async findTicketWithDetails(registrationId: string) {
    return prisma.eventTicket.findFirst({
      where: { registrationId },
      include: {
        registration: {
          include: {
            event: true,
            student: true,
          },
        },
        scannedByStudent: true,
      },
    });
  }

  private validateTicketData(ticket: any, ticketData: any) {
    const reg = ticket.registration;

    if (reg.eventId !== ticketData.eventId) {
      throw new ApiError(
        400,
        "This ticket does not belong to the selected event"
      );
    }

    if (reg.studentId !== ticketData.studentId) {
      throw new ApiError(400, "This ticket does not belong to this student");
    }

    if (reg.event.societyId !== ticketData.societyId) {
      throw new ApiError(400, "This ticket does not belong to this society");
    }
  }

  private validateTicketUsage(ticket: any) {
    if (ticket.isScanned) {
      throw new ApiError(409, "This ticket has already been used for entry");
    }
  }

  private validateScanTiming(event: any) {
    const now = new Date();
    const [startHour, startMinute] = (event.startTime || "00:00")
      .split(":")
      .map(Number);
    const [endHour, endMinute] = (event.endTime || "23:59")
      .split(":")
      .map(Number);

    const eventStart = new Date(event.startDate);
    eventStart.setHours(startHour, startMinute, 0, 0);

    const eventEnd = new Date(event.endDate);
    eventEnd.setHours(endHour, endMinute, 59, 999);

    const scanStart = new Date(eventStart.getTime() - 60 * 60 * 1000); // 1 hour before

    if (now < scanStart) {
      throw new ApiError(
        400,
        "Ticket scanning will be available 1 hour before the event starts"
      );
    }

    if (now > eventEnd) {
      throw new ApiError(
        400,
        "This event has ended. Ticket scanning is now closed"
      );
    }
  }

  private async markTicketAsScanned(ticketId: string, adminId: string) {
    return prisma.eventTicket.update({
      where: { id: ticketId },
      data: {
        isScanned: true,
        scannedAt: new Date(),
        scannedBy: adminId,
      },
      include: {
        registration: {
          include: {
            event: true,
            student: true,
          },
        },
        scannedByStudent: true,
      },
    });
  }
}
