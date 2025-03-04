import { z } from "zod";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SOCIETIES_ADVISORS } from "@/data";
import ApiError from "@/features/api-error";
import { Input } from "@/components/ui/input";
import { advisorSignUpSchema } from "@/schema";
import { Button } from "@/components/ui/button";

import { AuthResponse, SocietyAdvisor } from "../../types";
import { useAdvisorSignUpMutation, useGetAdvisorsListQuery } from "../../api";

const AdvisorSignUp = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [advisors, setAdvisors] =
    useState<SocietyAdvisor[]>(SOCIETIES_ADVISORS);

  const { data: advisorList, isSuccess } = useGetAdvisorsListQuery(null);

  const [signUp, { isLoading, isError, error }] = useAdvisorSignUpMutation();

  const form = useForm<z.infer<typeof advisorSignUpSchema>>({
    resolver: zodResolver(advisorSignUpSchema),
    defaultValues: {
      firstName: advisors[0].firstName,
      lastName: advisors[0].lastName,
      displayName: advisors[0].displayName,
      username: "",
      email: advisors[0].email,
      password: "",
    },
  });

  const navigate = useNavigate();

  const onSubmit = async (values: z.infer<typeof advisorSignUpSchema>) => {
    const response = await signUp({
      email: values.email,
      username: values.username,
      password: values.password,
      firstName: values.firstName,
      lastName: values.lastName,
      displayName: values.displayName,
    });

    if (!("error" in response) && response.data) {
      const user = response.data as AuthResponse;
      toast.success("Account created successfully! Please verify your email.");
      navigate(`/sign-up/verify-email`);
      sessionStorage.setItem("verificationEmail", user.user.email);
    }
  };

  useEffect(() => {
    if (isSuccess) setAdvisors(advisorList as SocietyAdvisor[]);
  }, [advisorList, isSuccess]);

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

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-10 w-full"
      >
        <div className="space-y-7">
          <div className="grid grid-cols-2 gap-8">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="John"
                      {...field}
                      className="outline-1 outline-neutral-300"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Doe"
                      {...field}
                      className="outline-1 outline-neutral-300"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-8">
            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="John Doe"
                      {...field}
                      className="outline-1 outline-neutral-300"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="johndoe"
                      {...field}
                      className="outline-1 outline-neutral-300"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-8">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={(email) => {
                        field.onChange(email);
                        const selectedAdvisor = advisors.find(
                          (advisor) => advisor.email === email
                        );
                        if (selectedAdvisor) {
                          form.setValue("firstName", selectedAdvisor.firstName);
                          form.setValue("lastName", selectedAdvisor.lastName);
                          form.setValue(
                            "displayName",
                            selectedAdvisor.displayName
                          );
                        }
                      }}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select an email" />
                      </SelectTrigger>
                      <SelectContent>
                        {advisors.map((advisor) => (
                          <SelectItem
                            key={advisor.email}
                            value={advisor.email}
                            className="b2-regular"
                          >
                            {advisor.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="********"
                        type={showPassword ? "text" : "password"}
                        {...field}
                        className="outline-1 outline-neutral-300"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        {showPassword ? (
                          <Eye className="w-5 h-5 text-neutral-500" />
                        ) : (
                          <EyeOff className="w-5 h-5 text-neutral-500" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        <div className="space-y-4">
          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isLoading}
          >
            {isLoading ? "Creating Account..." : "Sign Up"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default AdvisorSignUp;
