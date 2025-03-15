import { z } from "zod";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { DEGREES } from "@/data";
import { signInSchema } from "@/schema";
import ApiError from "@/features/api-error";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { getYearOptions } from "@/lib/utils";

import { AuthResponse } from "../types";
import { useLoginMutation } from "../api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SignIn = () => {
  const navigate = useNavigate();
  const yearOptions = getYearOptions();

  const [showPassword, setShowPassword] = useState(false);

  const [login, { isLoading, error, isError }] = useLoginMutation();

  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      userType: "Advisor",
      email: "",
      registrationNo: {
        session: "SP",
        year: yearOptions[yearOptions.length - 1],
        degree: DEGREES[0].value,
        rollNumber: undefined,
      },
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (values: z.infer<typeof signInSchema>) => {
    const formattedRegistrationNumber = values.registrationNo?.rollNumber
      ? `${values.registrationNo?.session}${values.registrationNo?.year}-${values.registrationNo?.degree}-${values.registrationNo?.rollNumber}`
      : undefined;

    const response = await login({
      email: values.email || undefined,
      registrationNumber: formattedRegistrationNumber,
      password: values.password,
    });

    if (!response.error) {
      const data = response.data as AuthResponse;
      if (!data.user.isEmailVerified) {
        navigate("/sign-up/verify-email");
        sessionStorage.setItem("verificationEmail", data.user.email);
      } else {
        navigate("/dashboard");
      }
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <Tabs
          defaultValue="Advisor"
          className="space-y-4"
          onValueChange={(value) => {
            form.setValue("userType", value as "Advisor" | "Student");
          }}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="Advisor">Advisor</TabsTrigger>
            <TabsTrigger value="Student">Student</TabsTrigger>
          </TabsList>
          <TabsContent value="Advisor">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="john@example.com"
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value || "")}
                      className="outline-1 outline-neutral-300"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>
          <TabsContent value="Student">
            <div className="space-y-2">
              <FormLabel>Registration No.</FormLabel>
              <div className="grid grid-cols-4 gap-2">
                <FormField
                  control={form.control}
                  name="registrationNo.session"
                  render={({ field }) => (
                    <FormItem>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="outline-1 outline-neutral-300">
                            <SelectValue defaultValue={field.value} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="SP">SP</SelectItem>
                          <SelectItem value="FA">FA</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="registrationNo.year"
                  render={({ field }) => (
                    <FormItem>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="outline-1 outline-neutral-300">
                            <SelectValue defaultValue={field.value} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {yearOptions.map((year) => (
                            <SelectItem key={year} value={year}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="registrationNo.degree"
                  render={({ field }) => (
                    <FormItem>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="outline-1 outline-neutral-300">
                            <SelectValue defaultValue={field.value} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {DEGREES.map((degree) => (
                            <SelectItem key={degree.value} value={degree.value}>
                              {degree.value}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="registrationNo.rollNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                          className="outline-1 outline-neutral-300"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="b4-medium">Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    className="outline-1 outline-neutral-300 pr-10"
                    placeholder="********"
                    type={showPassword ? "text" : "password"}
                    {...field}
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

        <FormField
          control={form.control}
          name="rememberMe"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-2 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="data-[state=checked]:bg-primary-600 data-[state=checked]:border-primary-600"
                />
              </FormControl>
              <div className="flex items-center justify-between w-full">
                <div className="space-y-1 leading-none">
                  <FormLabel className="b4-medium">Remember me</FormLabel>
                </div>
                <Link
                  to="/forgot-password"
                  className="b4-medium text-neutral-600"
                >
                  Forgot Password?
                </Link>
              </div>
            </FormItem>
          )}
        />

        <div className="space-y-4 pt-4">
          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
export default SignIn;
