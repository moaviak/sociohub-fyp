import prisma from "../db";

class PaymentValidation {
  // Check if society can accept payments
  async canAcceptPayments(societyId: string) {
    const paymentConfig = await prisma.societyPaymentConfig.findUnique({
      where: { societyId },
    });

    return (
      paymentConfig && paymentConfig.isOnboarded && paymentConfig.chargesEnabled
    );
  }

  // Validate event payment setup
  async validateEventPaymentSetup(eventId: string) {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        society: {
          include: {
            paymentConfig: true,
          },
        },
      },
    });

    if (!event) {
      throw new Error("Event not found");
    }

    if (!event.paidEvent) {
      throw new Error("Event is not a paid event");
    }

    if (!event.ticketPrice || event.ticketPrice <= 0) {
      throw new Error("Invalid ticket price");
    }

    if (
      !event.society.paymentConfig ||
      !event.society.paymentConfig.isOnboarded
    ) {
      throw new Error("Society payment configuration incomplete");
    }

    return true;
  }

  // Check if student can register for paid event
  async canStudentRegister(studentId: string, eventId: string) {
    // Check if student already registered
    const existingRegistration = await prisma.eventRegistration.findUnique({
      where: {
        studentId_eventId: {
          studentId,
          eventId,
        },
      },
    });

    if (existingRegistration) {
      throw new Error("Student already registered for this event");
    }

    // Check event capacity
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        _count: {
          select: {
            eventRegistrations: true,
          },
        },
      },
    });

    if (
      event!.maxParticipants &&
      event!._count.eventRegistrations >= event!.maxParticipants
    ) {
      throw new Error("Event has reached maximum capacity");
    }

    // Check registration deadline
    if (
      event!.registrationDeadline &&
      new Date() > event!.registrationDeadline
    ) {
      throw new Error("Registration deadline has passed");
    }

    return true;
  }
}

export default new PaymentValidation();
