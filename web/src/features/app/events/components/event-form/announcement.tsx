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

interface AnnouncementProps {
  form: UseFormReturn<EventFormData>;
}

export const Announcement = ({ form }: AnnouncementProps) => {
  const isAnnouncementEnabled = form.watch("isAnnouncementEnabled");

  return (
    <div className="space-y-4">
      <h3 className="h6-semibold">Announcement</h3>

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
                      className="rounded-full absolute right-2 bottom-2"
                    >
                      Generate
                      <Sparkles className="h-4 w-4" />
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
