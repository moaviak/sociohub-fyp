import { Button } from "@/components/ui/button";

import {
  Announcement,
  Audience,
  BasicInfo,
  DateAndTime,
  Location,
  Registration,
} from "./components/event-form";
import { useForm } from "react-hook-form";
import { EventFormData, eventFormSchema } from "./schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { format } from "date-fns";
import { useCreateEventMutation, useDraftEventMutation } from "./api";
import { useEffect } from "react";
import { toast } from "sonner";
import ApiError from "@/features/api-error";
import useGetSocietyId from "@/hooks/useGetSocietyId";
import useLoadingOverlay from "@/components/loading-overlay";
import { useNavigate } from "react-router";

// Step indicator component
const StepIndicator = ({
  currentStep,
  totalSteps,
}: {
  currentStep: number;
  totalSteps: number;
}) => {
  return (
    <div className="w-full flex items-center">
      {Array.from({ length: totalSteps }, (_, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        const isCompleted = stepNumber < currentStep;

        return (
          <div
            key={stepNumber}
            className="flex items-center flex-1 last:flex-none"
          >
            {/* Step circle */}
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full ${
                isActive || isCompleted
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-600"
              } shrink-0`}
            >
              {stepNumber}
            </div>

            {/* Connector line */}
            {stepNumber < totalSteps && (
              <div className="h-1 bg-gray-200 flex-1 mx-2 relative rounded-lg">
                <div
                  className="h-1 bg-blue-600 absolute left-0 top-0 rounded-md"
                  style={{
                    width: isCompleted ? "100%" : isActive ? "50%" : "0%",
                  }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export const CreateEvent = () => {
  const societyId = useGetSocietyId();
  const navigate = useNavigate();

  const now = new Date();
  const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      formStep: 1,
      isDraft: false,
      eventTitle: "",
      detailedDescription:
        "Provide a comprehensive description of the event, agenda, speakers, etc.",
      startDate: now,
      endDate: now,
      startTime: format(now, "HH:mm"),
      endTime: format(oneHourLater, "HH:mm"),
      eventType: "Physical",
      venueName: "",
      audience: "Open",
      visibility: "Publish",
      isRegistrationRequired: false,
      isPaidEvent: false,
      isAnnouncementEnabled: false,
    },
  });

  const [createEvent, { isError, error, isLoading }] = useCreateEventMutation();
  const [
    draftEvent,
    { isError: isDraftError, error: draftError, isLoading: isDrafting },
  ] = useDraftEventMutation();

  const { LoadingScreen, showLoading, hideLoading } =
    useLoadingOverlay(isLoading);

  useEffect(() => {
    if (isError || isDraftError) {
      toast.error(
        (error as ApiError)?.errorMessage ||
          (draftError as ApiError)?.errorMessage ||
          "An error occurred while creating the event."
      );
    }
  }, [isError, error, isDraftError, draftError]);

  useEffect(() => {
    if (isLoading) {
      showLoading("Creating event...");
    } else {
      hideLoading();
    }
  }, [isLoading, showLoading, hideLoading]);

  const onSubmit = async (data: EventFormData) => {
    if (data.formStep === totalSteps) {
      console.log("Final form data:", data);
      const formData = new FormData();
      formData.append("societyId", societyId || "");

      formData.append("title", data.eventTitle);
      formData.append("tagline", data.eventTagline || "");
      formData.append("description", data.detailedDescription || "");
      formData.append("categories", JSON.stringify(data.eventCategories || []));
      formData.append("banner", data.eventImage || "");

      formData.append("startDate", format(data.startDate, "yyyy-MM-dd"));
      formData.append("endDate", format(data.endDate, "yyyy-MM-dd"));
      formData.append("startTime", data.startTime);
      formData.append("endTime", data.endTime);

      formData.append("eventType", data.eventType);
      formData.append("venueName", data.venueName || "");
      formData.append("venueAddress", data.address || "");
      formData.append("platform", data.platform || "");
      formData.append("otherPlatform", data.otherPlatform || "");
      formData.append("meetingLink", data.meetingLink || "");
      formData.append("accessInstructions", data.accessInstructions || "");

      formData.append("audience", data.audience);
      formData.append("visibility", data.visibility);
      formData.append(
        "publishDateTime",
        data.publishDateTime?.toISOString() || ""
      );

      formData.append(
        "registrationRequired",
        data.isRegistrationRequired.toString()
      );
      formData.append(
        "registrationDeadline",
        data.registrationDeadline?.toISOString() || ""
      );
      formData.append("paidEvent", data.isPaidEvent?.toString() || "");
      formData.append("ticketPrice", data.ticketPrice?.toString() || "");
      formData.append(
        "paymentMethods",
        JSON.stringify(data.paymentGateways || [])
      );

      formData.append(
        "announcementEnabled",
        data.isAnnouncementEnabled.toString()
      );
      formData.append("announcement", data.announcement || "");

      const response = await createEvent(formData);

      if (!("error" in response)) {
        toast.success("Event created.");
        navigate(-1);
      }
    } else {
      form.setValue("formStep", data.formStep + 1);
    }
  };

  const saveDraft = async () => {
    const step = form.getValues("formStep");
    const values = form.getValues();
    let partialSchema;

    switch (step) {
      case 1:
        partialSchema = (await import("./schema")).basicInfoSchemaPartial;
        break;
      case 2:
        partialSchema = (await import("./schema")).dateTimeSchemaPartial;
        break;
      case 3:
        partialSchema = (await import("./schema")).locationSchemaPartial;
        break;
      case 4:
        partialSchema = (await import("./schema"))
          .audienceVisibilitySchemaPartial;
        break;
      case 5:
        partialSchema = (await import("./schema")).registrationSchemaPartial;
        break;
      case 6:
        partialSchema = (await import("./schema")).announcementSchemaPartial;
        break;
      default:
        partialSchema = (await import("./schema")).basicInfoSchemaPartial;
    }

    const result = partialSchema.safeParse(values);
    if (!result.success) {
      toast.error(
        "Please fill in the required fields for this step before saving as draft."
      );
      return;
    }

    const formData = new FormData();
    formData.append("societyId", societyId || "");
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
      paymentGateways: "paymentMethods",
      isAnnouncementEnabled: "announcementEnabled",
      announcement: "announcement",
    } as const;

    const data = result.data as Record<string, unknown>;
    for (const key of Object.keys(data)) {
      if (data[key] !== undefined && data[key] !== null && key in fieldMap) {
        const apiKey = fieldMap[key as keyof typeof fieldMap];
        if (key === "eventCategories" || key === "paymentGateways") {
          formData.append(apiKey, JSON.stringify(data[key]));
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

  const step = form.watch("formStep");
  const totalSteps = 6;

  const prevStep = () => {
    if (step > 1) {
      form.setValue("formStep", step - 1);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return <BasicInfo form={form} />;
      case 2:
        return <DateAndTime form={form} />;
      case 3:
        return <Location form={form} />;
      case 4:
        return <Audience form={form} />;
      case 5:
        return <Registration form={form} />;
      case 6:
        return <Announcement form={form} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col gap-y-6 h-full">
      <div>
        <h4 className="h4-semibold">Create New Event</h4>
        <p className="b3-regular">
          Fill in the details to organize your society's next activity.
        </p>
      </div>

      {/* Step indicator */}
      <StepIndicator currentStep={step} totalSteps={totalSteps} />

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex-1 flex flex-col"
        >
          {/* Step content */}
          <div className="py-2 px-4 flex-1">{renderStepContent()}</div>

          {/* Navigation buttons */}
          <div className="flex justify-between my-6">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={step === 1}
            >
              Back
            </Button>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={saveDraft}
                disabled={isLoading || isDrafting}
              >
                Save as Draft
              </Button>
              <Button type="submit" disabled={isLoading || isDrafting}>
                {step === totalSteps ? "Publish Event" : "Next"}
              </Button>
            </div>
          </div>
        </form>
      </Form>

      <LoadingScreen />
    </div>
  );
};
