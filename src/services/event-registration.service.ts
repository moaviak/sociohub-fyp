import {
  EventRegistration,
  EventTicket,
  PaymentTransaction,
} from "@prisma/client";
import { ApiError } from "../utils/ApiError";
import { EventRepository } from "./repositories/event.repository";
import { EventTicketService } from "./event-ticket.service";
import { EmailService } from "./email.service";
import paymentValidation from "../utils/paymentValidation";
import paymentService from "./payment.service";

export class EventRegistrationService {
  private ticketService = new EventTicketService();
  private emailService = new EmailService();

  async registerForEvent(
    eventId: string,
    studentId: string
  ): Promise<{
    registration: EventRegistration;
    paymentRequired: boolean;
    ticket?: EventTicket | null;
    clientSecret?: string | null;
    paymentIntentId?: string;
  }> {
    // Fetch event with required data
    const event = await EventRepository.findEventWithSociety(eventId);
    if (!event) {
      throw new ApiError(404, "Event not found");
    }

    // Validate registration eligibility
    await this.validateRegistrationEligibility(event, studentId);

    // Check for duplicate registration
    await this.checkDuplicateRegistration(eventId, studentId);

    // Check participant limit
    await this.checkParticipantLimit(event);

    // Create registration based on event type
    if (event.paidEvent) {
      return this.handlePaidEventRegistration(event, studentId);
    } else {
      return this.handleFreeEventRegistration(event, studentId);
    }
  }

  private async validateRegistrationEligibility(event: any, studentId: string) {
    if (event.visibility === "Draft") {
      throw new ApiError(400, "Cannot register for a draft event");
    }

    if (!event.registrationRequired) {
      throw new ApiError(400, "Registration is not required for this event");
    }

    if (event.visibility !== "Publish") {
      throw new ApiError(400, "Event is not open for registration");
    }

    if (
      event.registrationDeadline &&
      new Date(event.registrationDeadline) < new Date()
    ) {
      throw new ApiError(400, "Registration deadline has passed");
    }

    if (event.status !== "Upcoming") {
      throw new ApiError(400, "Event is not open for registration");
    }

    // Check audience eligibility
    if (event.audience === "Members") {
      const isMember = await EventRepository.checkMembership(
        studentId,
        event.societyId
      );
      if (!isMember) {
        throw new ApiError(
          403,
          "You must be a member of the society to register for this event"
        );
      }
    }

    if (event.audience === "Invite") {
      throw new ApiError(403, "This event is invite-only");
    }
  }

  private async checkDuplicateRegistration(eventId: string, studentId: string) {
    const existing = await EventRepository.findRegistration(eventId, studentId);
    if (existing) {
      throw new ApiError(409, "You have already registered for this event");
    }
  }

  private async checkParticipantLimit(event: any) {
    if (event.maxParticipants) {
      const count = await EventRepository.getRegistrationCount(event.id);
      if (count >= event.maxParticipants) {
        throw new ApiError(400, "Event has reached maximum participants");
      }
    }
  }

  private async handlePaidEventRegistration(event: any, studentId: string) {
    await paymentValidation.validateEventPaymentSetup(event.id);

    // Create pending registration
    const registration = await EventRepository.createRegistration({
      studentId,
      eventId: event.id,
    });

    return {
      registration,
      paymentRequired: true,
    };
  }

  private async handleFreeEventRegistration(event: any, studentId: string) {
    // Create completed registration
    let registration = await EventRepository.createRegistration({
      studentId,
      eventId: event.id,
      status: "APPROVED",
      registeredAt: new Date(),
    });

    // Generate ticket for physical events
    let ticket = null;
    if (event.eventType === "Physical") {
      ticket = await this.ticketService.generateTicket(
        registration.id,
        event,
        studentId
      );

      // Update registration with ticket
      registration = await EventRepository.updateRegistration(registration.id, {
        ticket: { connect: { id: ticket.id } },
      });
    }

    // Send confirmation email
    await this.emailService.sendRegistrationConfirmation(
      event,
      registration,
      ticket
    );

    return {
      registration,
      ticket,
      paymentRequired: false,
    };
  }

  async completeRegistrationAfterPayment(registrationId: string) {
    const registration = await EventRepository.findRegistrationWithDetails(
      registrationId
    );

    if (!registration) {
      throw new ApiError(404, "Registration not found");
    }

    let ticket = null;

    // Generate ticket for physical events
    if (registration.event.eventType === "Physical") {
      ticket = await this.ticketService.generateTicket(
        registration.id,
        registration.event,
        registration.studentId
      );

      // Update registration with ticket
      await EventRepository.updateRegistration(registration.id, {
        status: "APPROVED",
        registeredAt: new Date(),
        ticket: { connect: { id: ticket.id } },
      });
    }

    // Send confirmation email
    await this.emailService.sendRegistrationConfirmation(
      registration.event,
      registration,
      ticket
    );

    return { registration, ticket };
  }

  async cancelRegistration(registrationId: string, reason: string) {
    const registration = await EventRepository.findRegistrationWithDetails(
      registrationId
    );

    if (!registration) {
      throw new ApiError(404, "Registration not found");
    }

    // Delete associated ticket
    await this.ticketService.deleteTicket(registrationId);

    // Delete registration
    await EventRepository.cancelRegistration(registrationId);

    return {
      success: true,
      message: "Registration cancelled successfully",
    };
  }
}
