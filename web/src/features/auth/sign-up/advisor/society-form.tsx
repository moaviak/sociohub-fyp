import { toast } from "sonner";
import { Camera } from "lucide-react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
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
import ApiError from "@/features/api-error";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { societyFormSchema, SocietyFormValues } from "@/schema";

import { useCreateSocietyMutation } from "../../api";

export const SocietyForm = () => {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const navigate = useNavigate();

  const [createSociety, { isError, isLoading, error }] =
    useCreateSocietyMutation();

  const societyName = sessionStorage.getItem("societyName");

  const form = useForm<SocietyFormValues>({
    resolver: zodResolver(societyFormSchema),
    defaultValues: {
      name: societyName || "",
      description: "",
    },
  });

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue("logo", file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: SocietyFormValues) => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("description", data.description);
    formData.append("logo", data.logo || "");

    const response = await createSociety(formData);

    if (!("error" in response) && response.data) {
      toast.success("Society created successfully.");
      navigate("/dashboard", { replace: true });
      sessionStorage.removeItem("societyName");
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full">
        <div className="flex flex-col items-center mb-6">
          <div className="relative w-24 h-24 rounded-full border-2 border-primary-600 flex items-center justify-center mb-2">
            {logoPreview ? (
              <img
                src={logoPreview}
                alt="Logo preview"
                className="w-[95%] h-[95%] rounded-full object-cover"
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
              className="absolute bottom-0 right-0 bg-primary-600 rounded-full p-1 cursor-pointer"
            >
              <Camera className="h-5 w-5 text-white" />
            </label>
            <input
              id="logo-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoChange}
            />
          </div>
        </div>

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Society Name</FormLabel>
              <FormControl>
                <Input placeholder="Society Name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Society Vision</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Write a brief society's vision"
                  className="min-h-28 resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
          {isLoading ? "Creating" : "Create"}
        </Button>
      </form>
    </Form>
  );
};
