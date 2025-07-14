import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { EventFormData, eventFormSchema } from "../../schema";
import { Event } from "@/types/event";

const TOTAL_STEPS = 6;

export function useEventForm(event?: Event) {
  const now = new Date();
  const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      formStep: event?.formStep || 1,
      isDraft: event?.isDraft || false,
      eventTitle: event?.title || "",
      detailedDescription:
        event?.description ||
        "Provide a comprehensive description of the event, agenda, speakers, etc.",
      startDate: event?.startDate ? new Date(event.startDate) : now,
      endDate: event?.endDate ? new Date(event.endDate) : now,
      startTime: event?.startTime || format(now, "HH:mm"),
      endTime: event?.endTime || format(oneHourLater, "HH:mm"),
      eventType: event?.eventType || "Physical",
      venueName: event?.venueName || "",
      address: event?.venueAddress ?? undefined,
      platform:
        event?.platform &&
        ["Zoom", "Google Meet", "Microsoft Teams", "Other"].includes(
          event.platform
        )
          ? (event.platform as
              | "Zoom"
              | "Google Meet"
              | "Microsoft Teams"
              | "Other")
          : event?.platform
          ? "Other"
          : undefined,
      otherPlatform:
        event?.platform &&
        !["Zoom", "Google Meet", "Microsoft Teams", "Other"].includes(
          event.platform
        )
          ? event.platform
          : undefined,
      meetingLink: event?.meetingLink ?? undefined,
      accessInstructions: event?.accessInstructions ?? undefined,
      audience: event?.audience || "Open",
      visibility: event?.visibility || "Publish",
      publishDateTime: event?.publishDateTime
        ? new Date(event.publishDateTime)
        : undefined,
      isRegistrationRequired: event?.registrationRequired || false,
      registrationDeadline: event?.registrationDeadline
        ? new Date(event.registrationDeadline)
        : undefined,
      maximumParticipants: event?.maxParticipants ?? undefined,
      isPaidEvent: event?.paidEvent || false,
      ticketPrice: event?.ticketPrice ?? undefined,
      isAnnouncementEnabled: event?.announcementEnabled || false,
      announcement: event?.announcement ?? undefined,
      eventCategories: event?.categories || [],
    },
  });

  const step = form.watch("formStep");
  const totalSteps = TOTAL_STEPS;

  const prevStep = () => {
    if (step > 1) {
      form.setValue("formStep", step - 1);
    }
  };

  return { form, step, totalSteps, prevStep };
}
