import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Camera } from "lucide-react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { societyFormSchema, SocietyFormValues } from "@/schema";
import { useAppSelector } from "@/app/hooks";
import { Advisor } from "../../types";

export const SocietyForm = () => {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const { user } = useAppSelector((state) => state.auth);

  const societyName = user && (user as Advisor).societyName;

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

  const onSubmit = (data: SocietyFormValues) => {
    console.log(data);
    // Handle form submission here
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full">
        <div className="flex flex-col items-center mb-6">
          <div className="relative w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mb-2">
            {logoPreview ? (
              <img
                src={logoPreview}
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
              onChange={handleLogoChange}
            />
          </div>
        </div>

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
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
              <FormLabel>Statement of Purpose</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Write a brief statement of purpose of society"
                  className="min-h-28 resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" size="lg" className="w-full">
          Save
        </Button>
      </form>
    </Form>
  );
};
