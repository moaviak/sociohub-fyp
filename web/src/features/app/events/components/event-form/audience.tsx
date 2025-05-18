import { UseFormReturn } from "react-hook-form";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { EventFormData } from "../../schema";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { DateTimePicker } from "@/components/date-time-picker";

interface AudienceProps {
  form: UseFormReturn<EventFormData>;
}

export const Audience = ({ form }: AudienceProps) => {
  const visibility = form.watch("visibility");

  return (
    <div className="space-y-4">
      <h3 className="h6-semibold">Audience & Visibility</h3>

      <div className="space-y-4">
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
                      <RadioGroupItem className="cursor-pointer" value="Open" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Open to Public (University-wide)
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
                  <FormItem className="flex items-center gap-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem
                        className="cursor-pointer"
                        value="Invite"
                      />
                    </FormControl>
                    <FormLabel className="font-normal">Invite Only</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="visibility"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Visibility</FormLabel>
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
                        value="Publish"
                      />
                    </FormControl>
                    <FormLabel className="font-normal">Publish Now</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center gap-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem
                        className="cursor-pointer"
                        value="Draft"
                      />
                    </FormControl>
                    <FormLabel className="font-normal">Save as Draft</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center gap-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem
                        className="cursor-pointer"
                        value="Schedule"
                      />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Schedule Publish Date
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {visibility === "Schedule" && (
          <FormField
            control={form.control}
            name="publishDateTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Publish Date <span className="text-red-500">*</span>
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
      </div>
    </div>
  );
};
