import { Event, EventRegistration, EventStatus } from "@prisma/client";
import prisma from "../../db";

export class EventRepository {
  static async createEvent(data: any): Promise<Event> {
    return prisma.event.create({
      data,
      include: { society: true },
    });
  }

  static async updateEvent(eventId: string, data: any): Promise<Event> {
    return prisma.event.update({
      where: { id: eventId },
      data,
    });
  }

  static async findEventById(eventId: string) {
    return prisma.event.findUnique({
      where: { id: eventId },
      include: {
        society: true,
        _count: { select: { eventRegistrations: true } },
      },
    });
  }

  static async findEventWithSociety(eventId: string) {
    return prisma.event.findUnique({
      where: { id: eventId },
      include: { society: { include: { paymentConfig: true } } },
    });
  }

  static async findSocietyWithPaymentConfig(societyId: string) {
    return prisma.society.findUnique({
      where: { id: societyId },
      include: { paymentConfig: true },
    });
  }

  static async createRegistration(data: any): Promise<EventRegistration> {
    return prisma.eventRegistration.create({ data });
  }

  static async updateRegistration(registrationId: string, data: any) {
    return prisma.eventRegistration.update({
      where: { id: registrationId },
      data,
      include: { ticket: true },
    });
  }

  static async findRegistration(eventId: string, studentId: string) {
    return prisma.eventRegistration.findFirst({
      where: { eventId, studentId },
    });
  }

  static async findRegistrationWithDetails(registrationId: string) {
    return prisma.eventRegistration.findUnique({
      where: { id: registrationId },
      include: {
        student: true,
        event: { include: { society: true } },
        paymentTransaction: true,
      },
    });
  }

  static async deleteRegistration(registrationId: string) {
    await prisma.paymentTransaction.delete({
      where: { registrationId },
    });
    return prisma.eventRegistration.delete({
      where: { id: registrationId },
    });
  }

  static async cancelRegistration(registrationId: string) {
    return prisma.eventRegistration.update({
      where: { id: registrationId },
      data: {
        status: "DECLINED",
      },
    });
  }

  static async getRegistrationCount(eventId: string): Promise<number> {
    return prisma.eventRegistration.count({
      where: { eventId },
    });
  }

  static async checkMembership(
    studentId: string,
    societyId: string
  ): Promise<boolean> {
    const membership = await prisma.studentSociety.findFirst({
      where: { studentId, societyId },
    });
    return !!membership;
  }

  static async getUserEventRegistrations(userId: string, eventIds: string[]) {
    return prisma.eventRegistration.findMany({
      where: {
        studentId: userId,
        eventId: { in: eventIds },
      },
      select: { eventId: true },
    });
  }

  static async getUserRegisteredEvents(userId: string) {
    const registrations = await prisma.eventRegistration.findMany({
      where: { studentId: userId },
      include: {
        event: true,
        ticket: true,
        student: true,
      },
      orderBy: { registeredAt: "desc" },
    });

    const events = registrations.map((reg) => ({
      ...reg.event,
      isRegistered: true,
      registration: {
        id: reg.id,
        studentId: reg.studentId,
        eventId: reg.eventId,
        registeredAt: reg.registeredAt,
        ticket: reg.ticket,
        student: reg.student,
      },
    }));

    const statusOrder: Record<EventStatus, number> = {
      [EventStatus.Ongoing]: 1,
      [EventStatus.Upcoming]: 2,
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

    return sortedEvents;
  }

  static async deleteEvent(eventId: string) {
    return prisma.event.delete({
      where: { id: eventId },
    });
  }

  static async getAllStudents() {
    return prisma.student.findMany({
      select: { id: true },
    });
  }

  static async getSocietyMembers(societyId: string) {
    return prisma.studentSociety.findMany({
      where: { societyId },
      select: { studentId: true },
    });
  }

  static async getSocietyById(societyId: string) {
    return prisma.society.findUnique({
      where: { id: societyId },
      select: { name: true },
    });
  }

  static async getEventRegistrations(eventId: string) {
    return prisma.eventRegistration.findMany({
      where: { eventId },
      select: { studentId: true },
    });
  }

  static async deleteEventRegistrations(eventId: string) {
    return prisma.eventRegistration.deleteMany({
      where: { eventId },
    });
  }

  static async inviteStudents(eventId: string, studentIds: string[]) {
    const invitations = studentIds.map((studentId) =>
      prisma.eventInvitation.create({
        data: { eventId, studentId },
      })
    );

    return await Promise.all(invitations);
  }

  static async getUserInvitations(userId: string) {
    return prisma.eventInvitation.findMany({
      where: { studentId: userId },
      include: { event: { include: { society: true } } },
      orderBy: { sentAt: "desc" },
    });
  }
}
