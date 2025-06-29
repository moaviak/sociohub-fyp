import useGetSocietyId from "@/hooks/useGetSocietyId";
import { Society } from "@/types";
import { useLocation, useNavigate } from "react-router";
import { useGetSocietyQuery, useUpdateSocietyProfileMutation } from "../api";
import { useEffect } from "react";
import { SpinnerLoader } from "@/components/spinner-loader";
import { useForm } from "react-hook-form";
import { SocietyProfileData, SocietyProfileSchema } from "@/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { PhotoUpload } from "@/components/photo-upload";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import ApiError from "@/features/api-error";
import { toast } from "sonner";

const ProfileSettings = () => {
  const societyId = useGetSocietyId();
  const { state } = useLocation();
  const navigate = useNavigate();

  const societyFromState = state?.society as Society | undefined;
  const { data: societyFromQuery, isLoading } = useGetSocietyQuery(
    {
      societyId: societyId || "",
    },
    { skip: !!societyFromState }
  );

  const [updateSocietyProfile, { isLoading: isUpdating }] =
    useUpdateSocietyProfileMutation();

  const society =
    societyFromState ||
    (societyFromQuery && !("error" in societyFromQuery)
      ? societyFromQuery
      : undefined);

  const form = useForm<SocietyProfileData>({
    resolver: zodResolver(SocietyProfileSchema),
  });

  useEffect(() => {
    if (!isLoading && !society) {
      navigate(-1);
    }
  }, [isLoading, navigate, society]);

  useEffect(() => {
    if (society) {
      form.reset({
        name: society.name,
        description: society.description || "",
        logo: undefined,
        statementOfPurpose: society.statementOfPurpose || "",
        advisorMessage: society.advisorMessage || "",
        mission: society.mission || "",
        coreValues: society.coreValues || "",
      });
    }
  }, [form, society]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <SpinnerLoader size="md" />
      </div>
    );
  }

  const onSubmit = async (data: SocietyProfileData) => {
    const formData = new FormData();

    formData.append("description", data.description);
    if (data.logo) formData.append("logo", data.logo);
    if (data.statementOfPurpose)
      formData.append("statementOfPurpose", data.statementOfPurpose);
    if (data.advisorMessage)
      formData.append("advisorMessage", data.advisorMessage);
    if (data.mission) formData.append("mission", data.mission);
    if (data.coreValues) formData.append("coreValues", data.coreValues);

    try {
      const response = await updateSocietyProfile({
        societyId: society?.id || "",
        formData,
      });

      if (!("error" in response)) {
        toast.success("Profile updated successfully");
      } else {
        throw new Error();
      }
    } catch (error) {
      const message =
        (error as ApiError).errorMessage || "Unable to update profile";
      toast.error(message);
    }
  };

  return (
    <div className="w-full p-4">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-y-4 p-4"
        >
          <FormField
            control={form.control}
            name="logo"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <PhotoUpload
                    initialImage={society?.logo}
                    onFileSelect={(file: File) => field.onChange(file)}
                    onFileRemove={() => field.onChange(undefined)}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Society Name</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    disabled
                    className="outline outline-neutral-400"
                  />
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
                    {...field}
                    className="resize-none min-h-24 outline outline-neutral-400"
                    placeholder="Enter your society vision here"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="statementOfPurpose"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Society Statement of Purpose</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    className="resize-none min-h-24 outline outline-neutral-400"
                    placeholder="Enter your society statement of purpose here"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="advisorMessage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Faculty Advisor Message</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    className="resize-none min-h-24 outline outline-neutral-400"
                    placeholder="Enter faculty advisor message here"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="mission"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Society Mission</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    className="resize-none min-h-24 outline outline-neutral-400"
                    placeholder="Enter your society mission here"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="coreValues"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Society Core Values</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    className="resize-none min-h-24 outline outline-neutral-400"
                    placeholder="Enter your society core values here"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="mt-4 self-end" disabled={isUpdating}>
            {isUpdating ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </Form>
    </div>
  );
};
export default ProfileSettings;
