import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import useGetSocietyId from "@/hooks/useGetSocietyId";
import { useNavigate } from "react-router";
import { BasicInfo } from "./basic-info";
import { DateAndTime } from "./date-and-time";
import { Location } from "./location";
import { Audience } from "./audience";
import { Registration } from "./registration";
import { Announcement } from "./announcement";
import { Event } from "@/types/event";
import { StepIndicator } from "./StepIndicator";
import { useEventFormApi } from "./useEventFormApi";
import { useEventForm } from "./useEventForm";

interface EventFormProps {
  event?: Event;
}

export const EventForm = ({ event }: EventFormProps) => {
  const societyId = useGetSocietyId();
  const navigate = useNavigate();

  const { form, step, totalSteps, prevStep } = useEventForm(event);
  const {
    onSubmit,
    saveDraft,
    LoadingScreen,
    isLoading,
    isDrafting,
    isUpdating,
  } = useEventFormApi(form, event, societyId, navigate);

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return <BasicInfo form={form} banner={event?.banner} />;
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
    <div>
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
                disabled={isLoading || isDrafting || isUpdating}
              >
                Save as Draft
              </Button>
              <Button
                type="submit"
                disabled={isLoading || isDrafting || isUpdating}
              >
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
