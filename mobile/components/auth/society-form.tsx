import { View, Text } from "react-native";
import { VStack } from "../ui/vstack";
import { Controller, useForm } from "react-hook-form";
import { societyFormSchema, societyFormValues } from "@/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  FormControl,
  FormControlError,
  FormControlErrorText,
} from "../ui/form-control";
import { Input, InputField } from "../ui/input";
import { Textarea, TextareaInput } from "../ui/textarea";
import { Button, ButtonText } from "../ui/button";
import { ImagePickerCircle } from "./image-picker-circle";
import { useCreateSocietyMutation } from "@/store/auth/api";
import { Toast, ToastDescription, useToast } from "../ui/toast";
import ApiError from "@/store/api-error";
import { router } from "expo-router";

export const SocietyForm = () => {
  const form = useForm<societyFormValues>({
    resolver: zodResolver(societyFormSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });
  const toast = useToast();
  const [createSociety, { isError, isLoading, error }] =
    useCreateSocietyMutation();

  useEffect(() => {
    const getSocietyName = async () => {
      const societyName = await AsyncStorage.getItem("societyName");
      form.setValue("name", societyName || "");
    };

    getSocietyName();
  }, []);

  useEffect(() => {
    if (isError) {
      toast.show({
        duration: 10000,
        render: () => {
          return (
            <Toast action="error">
              <ToastDescription>
                {(error as ApiError)?.errorMessage ||
                  "An unexpected error occurred"}
              </ToastDescription>
            </Toast>
          );
        },
      });
    }
  }, [isError, error]);

  const onSubmit = async (values: societyFormValues) => {
    try {
      const formData = new FormData();

      // Add text fields
      formData.append("name", values.name);
      formData.append("description", values.description);

      // Handle the file upload
      if (values.logo) {
        // IMPORTANT: The key name "logo" here must match what your backend expects
        formData.append("logo", values.logo);
      }
      // For debugging in dev tools, log entries (only works in development)
      if (__DEV__) {
        try {
          // @ts-ignore - this is for debugging only
          for (let [key, value] of formData.entries()) {
            console.log(`FormData entry - ${key}:`, value);
          }
        } catch (e) {
          console.log("Couldn't enumerate FormData entries:", e);
        }
      }

      // Send the request
      const response = await createSociety(formData);

      if (!("error" in response) && response.data) {
        await AsyncStorage.removeItem("societyName");
        toast.show({
          duration: 3000,
          render: () => {
            return (
              <Toast action="success">
                <ToastDescription>
                  Society created successfully.
                </ToastDescription>
              </Toast>
            );
          },
        });
        router.replace("/");
      }
    } catch (err) {
      console.error("Submit error:", err);
      const error = err as ApiError;
      toast.show({
        duration: 5000,
        render: () => {
          return (
            <Toast action="error">
              <ToastDescription>
                Error submitting form: {error.errorMessage || "Unknown error"}
              </ToastDescription>
            </Toast>
          );
        },
      });
    }
  };

  return (
    <VStack className="gap-y-8 items-center max-w-full">
      <ImagePickerCircle form={form} />

      <VStack className="gap-y-4 w-full">
        <FormControl isInvalid={!!form.formState.errors.name} isRequired>
          <Controller
            control={form.control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                variant="outline"
                className="border border-neutral-300 rounded-lg h-11"
              >
                <InputField
                  placeholder="Society Name"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  autoCapitalize="words"
                />
              </Input>
            )}
          />
          <FormControlError>
            <FormControlErrorText>
              {form.formState.errors.name?.message}
            </FormControlErrorText>
          </FormControlError>
        </FormControl>

        <FormControl isInvalid={!!form.formState.errors.description}>
          <Controller
            control={form.control}
            name="description"
            render={({ field: { onChange, onBlur, value } }) => (
              <Textarea
                className="border border-neutral-300 rounded-lg"
                isRequired
              >
                <TextareaInput
                  placeholder="Society Vision"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  className="align-top"
                />
              </Textarea>
            )}
          />
          <FormControlError>
            <FormControlErrorText>
              {form.formState.errors.description?.message}
            </FormControlErrorText>
          </FormControlError>
        </FormControl>
      </VStack>

      <Button
        className="bg-primary-500 rounded-md w-full"
        size="xl"
        onPress={form.handleSubmit(onSubmit)}
        isDisabled={isLoading}
      >
        <ButtonText size="md" className="font-body">
          {isLoading ? "Creating" : "Create"}
        </ButtonText>
      </Button>
    </VStack>
  );
};
