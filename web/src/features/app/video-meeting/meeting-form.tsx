import { useForm } from "react-hook-form";
import { CreateMeetingData, createMeetingSchema } from "./schema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DateTimePicker } from "@/components/date-time-picker";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { FlyoutSearch } from "./components/flyout-search";
import { InvitedMembersChips } from "./components/invited-members-chips";
import { useState } from "react";
import useGetSocietyId from "@/hooks/useGetSocietyId";
import { useCreateMeetingMutation } from "./api";
import { toast } from "sonner";
import ApiError from "@/features/api-error";
import { Meeting } from "@/types";

// Add CheckedUser type
export type CheckedUser = {
  id: string;
  firstName: string;
  lastName: string;
  avatar?: string;
};

interface MeetingFormProps {
  meeting?: Meeting;
  onSuccess?: () => void;
}

export const MeetingForm: React.FC<MeetingFormProps> = ({ onSuccess }) => {
  const societyId = useGetSocietyId();
  const form = useForm<CreateMeetingData>({
    resolver: zodResolver(createMeetingSchema),
  });

  const [createMeeting, { isLoading }] = useCreateMeetingMutation();

  const [checkedUsers, setCheckedUsers] = useState<CheckedUser[]>([]);

  const audience = form.watch("audienceType");

  const onSubmit = async (data: CreateMeetingData) => {
    const invitedUserIds = checkedUsers.map((u) => u.id);
    const payload = {
      ...data,
      scheduledAt: data.startTime,
      societyId: societyId || "",
      invitedUserIds,
    };

    try {
      const response = await createMeeting(payload);

      if (!("error" in response)) {
        toast.success("Meeting created successfully");
        if (onSuccess) onSuccess();
      } else {
        throw response.error;
      }
    } catch (error) {
      const message =
        (error as ApiError).errorMessage || "Something went wrong";
      toast.error(message);
    }
  };

  return (
    <div>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
        <Form {...form}>
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Title <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    className="outline outline-neutral-400"
                    placeholder="Robotics Project Discussion"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    className="resize-none min-h-20 outline outline-neutral-400"
                    placeholder="Enter a brief description of the meeting"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="startTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Start Time <span className="text-red-500">*</span>
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

          <FormField
            control={form.control}
            name="audienceType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Audience <span className="text-red-500">*</span>
                </FormLabel>
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
                          value="ALL_SOCIETY_MEMBERS"
                        />
                      </FormControl>
                      <FormLabel className="font-normal">
                        All Society Members
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center gap-x-2 space-y-0">
                      <FormControl>
                        <RadioGroupItem
                          className="cursor-pointer"
                          value="SPECIFIC_MEMBERS"
                        />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Invited Members
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {audience === "SPECIFIC_MEMBERS" && (
            <div>
              <InvitedMembersChips
                checkedUsers={checkedUsers}
                setCheckedUsers={setCheckedUsers}
              />
              <FlyoutSearch
                checkedUsers={checkedUsers}
                setCheckedUsers={setCheckedUsers}
              />
            </div>
          )}

          <div className="mt-4 float-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create"}
            </Button>
          </div>
        </Form>
      </form>
    </div>
  );
};
