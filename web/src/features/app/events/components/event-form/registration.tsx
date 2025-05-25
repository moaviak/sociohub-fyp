import { UseFormReturn } from "react-hook-form";

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { EventFormData } from "../../schema";
import { Switch } from "@/components/ui/switch";
import { DateTimePicker } from "@/components/date-time-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface RegistrationProps {
  form: UseFormReturn<EventFormData>;
}

export const Registration = ({ form }: RegistrationProps) => {
  const isRegistrationRequired = form.watch("isRegistrationRequired");
  const isPaidEvent = form.watch("isPaidEvent");

  console.log(form.formState.errors);

  return (
    <div className="space-y-4">
      <h3 className="h6-semibold">Registration & Tickets</h3>

      <div className="space-y-4">
        <FormField
          control={form.control}
          name="isRegistrationRequired"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-md outline outline-neutral-300 p-3">
              <div className="space-y-0.5">
                <FormLabel>Is Registration Required?</FormLabel>
                <FormDescription>
                  Enable this option if you want to require registration for
                  this event.
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

        {isRegistrationRequired && (
          <>
            <FormField
              control={form.control}
              name="registrationDeadline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Registration Deadline{" "}
                    <span className="text-red-500">*</span>
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
              name="maximumParticipants"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maximum Participants</FormLabel>
                  <FormControl>
                    <Input
                      value={field.value}
                      onChange={(e) => {
                        if (e.target.value === "") {
                          field.onChange(undefined);
                        } else {
                          field.onChange(parseInt(e.target.value));
                        }
                      }}
                      className="outline outline-neutral-400"
                      placeholder="Leave blank for unlimited participants"
                      type="number"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isPaidEvent"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-md outline outline-neutral-300 p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Is this a Paid Event?</FormLabel>
                    <FormDescription>
                      Enable this option if you want to charge a fee for
                      registration.
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

            {isPaidEvent && (
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="ticketPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Ticket Price <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600 b3-regular">
                            PKR
                          </span>
                          <Input
                            value={field.value}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value))
                            }
                            className="outline outline-neutral-400 pl-14"
                            placeholder="Enter ticket price"
                            type="number"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="paymentGateways"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Payment Methods <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="flex flex-wrap flex-1 p-2 gap-4">
                          <div className="flex items-center justify-center gap-2">
                            <Checkbox
                              checked={field.value?.includes("CreditCard")}
                              onCheckedChange={(checked) => {
                                const currentValue = field.value || [];
                                if (checked) {
                                  field.onChange([
                                    ...currentValue,
                                    "CreditCard",
                                  ]);
                                } else {
                                  field.onChange(
                                    currentValue.filter(
                                      (value) => value !== "CreditCard"
                                    )
                                  );
                                }
                              }}
                              className="data-[state=checked]:bg-primary-600 data-[state=checked]:border-primary-600"
                              id={"CreditCard"}
                            />
                            <Label
                              className="b3-medium leading-none"
                              htmlFor={"CreditCard"}
                            >
                              Credit Card
                            </Label>
                          </div>
                          <div className="flex items-center justify-center gap-2">
                            <Checkbox
                              checked={field.value?.includes("Easypaisa")}
                              onCheckedChange={(checked) => {
                                const currentValue = field.value || [];
                                if (checked) {
                                  field.onChange([
                                    ...currentValue,
                                    "Easypaisa",
                                  ]);
                                } else {
                                  field.onChange(
                                    currentValue.filter(
                                      (value) => value !== "Easypaisa"
                                    )
                                  );
                                }
                              }}
                              className="data-[state=checked]:bg-primary-600 data-[state=checked]:border-primary-600"
                              id={"Easypaisa"}
                            />
                            <Label
                              className="b3-medium leading-none"
                              htmlFor={"Easypaisa"}
                            >
                              Easypaisa
                            </Label>
                          </div>
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
