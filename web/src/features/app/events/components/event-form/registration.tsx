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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { usePaymentGuard } from "@/hooks/usePaymentGuard";

interface RegistrationProps {
  form: UseFormReturn<EventFormData>;
  societyId: string;
}

export const Registration = ({ form, societyId }: RegistrationProps) => {
  const {
    canCreatePaidEvents,
    isLoading,
    isOnboardingPending,
    needsOnboarding,
  } = usePaymentGuard(societyId);

  const isRegistrationRequired = form.watch("isRegistrationRequired");
  const isPaidEvent = form.watch("isPaidEvent");

  return (
    <div className="space-y-4">
      <h3 className="h6-semibold">Registration & Tickets</h3>

      <div className="space-y-4">
        {isLoading ? null : needsOnboarding ? (
          <Alert>
            <AlertCircle className="h-4 w-4 text-red-600!" />
            <AlertTitle className="text-red-600">
              Payment setup is required
            </AlertTitle>
            <AlertDescription className="text-red-600">
              You can't publish paid events until you create your payment
              account.
            </AlertDescription>
          </Alert>
        ) : isOnboardingPending ? (
          <Alert>
            <AlertCircle className="h-4 w-4 text-yellow-600!" />
            <AlertTitle className="text-yellow-600">
              Your payment account is being reviewed.
            </AlertTitle>
            <AlertDescription className="text-yellow-600">
              You can't publish paid events until your payment account is
              verified and active.
            </AlertDescription>
          </Alert>
        ) : null}
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

            {canCreatePaidEvents && (
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
            )}

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
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
