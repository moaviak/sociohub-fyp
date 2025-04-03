import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Society, UserType } from "@/types";
import {
  SocietyRegistrationFormSchema,
  SocietyRegistrationFormValues,
} from "@/schema";
import { useAppSelector } from "@/app/hooks";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import ApiError from "@/features/api-error";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

import { useSendJoinRequestMutation } from "../api";

interface RegistrationFormProps {
  society: Society & { isMember: boolean; hasRequestedToJoin: boolean };
}

export const RegistrationForm = ({ society }: RegistrationFormProps) => {
  const { user, userType } = useAppSelector((state) => state.auth);
  const [isOpen, setIsOpen] = useState(false);

  const [sendJoinRequest, { isLoading, isError, error }] =
    useSendJoinRequestMutation();

  const form = useForm<SocietyRegistrationFormValues>({
    resolver: zodResolver(SocietyRegistrationFormSchema),
    defaultValues: {
      societyId: society.id,
      reason: "",
      expectations: "",
      skills: "",
    },
  });

  const isAgree = form.watch("isAgree");

  const onSubmit = async (values: SocietyRegistrationFormValues) => {
    if (society.isMember || society.hasRequestedToJoin) return;

    const response = await sendJoinRequest(values);

    if (!("error" in response) && response.data) {
      setIsOpen(false);
      toast.success("Request successfully sent.");
    }
  };

  useEffect(() => {
    if (isError) {
      toast.error(
        (error as ApiError)?.errorMessage || "An unexpected error occurred",
        {
          duration: 10000,
        }
      );
    }
  }, [isError, error]);

  if (!user || !userType) {
    return null;
  }

  if (userType === UserType.ADVISOR || !("registrationNumber" in user)) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant={
            society.hasRequestedToJoin || society.isMember
              ? "outline"
              : "default"
          }
          disabled={society.hasRequestedToJoin || society.isMember}
          className="w-full"
        >
          {society.hasRequestedToJoin
            ? "Requested"
            : society.isMember
            ? "Joined"
            : "Join"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl space-y-4 px-8">
        <DialogHeader>
          <DialogTitle className="text-primary-600 h5-semibold">
            Society Registration Form
          </DialogTitle>
          <DialogDescription>
            Please complete the form below to submit your request to join the
            society.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4 py-2">
              <div className="flex gap-2">
                <p className="b3-regular">Society Name</p>
                <p className="b3-semibold">{society.name}</p>
              </div>
              <div className="flex gap-2">
                <p className="b3-regular">Student Name</p>
                <p className="b3-semibold">{`${user.firstName} ${user.lastName}`}</p>
              </div>
              <div className="flex gap-2">
                <p className="b3-regular">Registration #</p>
                <p className="b3-semibold">{user.registrationNumber}</p>
              </div>
              <div className="flex gap-2">
                <p className="b3-regular">Email</p>
                <p className="b3-semibold">{user.email}</p>
              </div>
            </div>

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Reason for joining <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Why do you want to join this society?"
                      className="min-h-20 resize-none outline-neutral-400 outline"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="expectations"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Expectations from the society{" "}
                    <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What do you expect to gain from this society?"
                      className="min-h-20 resize-none outline-neutral-400 outline"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="skills"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Relevant Skills</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Do you have any skills or past experience related to this society?"
                      className="min-h-12 resize-none outline-neutral-400 outline"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isAgree"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="data-[state=checked]:bg-primary-600 data-[state=checked]:border-primary-600"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="b4-regular">
                      I agree to abide by the society’s rules and actively
                      participate in its activities.
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={!isAgree || isLoading}>
                Submit
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
