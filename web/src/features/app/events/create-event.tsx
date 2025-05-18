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

  const onSubmit = async (data: EventFormData) => {
    if (data.formStep === totalSteps) {
      console.log("Final form data:", data);
    } else {
      form.setValue("formStep", data.formStep + 1);
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
                onClick={() => console.log("Save as draft")}
              >
                Save as Draft
              </Button>
              <Button type="submit">
                {step === totalSteps ? "Publish Event" : "Next"}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};
