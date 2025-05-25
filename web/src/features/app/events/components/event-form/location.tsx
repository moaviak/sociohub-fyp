import { UseFormReturn } from "react-hook-form";

import { EventFormData } from "../../schema";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect } from "react";

interface LocationProps {
  form: UseFormReturn<EventFormData>;
}

export const Location = ({ form }: LocationProps) => {
  const eventType = form.watch("eventType");
  const platform = form.watch("platform");

  useEffect(() => {
    if (eventType === "Physical") {
      // Clear online fields
      form.resetField("platform");
      form.resetField("otherPlatform");
      form.resetField("meetingLink");
      form.resetField("accessInstructions");
      form.clearErrors([
        "platform",
        "otherPlatform",
        "meetingLink",
        "accessInstructions",
      ]);
    } else {
      // Clear physical fields
      form.resetField("venueName");
      form.resetField("address");
      form.clearErrors(["venueName", "address"]);
    }
  }, [eventType, form]);

  return (
    <div className="space-y-4">
      <h3 className="h6-semibold">Location</h3>

      <div className="space-y-4">
        <FormField
          control={form.control}
          name="eventType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Type</FormLabel>
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
                        value="Physical"
                      />
                    </FormControl>
                    <FormLabel className="font-normal">Physical</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center gap-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem
                        className="cursor-pointer"
                        value="Online"
                      />
                    </FormControl>
                    <FormLabel className="font-normal">Online</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {eventType === "Physical" ? (
          <>
            <FormField
              control={form.control}
              name="venueName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Venue Name <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Seminar Hall, EE Department"
                      className="outline-1 outline-neutral-400"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="COMSATS University Islamabad, Attock Campus"
                      className="min-h-16 resize-none outline-neutral-400 outline"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        ) : (
          <>
            <FormField
              control={form.control}
              name="platform"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Platform</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="outline-1 outline-neutral-400">
                          <SelectValue placeholder="Selects a platform" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Zoom">Zoom</SelectItem>
                        <SelectItem value="Google Meet">Google Meet</SelectItem>
                        <SelectItem value="Microsoft Teams">
                          Microsoft Teams
                        </SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {platform === "Other" && (
              <FormField
                control={form.control}
                name="otherPlatform"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Platform Name <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Specify the platform name"
                        className="outline-1 outline-neutral-400"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="meetingLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Meeting Link <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Meeting link for the event"
                      className="outline-1 outline-neutral-400"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="accessInstructions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Access Instructions</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any specific instructions for joining the online event."
                      className="min-h-16 resize-none outline-neutral-400 outline"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}
      </div>
    </div>
  );
};
