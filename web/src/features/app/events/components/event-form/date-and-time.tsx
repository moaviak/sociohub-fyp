import { UseFormReturn } from "react-hook-form";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { DatePicker } from "@/components/date-picker";
import { TimePicker } from "@/components/time-picker";

import { EventFormData } from "../../schema";

interface DateAndTimeProps {
  form: UseFormReturn<EventFormData>;
}

export const DateAndTime = ({ form }: DateAndTimeProps) => {
  const startDate = form.watch("startDate");
  const endDate = form.watch("endDate");
  const startTime = form.watch("startTime");
  const endTime = form.watch("endTime");

  const areDatesValidAndSameDay =
    startDate instanceof Date &&
    !isNaN(startDate.getTime()) &&
    endDate instanceof Date &&
    !isNaN(endDate.getTime()) &&
    startDate.toDateString() === endDate.toDateString();

  const startTimeMin: string | undefined = undefined;
  const startTimeMax: string | undefined =
    areDatesValidAndSameDay && endTime ? endTime : undefined;
  const endTimeMin: string | undefined =
    areDatesValidAndSameDay && startTime ? startTime : undefined;
  const endTimeMax: string | undefined = undefined;

  return (
    <div className="space-y-4">
      <h3 className="h6-semibold">Date & Time</h3>

      <div className="space-y-4">
        {/* Date Pickers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Start Date <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <DatePicker
                    value={field.value}
                    onChange={field.onChange}
                    // Disable dates before today
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
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  End Date <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <DatePicker
                    value={field.value}
                    onChange={field.onChange}
                    // Disable dates before the selected start date
                    disabled={(date) => (startDate ? date < startDate : false)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Time Pickers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Start Time <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <TimePicker
                    value={field.value}
                    onChange={field.onChange}
                    min={startTimeMin} // Use the dynamically calculated min
                    max={startTimeMax} // Use the dynamically calculated max
                    containerClassName="shadow-sm"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  End Time <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <TimePicker
                    value={field.value}
                    onChange={field.onChange}
                    min={endTimeMin} // Use the dynamically calculated min
                    max={endTimeMax} // Use the dynamically calculated max
                    containerClassName="shadow-sm"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
};
