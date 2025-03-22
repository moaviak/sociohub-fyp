import { z } from "zod";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { Camera, Eye, EyeOff } from "lucide-react";
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
import { Advisor } from "@/types";
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
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const { data: advisorList, isSuccess } = useGetAdvisorsListQuery(null);

  const [signUp, { isLoading, isError, error }] = useAdvisorSignUpMutation();

  const form = useForm<z.infer<typeof advisorSignUpSchema>>({
    resolver: zodResolver(advisorSignUpSchema),
    defaultValues: {
      firstName: advisors[0].firstName,
      lastName: advisors[0].lastName,
      displayName: advisors[0].displayName,
      email: advisors[0].email,
      password: "",
    },
  });

  const navigate = useNavigate();

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue("avatar", file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (values: z.infer<typeof advisorSignUpSchema>) => {
    const formData = new FormData();
    formData.append("email", values.email);
    formData.append("password", values.password);
    formData.append("firstName", values.firstName);
    formData.append("lastName", values.lastName);
    formData.append("displayName", values.displayName);
    formData.append("avatar", values.avatar || "");
    formData.append("phone", values.phone || "");

    const response = await signUp(formData);

    if (!("error" in response) && response.data) {
      const user = (response.data as AuthResponse).user as Advisor;
      toast.success("Account created successfully! Please verify your email.");
      navigate(`/sign-up/verify-email`);
      sessionStorage.setItem("societyName", user.societyName || "");
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
          <div className="grid grid-cols-2 gap-8 items-center">
            <div className="flex items-center gap-x-6">
              <div className="relative w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mb-2">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Logo preview"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="text-gray-400 flex flex-col items-center justify-center">
                    <img
                      src="/assets/images/placeholder.png"
                      alt="Placeholder"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <label
                  htmlFor="logo-upload"
                  className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-1 cursor-pointer"
                >
                  <Camera className="h-5 w-5 text-white" />
                </label>
                <input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>
              <div className="flex flex-col items-center">
                <p className="b1-medium">Profile Picture</p>
                <p className="b3-regular">Upload your profile picture.</p>
              </div>
            </div>
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
          </div>
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
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone #</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="057xxxxxxx"
                      {...field}
                      className="outline-1 outline-neutral-300"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div>
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
