import { Skeleton } from "@/components/ui/skeleton";
import useGetSocietyId from "@/hooks/useGetSocietyId";

import { useGetSocietyQuery, useUpdateSocietySettingsMutation } from "../api";
import { useForm } from "react-hook-form";
import { SocietySettingsSchema, SocietySettingsValues } from "@/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import ApiError from "@/features/api-error";
import { Navigate } from "react-router";

const SocietySettings = () => {
  const societyId = useGetSocietyId();
  const [originalValues, setOriginalValues] =
    useState<SocietySettingsValues | null>(null);
  const [formChanged, setFormChanged] = useState(false);

  const { data: society, isLoading } = useGetSocietyQuery({
    societyId: societyId || "",
  });
  const [updateSettings, { isLoading: isUpdating, error, isError }] =
    useUpdateSocietySettingsMutation();

  const form = useForm<SocietySettingsValues>({
    resolver: zodResolver(SocietySettingsSchema),
  });

  useEffect(() => {
    if (society && !("error" in society)) {
      const defaultValues = {
        acceptingNewMembers: society.acceptingNewMembers ?? false,
        membersLimit: society.membersLimit ?? 40,
      };

      setOriginalValues(defaultValues);
      form.reset(defaultValues);
    }
  }, [form, society]);

  // Check if form values have changed from original values
  useEffect(() => {
    const subscription = form.watch((values) => {
      if (!originalValues) return;

      const isChanged =
        values.acceptingNewMembers !== originalValues.acceptingNewMembers ||
        values.membersLimit !== originalValues.membersLimit;

      setFormChanged(isChanged);
    });

    return () => subscription.unsubscribe();
  }, [form, originalValues]);

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

  if (isLoading) {
    return (
      <div className="w-full p-4 space-y-4">
        <Skeleton className="w-full h-10" />
        <Skeleton className="w-full h-16" />
        <Skeleton className="w-full h-16" />
        <Skeleton className="w-full h-10" />
      </div>
    );
  }

  if (!societyId) {
    return <Navigate to="/dashboard" />;
  }

  const onSubmit = async (values: SocietySettingsValues) => {
    await updateSettings({ societyId, ...values });
    if (!isError) {
      setOriginalValues(values);
      setFormChanged(false);
      toast.success("Settings updated successfully");
    }
  };

  return (
    <div className="w-full p-4">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full flex flex-col items-end h-full"
        >
          <div className="w-full space-y-4 flex-1">
            <FormField
              control={form.control}
              name="acceptingNewMembers"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border border-neutral-300 p-3 shadow-md">
                  <div className="space-y-0.5">
                    <FormLabel>New members requests</FormLabel>
                    <FormDescription>
                      Open members registration and receive new members
                      requests.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="membersLimit"
              render={({ field }) => (
                <FormItem className="p-3 shadow-md rounded-lg border border-neutral-300">
                  <FormLabel>Members Limit</FormLabel>
                  <FormControl>
                    <Input
                      value={field.value}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                      type="number"
                      className="outline outline-neutral-400"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {formChanged && (
            <Button disabled={isUpdating} type="submit" className="mt-4">
              Save
            </Button>
          )}
        </form>
      </Form>
    </div>
  );
};

export default SocietySettings;
