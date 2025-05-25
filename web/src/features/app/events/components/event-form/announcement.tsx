import { UseFormReturn } from "react-hook-form";
import { EventFormData } from "../../schema";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { useGenerateAnnouncementMutation } from "../../api";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { SpinnerLoader } from "@/components/spinner-loader";
import { format } from "date-fns";
import { ReviewSection } from "./review-section";

interface AnnouncementProps {
  form: UseFormReturn<EventFormData>;
}

export const Announcement = ({ form }: AnnouncementProps) => {
  const isAnnouncementEnabled = form.watch("isAnnouncementEnabled");
  const [isTyping, setIsTyping] = useState(false);

  const [generateAnnouncement, { isLoading, isError }] =
    useGenerateAnnouncementMutation();

  useEffect(() => {
    if (isError) {
      toast.error("Error generating announcement message. Please try again.");
    }
  }, [isError]);

  const typeText = async (text: string, speed = 10) => {
    setIsTyping(true);
    let currentText = "";

    for (let i = 0; i < text.length; i++) {
      currentText += text[i];
      form.setValue("announcement", currentText);
      await new Promise((resolve) => setTimeout(resolve, speed));
    }

    setIsTyping(false);
  };

  const handleClick = async () => {
    const response = await generateAnnouncement({
      title: form.getValues("eventTitle"),
      description: form.getValues("detailedDescription"),
      audience: form.getValues("audience"),
      categories: form.getValues("eventCategories"),
      endDate: format(form.getValues("endDate"), "yyyy-MM-dd"),
      endTime: form.getValues("endTime"),
      eventType: form.getValues("eventType"),
      maxParticipants: form.getValues("maximumParticipants"),
      paidEvent: form.getValues("isPaidEvent"),
      startDate: format(form.getValues("startDate"), "yyyy-MM-dd"),
      startTime: form.getValues("startTime"),
      platform:
        form.getValues("platform") === "Other"
          ? form.getValues("otherPlatform")
          : form.getValues("platform"),
      registrationDeadline: form.getValues("registrationDeadline"),
      registrationRequired: form.getValues("isRegistrationRequired"),
      tagline: form.getValues("eventTagline"),
      ticketPrice: form.getValues("ticketPrice"),
      venueAddress: form.getValues("address"),
      venueName: form.getValues("venueName"),
    });

    if (!("error" in response) && typeof response.data === "string") {
      await typeText(response.data);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="h6-semibold">Review & Announcement</h3>
      <ReviewSection form={form} />
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="isAnnouncementEnabled"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-md outline outline-neutral-300 p-3">
              <div className="space-y-0.5">
                <FormLabel>
                  Do you want to make an Announcement for this Event?
                </FormLabel>
                <FormDescription>
                  Enable this option if you want to make an announcement for
                  this event. This will be visible to all the audience.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="cursor-pointer"
                />
              </FormControl>
            </FormItem>
          )}
        />

        {isAnnouncementEnabled && (
          <FormField
            control={form.control}
            name="announcement"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Announcement</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Textarea
                      placeholder="Write announcement to make or leverage AI to create engaging promotional announcement for your event."
                      className="min-h-30 resize-none outline-neutral-400 outline"
                      {...field}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full absolute right-2 bottom-2 bg-transparent"
                      onClick={handleClick}
                      disabled={isLoading || isTyping}
                    >
                      Generate
                      {isLoading ? (
                        <SpinnerLoader size="xs" />
                      ) : (
                        <Sparkles className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </div>
    </div>
  );
};
