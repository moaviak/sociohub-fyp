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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { SocietyRules } from "./society-rules";
import { useSendJoinRequestMutation } from "../api";
import { cn } from "@/lib/utils";

interface RegistrationFormProps {
  society: Society;
  className?: string;
}

export const RegistrationForm = ({
  society,
  className,
}: RegistrationFormProps) => {
  const { user, userType } = useAppSelector((state) => state.auth);
  const [isOpen, setIsOpen] = useState(false);

  const [sendJoinRequest, { isLoading, isError, error }] =
    useSendJoinRequestMutation();

  const form = useForm<SocietyRegistrationFormValues>({
    resolver: zodResolver(SocietyRegistrationFormSchema),
    defaultValues: {
      societyId: society.id,
      whatsappNo: "",
      interestedRole: "",
      reason: "",
      expectations: "",
      skills: "",
    },
  });

  const isAgree = form.watch("isAgree");
  const semester = form.watch("semester");

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
          className={cn(className || "w-full")}
        >
          {society.hasRequestedToJoin
            ? "Requested"
            : society.isMember
            ? "Joined"
            : "Join Society"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl flex flex-col gap-y-4 min-h-0 max-h-[90vh] overflow-hidden">
        <DialogHeader className="px-4">
          <DialogTitle className="text-primary-600 h5-semibold">
            Society Registration Form
          </DialogTitle>
          <DialogDescription>
            Please complete the form below to submit your request to join the
            society.
          </DialogDescription>
        </DialogHeader>
        <div className="overflow-y-auto custom-scrollbar px-4">
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
                name="whatsappNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      WhatsApp Number <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="+92-3xx-xxxxxxx"
                        className="outline-neutral-400 outline"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="semester"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Semester <span className="text-red-500">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(Number(value))}
                      value={field.value?.toString() || ""}
                    >
                      <FormControl>
                        <SelectTrigger className="outline outline-neutral-400">
                          <SelectValue placeholder="Select your semester" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Array.from({ length: 10 }, (_, i) => i + 1).map(
                          (semester) => (
                            <SelectItem
                              key={semester}
                              value={semester.toString()}
                            >
                              {semester}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="interestedRole"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Select role you are interested in{" "}
                      <span className="text-red-500">*</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger
                          disabled={!semester}
                          className="outline outline-neutral-400"
                        >
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {society.roles?.map((role) => {
                          if (
                            !role?.minSemester ||
                            (semester && semester >= role.minSemester)
                          ) {
                            return (
                              <SelectItem key={role.id} value={role.id}>
                                {role.name}
                              </SelectItem>
                            );
                          }
                          return null;
                        })}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
              <SocietyRules form={form} />

              <DialogFooter>
                <Button type="submit" disabled={!isAgree || isLoading}>
                  Submit
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
