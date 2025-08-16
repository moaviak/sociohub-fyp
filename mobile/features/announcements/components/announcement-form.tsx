import { View, Text, KeyboardAvoidingView, Platform } from "react-native";
import { Announcement } from "../types";
import {
  Actionsheet,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
  ActionsheetContent,
  ActionsheetBackdrop,
} from "@/components/ui/actionsheet";
import { Controller, useForm } from "react-hook-form";
import { AnnouncementData, AnnouncementSchema } from "../schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import {
  FormControl,
  FormControlError,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
} from "@/components/ui/form-control";
import { Input, InputField } from "@/components/ui/input";
import { Textarea, TextareaInput } from "@/components/ui/textarea";
import { Button, ButtonText } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Radio,
  RadioGroup,
  RadioIcon,
  RadioIndicator,
  RadioLabel,
} from "@/components/ui/radio";
import { DateTimePicker } from "@/components/date-time-picker";
import {
  useCreateAnnouncementMutation,
  useUpdateAnnouncementMutation,
} from "../api";
import { useToastUtility } from "@/hooks/useToastUtility";
import ApiError from "@/store/api-error";

interface AnnouncementFormProps {
  announcement?: Announcement;
  open: boolean;
  setOpen: (open: boolean) => void;
  societyId: string;
}

export const AnnouncementForm = ({
  announcement,
  open,
  setOpen,
  societyId,
}: AnnouncementFormProps) => {
  const [createAnnouncement, { isLoading }] = useCreateAnnouncementMutation();
  const [updateAnnouncement, { isLoading: isUpdating }] =
    useUpdateAnnouncementMutation();

  const { showErrorToast, showSuccessToast } = useToastUtility();

  const form = useForm({
    resolver: zodResolver(AnnouncementSchema),
    defaultValues: {
      title: announcement?.title ?? "",
      content: announcement?.content ?? "",
      publishNow: !announcement?.publishDateTime || true,
      publishDateTime: announcement?.publishDateTime
        ? new Date(announcement.publishDateTime)
        : undefined,
      audience: announcement?.audience ?? "All",
      sendEmail: announcement?.sendEmail || false,
    },
  });

  const publishNow = form.watch("publishNow");

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = async (data: AnnouncementData) => {
    const body = {
      societyId,
      title: data.title,
      content: data.content,
      audience: data.audience,
      publishDateTime: data.publishDateTime,
      sendEmail: data.sendEmail,
    };

    if (!announcement) {
      try {
        await createAnnouncement(body).unwrap();

        showSuccessToast("Successfully created announcement.");
      } catch (error) {
        const message =
          (error as ApiError).errorMessage ||
          "Unexpected error occurred while creating announcement.";

        showErrorToast(message);
      }
    } else {
      try {
        await updateAnnouncement({
          announcementId: announcement.id,
          ...body,
        }).unwrap();

        showSuccessToast("Successfully updated announcement.");
      } catch (error) {
        const message =
          (error as ApiError).errorMessage ||
          "Unexpected error occurred while updating announcement.";
        showErrorToast(message);
      }
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <Actionsheet isOpen={open} onClose={handleClose}>
        <ActionsheetBackdrop />
        <ActionsheetContent className="pb-6 max-h-[90%]">
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>
          <VStack className="w-full px-4 py-4" space="lg">
            {/* Header */}
            <VStack space="sm">
              <Text className="text-xl font-semibold text-center text-gray-800">
                {announcement ? "Edit" : "Create"} Announcement
              </Text>
              <Text className="text-sm text-gray-600 text-center">
                {announcement
                  ? "Modify the details of the existing announcement."
                  : "Provide the necessary information to create a new announcement."}
              </Text>
            </VStack>

            <VStack space="lg">
              {/* Title Field */}
              <FormControl isInvalid={!!form.formState.errors.title} isRequired>
                <FormControlLabel>
                  <FormControlLabelText>
                    Announcement Title <Text className="text-red-500">*</Text>
                  </FormControlLabelText>
                </FormControlLabel>
                <Controller
                  control={form.control}
                  name="title"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      variant="outline"
                      className="border border-neutral-300 rounded-lg h-11"
                    >
                      <InputField
                        placeholder="Hackathon Submission Deadline Extended"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                      />
                    </Input>
                  )}
                />
                {form.formState.errors.title && (
                  <FormControlError>
                    <FormControlErrorText>
                      {form.formState.errors.title?.message}
                    </FormControlErrorText>
                  </FormControlError>
                )}
              </FormControl>

              {/* Content Field */}
              <FormControl isInvalid={!!form.formState.errors.content}>
                <FormControlLabel>
                  <FormControlLabelText>
                    Announcement Content
                  </FormControlLabelText>
                </FormControlLabel>
                <Controller
                  control={form.control}
                  name="content"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Textarea className="border border-neutral-300 rounded-lg min-h-20">
                      <TextareaInput
                        placeholder="Write announcement to make."
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        multiline
                        numberOfLines={4}
                        className="align-top"
                      />
                    </Textarea>
                  )}
                />
                {form.formState.errors.content && (
                  <FormControlError>
                    <FormControlErrorText>
                      {form.formState.errors.content?.message}
                    </FormControlErrorText>
                  </FormControlError>
                )}
              </FormControl>

              {/* Publish Now Switch */}
              <FormControl>
                <View className="flex-row items-center justify-between rounded-lg border border-neutral-300 p-3">
                  <View className="flex-1">
                    <FormControlLabel>
                      <FormControlLabelText className="font-medium">
                        Publish Immediately?
                      </FormControlLabelText>
                    </FormControlLabel>
                    <Text className="text-sm text-gray-600 mt-1">
                      Enable this option to publish the announcement
                      immediately.
                    </Text>
                  </View>
                  <Controller
                    control={form.control}
                    name="publishNow"
                    render={({ field: { onChange, value } }) => (
                      <Switch
                        value={value}
                        onValueChange={onChange}
                        className="ml-3"
                      />
                    )}
                  />
                </View>
              </FormControl>

              {/* Publish Date Time (conditional) */}
              {!publishNow && (
                <FormControl
                  isInvalid={!!form.formState.errors.publishDateTime}
                >
                  <FormControlLabel>
                    <FormControlLabelText>
                      Publish Date & Time{" "}
                      <Text className="text-red-500">*</Text>
                    </FormControlLabelText>
                  </FormControlLabel>
                  <Controller
                    control={form.control}
                    name="publishDateTime"
                    render={({ field: { onChange, value } }) => (
                      <DateTimePicker
                        value={value}
                        onChange={onChange}
                        disabled={(date) => {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          return date < today;
                        }}
                      />
                    )}
                  />
                  {form.formState.errors.publishDateTime && (
                    <FormControlError>
                      <FormControlErrorText>
                        {form.formState.errors.publishDateTime?.message}
                      </FormControlErrorText>
                    </FormControlError>
                  )}
                </FormControl>
              )}

              {/* Audience Selection */}
              <FormControl isInvalid={!!form.formState.errors.audience}>
                <FormControlLabel>
                  <FormControlLabelText>Audience</FormControlLabelText>
                </FormControlLabel>
                <Controller
                  control={form.control}
                  name="audience"
                  render={({ field: { onChange, value } }) => (
                    <RadioGroup value={value} onChange={onChange}>
                      <HStack space="xl" className="mt-2">
                        <Radio value="All" className="flex-row items-center">
                          <RadioIndicator>
                            <RadioIcon />
                          </RadioIndicator>
                          <RadioLabel className="ml-2">All Students</RadioLabel>
                        </Radio>
                        <Radio
                          value="Members"
                          className="flex-row items-center"
                        >
                          <RadioIndicator>
                            <RadioIcon />
                          </RadioIndicator>
                          <RadioLabel className="ml-2">
                            Society Members Only
                          </RadioLabel>
                        </Radio>
                      </HStack>
                    </RadioGroup>
                  )}
                />
                {form.formState.errors.audience && (
                  <FormControlError>
                    <FormControlErrorText>
                      {form.formState.errors.audience?.message}
                    </FormControlErrorText>
                  </FormControlError>
                )}
              </FormControl>

              {/* Send Email Switch */}
              <FormControl>
                <View className="flex-row items-center justify-between rounded-lg border border-neutral-300 p-3">
                  <View className="flex-1">
                    <FormControlLabel>
                      <FormControlLabelText className="font-medium">
                        Send Email?
                      </FormControlLabelText>
                    </FormControlLabel>
                    <Text className="text-sm text-gray-600 mt-1">
                      Enable this option to send an email notification to your
                      audience.
                    </Text>
                  </View>
                  <Controller
                    control={form.control}
                    name="sendEmail"
                    render={({ field: { onChange, value } }) => (
                      <Switch
                        value={value}
                        onValueChange={onChange}
                        className="ml-3"
                      />
                    )}
                  />
                </View>
              </FormControl>
            </VStack>

            {/* Action Buttons */}
            <HStack space="md" className="justify-end mt-6">
              <Button
                variant="outline"
                onPress={handleClose}
                disabled={isLoading || isUpdating}
                className="flex-1"
              >
                <ButtonText>Cancel</ButtonText>
              </Button>
              <Button
                onPress={form.handleSubmit(handleSubmit)}
                disabled={isLoading || isUpdating}
                className="flex-1"
              >
                <ButtonText>
                  {isLoading || isUpdating ? "Publishing..." : "Publish"}
                </ButtonText>
              </Button>
            </HStack>
          </VStack>
        </ActionsheetContent>
      </Actionsheet>
    </KeyboardAvoidingView>
  );
};
