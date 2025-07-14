import {
  useCreateEventMutation,
  useDraftEventMutation,
  useUpdateEventMutation,
} from "../../api";
import useLoadingOverlay from "@/components/loading-overlay";
import { useEffect } from "react";
import { toast } from "sonner";
import ApiError from "@/features/api-error";
import { format } from "date-fns";
import { EventFormData } from "../../schema";
import { Event } from "@/types/event";
import { UseFormReturn } from "react-hook-form";
import { NavigateFunction } from "react-router";

export function useEventFormApi(
  form: UseFormReturn<EventFormData>,
  event: Event | undefined,
  societyId: string | undefined,
  navigate: NavigateFunction
) {
  const [createEvent, { isError, error, isLoading }] = useCreateEventMutation();
  const [
    updateEvent,
    { isError: isUpdateError, error: updateError, isLoading: isUpdating },
  ] = useUpdateEventMutation();
  const [
    draftEvent,
    { isError: isDraftError, error: draftError, isLoading: isDrafting },
  ] = useDraftEventMutation();

  const { LoadingScreen, showLoading, hideLoading } = useLoadingOverlay(
    isLoading || isUpdating
  );

  useEffect(() => {
    if (isError || isDraftError || isUpdateError) {
      toast.error(
        (error as ApiError)?.errorMessage ||
          (draftError as ApiError)?.errorMessage ||
          (updateError as ApiError)?.errorMessage ||
          "An error occurred while creating the event."
      );
    }
  }, [isError, error, isDraftError, draftError, updateError, isUpdateError]);

  useEffect(() => {
    if (isLoading) {
      showLoading("Creating event...");
    } else if (isUpdating) {
      showLoading("Updating event...");
    } else {
      hideLoading();
    }
  }, [isLoading, isUpdating, showLoading, hideLoading]);

  const onSubmit = async (data: EventFormData) => {
    const totalSteps = 6;
    if (data.formStep === totalSteps) {
      const formData = new FormData();
      if (societyId) formData.append("societyId", societyId);
      if (data.eventTitle) formData.append("title", data.eventTitle);
      if (data.eventTagline) formData.append("tagline", data.eventTagline);
      if (data.detailedDescription)
        formData.append("description", data.detailedDescription);
      if (data.eventCategories && data.eventCategories.length > 0)
        formData.append("categories", JSON.stringify(data.eventCategories));
      if (data.eventImage) formData.append("banner", data.eventImage);
      if (data.startDate)
        formData.append("startDate", format(data.startDate, "yyyy-MM-dd"));
      if (data.endDate)
        formData.append("endDate", format(data.endDate, "yyyy-MM-dd"));
      if (data.startTime) formData.append("startTime", data.startTime);
      if (data.endTime) formData.append("endTime", data.endTime);
      if (data.eventType) formData.append("eventType", data.eventType);
      if (data.venueName) formData.append("venueName", data.venueName);
      if (data.address) formData.append("venueAddress", data.address);
      if (data.platform) formData.append("platform", data.platform);
      if (data.otherPlatform)
        formData.append("otherPlatform", data.otherPlatform);
      if (data.meetingLink) formData.append("meetingLink", data.meetingLink);
      if (data.accessInstructions)
        formData.append("accessInstructions", data.accessInstructions);
      if (data.audience) formData.append("audience", data.audience);
      if (data.visibility) formData.append("visibility", data.visibility);
      if (data.publishDateTime)
        formData.append("publishDateTime", data.publishDateTime.toISOString());
      if (typeof data.isRegistrationRequired !== "undefined")
        formData.append(
          "registrationRequired",
          data.isRegistrationRequired.toString()
        );
      if (data.registrationDeadline)
        formData.append(
          "registrationDeadline",
          data.registrationDeadline.toISOString()
        );
      if (typeof data.isPaidEvent !== "undefined")
        formData.append("paidEvent", data.isPaidEvent.toString());
      if (typeof data.ticketPrice !== "undefined" && data.ticketPrice !== null)
        formData.append("ticketPrice", data.ticketPrice.toString());
      if (typeof data.isAnnouncementEnabled !== "undefined")
        formData.append(
          "announcementEnabled",
          data.isAnnouncementEnabled.toString()
        );
      if (data.announcement) formData.append("announcement", data.announcement);

      if (data.formStep) formData.append("formStep", data.formStep.toString());

      if (event) {
        const response = await updateEvent({ id: event.id, data: formData });
        if (!("error" in response)) {
          toast.success("Event updated.");
          navigate(-1);
        }
      } else {
        const response = await createEvent(formData);
        if (!("error" in response)) {
          toast.success("Event created.");
          navigate(-1);
        }
      }
    } else {
      form.setValue("formStep", data.formStep + 1);
    }
  };

  const saveDraft = async () => {
    const step = form.getValues("formStep");
    const values = form.getValues();
    const schemas = [];
    for (let i = 1; i <= step; i++) {
      switch (i) {
        case 1:
          schemas.push((await import("../../schema")).basicInfoSchemaPartial);
          break;
        case 2:
          schemas.push((await import("../../schema")).dateTimeSchemaPartial);
          break;
        case 3:
          schemas.push((await import("../../schema")).locationSchemaPartial);
          break;
        case 4:
          schemas.push(
            (await import("../../schema")).audienceVisibilitySchemaPartial
          );
          break;
        case 5:
          schemas.push(
            (await import("../../schema")).registrationSchemaPartial
          );
          break;
        case 6:
          schemas.push(
            (await import("../../schema")).announcementSchemaPartial
          );
          break;
      }
    }
    let isValid = true;
    let validatedData = {};
    for (const schema of schemas) {
      const result = schema.safeParse(values);
      if (!result.success) {
        isValid = false;
        break;
      }
      validatedData = { ...validatedData, ...result.data };
    }
    if (!isValid) {
      toast.error(
        "Please fill in all required fields in the current and previous steps before saving as draft."
      );
      return;
    }
    const result = { success: true, data: validatedData };
    if (!result.success) {
      toast.error(
        "Please fill in the required fields for this step before saving as draft."
      );
      return;
    }
    const formData = new FormData();
    if (event?.id) formData.append("eventId", event.id);
    if (societyId) formData.append("societyId", societyId);
    formData.append("isDraft", "true");
    formData.append("formStep", String(step));
    const fieldMap = {
      eventTitle: "title",
      eventTagline: "tagline",
      detailedDescription: "description",
      eventCategories: "categories",
      eventImage: "banner",
      startDate: "startDate",
      endDate: "endDate",
      startTime: "startTime",
      endTime: "endTime",
      eventType: "eventType",
      venueName: "venueName",
      address: "venueAddress",
      platform: "platform",
      otherPlatform: "otherPlatform",
      meetingLink: "meetingLink",
      accessInstructions: "accessInstructions",
      audience: "audience",
      visibility: "visibility",
      publishDateTime: "publishDateTime",
      isRegistrationRequired: "registrationRequired",
      registrationDeadline: "registrationDeadline",
      maximumParticipants: "maximumParticipants",
      isPaidEvent: "paidEvent",
      ticketPrice: "ticketPrice",
      isAnnouncementEnabled: "announcementEnabled",
      announcement: "announcement",
    } as const;
    const data = result.data as Record<string, unknown>;
    for (const key of Object.keys(data)) {
      if (
        data[key] !== undefined &&
        data[key] !== null &&
        !(typeof data[key] === "string" && data[key].trim() === "") &&
        key in fieldMap
      ) {
        const apiKey = fieldMap[key as keyof typeof fieldMap];
        if (key === "eventCategories") {
          if (Array.isArray(data[key]) && data[key].length > 0) {
            formData.append(apiKey, JSON.stringify(data[key]));
          }
        } else if (key === "eventImage") {
          formData.append(apiKey, data[key] as Blob);
        } else if (key === "startDate" || key === "endDate") {
          formData.append(
            apiKey,
            data[key] instanceof Date
              ? format(data[key] as Date, "yyyy-MM-dd")
              : String(data[key])
          );
        } else if (
          key === "publishDateTime" ||
          key === "registrationDeadline"
        ) {
          formData.append(
            apiKey,
            data[key] instanceof Date
              ? (data[key] as Date).toISOString()
              : String(data[key])
          );
        } else {
          formData.append(apiKey, String(data[key]));
        }
      }
    }
    const response = await draftEvent(formData);
    if (!("error" in response)) {
      toast.success("Draft saved.");
      navigate(-1);
    }
  };

  return {
    onSubmit,
    saveDraft,
    LoadingScreen,
    isLoading,
    isDrafting,
    isUpdating,
  };
}
