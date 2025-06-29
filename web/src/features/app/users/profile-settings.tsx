import { useAppSelector } from "@/app/hooks";
import { PhotoUpload } from "@/components/photo-upload";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UserProfileData, UserProfileSchema } from "@/schema";
import { Advisor } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { useUpdateProfileMutation } from "./api";
import ApiError from "@/features/api-error";
import { toast } from "sonner";

export const ProfileSettings = () => {
  const navigate = useNavigate();

  const { user } = useAppSelector((state) => state.auth);
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();

  const form = useForm<UserProfileData>({
    resolver: zodResolver(UserProfileSchema),
  });

  useEffect(() => {
    if (!user) {
      navigate("-1");
    }
  }, [navigate, user]);

  useEffect(() => {
    if (user) {
      form.reset({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        displayName: (user as Advisor).displayName || "",
        avatar: undefined,
        bio: user.bio || "",
        phone: user.phone || "",
      });
    }
  }, [form, user]);

  if (!user) {
    return null;
  }

  const onSubmit = async (data: UserProfileData) => {
    const formData = new FormData();

    if (data.avatar) formData.append("avatar", data.avatar);
    formData.append("firstName", data.firstName);
    formData.append("lastName", data.lastName);
    if (data.displayName) formData.append("displayName", data.displayName);
    if (data.bio) formData.append("bio", data.bio);
    if (data.phone) formData.append("phone", data.phone);

    try {
      const response = await updateProfile({ formData }).unwrap();

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
            name="avatar"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <PhotoUpload
                    initialImage={user?.avatar}
                    onFileSelect={(file: File) => field.onChange(file)}
                    onFileRemove={() => field.onChange(undefined)}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input {...field} className="outline outline-neutral-400" />
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
                    <Input {...field} className="outline outline-neutral-400" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div
            className={`grid ${
              !("registrationNumber" in user) ? "grid-cols-2" : "grid-cols-1"
            } gap-4`}
          >
            {!("registrationNumber" in user) && (
              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="outline outline-neutral-400"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone #</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="outline outline-neutral-400"
                      placeholder="03xxxxxxxxx"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bio</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    className="resize-none min-h-24 outline outline-neutral-400"
                    placeholder="Enter a brief bio about yourself"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="mt-4 self-end" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </Form>
    </div>
  );
};
