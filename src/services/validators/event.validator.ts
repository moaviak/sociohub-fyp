import { ApiError } from "../../utils/ApiError";
import { EventRepository } from "../repositories/event.repository";
import { CreateEventInput } from "../event.service";

export class EventValidator {
  static async validateSociety(societyId: string) {
    const society = await EventRepository.findSocietyWithPaymentConfig(
      societyId
    );
    if (!society) {
      throw new ApiError(404, "Society not found");
    }
    return society;
  }

  static async validatePaymentConfiguration(society: any, paidEvent?: boolean) {
    if (
      paidEvent &&
      (!society.paymentConfig || !society.paymentConfig.isOnboarded)
    ) {
      throw new ApiError(
        400,
        "You must complete payment configuration to create a paid event"
      );
    }
  }

  static async validateEventDates(startDateTime: Date, endDateTime: Date) {
    const now = new Date();

    if (startDateTime < now) {
      throw new ApiError(400, "Event start date cannot be in the past");
    }

    if (endDateTime <= startDateTime) {
      throw new ApiError(400, "Event end date must be after start date");
    }
  }

  static async validateEventInput(
    input: CreateEventInput,
    startDateTime: Date
  ) {
    // Validate scheduled event
    if (input.visibility === "Schedule" && !input.publishDateTime) {
      throw new ApiError(400, "Publish date is required for scheduled events");
    }

    // Validate registration requirements
    if (input.registrationRequired && !input.registrationDeadline) {
      throw new ApiError(
        400,
        "Registration deadline is required when registration is enabled"
      );
    }

    // Validate registration deadline
    if (
      input.registrationDeadline &&
      input.registrationDeadline >= startDateTime
    ) {
      throw new ApiError(
        400,
        "Registration deadline must be before the event start date and time"
      );
    }

    // Validate paid event
    if (input.paidEvent) {
      if (!input.ticketPrice || input.ticketPrice <= 0) {
        throw new ApiError(
          400,
          "Valid ticket price is required for paid events"
        );
      }
    }
  }
}
