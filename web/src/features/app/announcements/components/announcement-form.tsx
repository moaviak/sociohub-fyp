import { Announcement } from "@/types";
import { useForm } from "react-hook-form";
import { AnnouncementData, AnnouncementSchema } from "../schema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { DateTimePicker } from "@/components/date-time-picker";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import {
  useCreateAnnouncementMutation,
  useUpdateAnnouncementMutation,
} from "../api";
import ApiError from "@/features/api-error";
import { toast } from "sonner";
import { useNavigate } from "react-router";

interface AnnouncementFormProps {
  announcement?: Announcement;
  societyId: string;
}

export const AnnouncementForm = ({
  announcement,
  societyId,
}: AnnouncementFormProps) => {
  const navigate = useNavigate();
  const [createAnnouncement, { isLoading }] = useCreateAnnouncementMutation();
  const [updateAnnouncement, { isLoading: isUpdating }] =
    useUpdateAnnouncementMutation();

  const form = useForm<AnnouncementData>({
    resolver: zodResolver(AnnouncementSchema),
    defaultValues: {
      title: announcement?.title ?? "",
      content: announcement?.content ?? "",
      publishNow: !announcement?.publishDateTime || true,
      publishDateTime: announcement?.publishDateTime
        ? new Date(announcement.publishDateTime)
        : undefined,
      audience: announcement?.audience,
      sendEmail: announcement?.sendEmail || false,
    },
  });

  const publishNow = form.watch("publishNow");

  const onSubmit = async (data: AnnouncementData) => {
    const body = {
      societyId,
      title: data.title,
      content: data.content,
      audience: data.audience,
      publishDateTime: data.publishDateTime,
      sendEmail: data.sendEmail,
    };
    if (!announcement) {
      try {
        const response = await createAnnouncement(body).unwrap();

        if (!("error" in response)) {
          toast.success("Successfully created announcement.");
          navigate(-1);
        } else {
          throw new Error(response.errorMessage);
        }
      } catch (error) {
        const apiError = error as ApiError;
        if (apiError.errorMessage) {
          toast.error(apiError.errorMessage);
        } else {
          toast.error("Unexpected error occurred while creating announcement.");
        }
      }
    } else {
      try {
        const response = await updateAnnouncement({
          announcementId: announcement.id,
          ...body,
        }).unwrap();

        if (!("error" in response)) {
          toast.success("Successfully updated announcement.");
          navigate(-1);
        } else {
          throw new Error(response.errorMessage);
        }
      } catch (error) {
        const apiError = error as ApiError;
        if (apiError.errorMessage) {
          toast.error(apiError.errorMessage);
        } else {
          toast.error("Unexpected error occurred while creating announcement.");
        }
      }
    }
  };

  return (
    <div className="w-2xl mx-auto p-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Announcement Title <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Hackathon Submission Deadline Extended"
                    className="outline-1 outline-neutral-400"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Announcement Content</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Write announcement to make."
                    className="min-h-30 resize-none outline-neutral-400 outline"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="publishNow"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-md outline outline-neutral-300 p-3">
                <div className="space-y-0.5">
                  <FormLabel>Publish Immediately?</FormLabel>
                  <FormDescription>
                    Enable this option to publish the announcement immediately.
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

          {!publishNow && (
            <FormField
              control={form.control}
              name="publishDateTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Publish Date & Time <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <DateTimePicker
                      value={field.value}
                      onChange={field.onChange}
                      disabled={(date) => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        return date < today;
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="audience"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Audience</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex gap-x-8 mt-2"
                  >
                    <FormItem className="flex items-center gap-x-2 space-y-0">
                      <FormControl>
                        <RadioGroupItem
                          className="cursor-pointer"
                          value="All"
                        />
                      </FormControl>
                      <FormLabel className="font-normal">
                        All Students
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center gap-x-2 space-y-0">
                      <FormControl>
                        <RadioGroupItem
                          className="cursor-pointer"
                          value="Members"
                        />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Society Members Only
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sendEmail"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-md outline outline-neutral-300 p-3">
                <div className="space-y-0.5">
                  <FormLabel>Send Email?</FormLabel>
                  <FormDescription>
                    Enable this option to send an email notification to your
                    audience.
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

          <div className="flex justify-end gap-3 my-6">
            <Button
              type="button"
              variant="outline"
              disabled={isLoading || isUpdating}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || isUpdating}>
              Publish
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
