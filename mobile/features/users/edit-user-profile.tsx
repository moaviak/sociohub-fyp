import { Controller, useForm } from "react-hook-form";
import { View, Text, Platform } from "react-native";
import { UserProfileData, UserProfileSchema } from "./schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppSelector } from "@/store/hooks";
import { useEffect } from "react";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { VStack } from "@/components/ui/vstack";
import {
  FormControl,
  FormControlError,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
} from "@/components/ui/form-control";
import { Input, InputField } from "@/components/ui/input";
import { ImageUpload } from "@/components/image-upload";
import { Textarea, TextareaInput } from "@/components/ui/textarea";
import { Button, ButtonText } from "@/components/ui/button";
import { useUpdateProfileMutation } from "./api";
import ApiError from "@/store/api-error";
import { useToastUtility } from "@/hooks/useToastUtility";

const EditUserProfile = () => {
  const { showErrorToast, showSuccessToast } = useToastUtility();
  const user = useAppSelector((state) => state.auth.user);
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();

  const form = useForm<UserProfileData>({
    resolver: zodResolver(UserProfileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      bio: "",
      phone: "",
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        avatar: undefined,
        bio: user.bio || "",
        phone: user.phone || "",
      });
    }
  }, [user, form]);

  if (!user) {
    return null;
  }

  const onSubmit = async (data: UserProfileData) => {
    console.log({ data });
    console.log(form.formState.errors);
    const formData = new FormData();

    if (data.avatar) formData.append("avatar", data.avatar);
    formData.append("firstName", data.firstName);
    formData.append("lastName", data.lastName);
    if (data.bio) formData.append("bio", data.bio);
    if (data.phone) formData.append("phone", data.phone);

    try {
      await updateProfile({ formData }).unwrap();

      showSuccessToast("Successfully updated profile");
    } catch (error) {
      const message =
        (error as ApiError).errorMessage || "Unable to update profile";

      showErrorToast(message);
    }
  };

  return (
    <KeyboardAwareScrollView
      enableOnAndroid={true}
      extraScrollHeight={Platform.OS === "ios" ? 100 : 30}
      keyboardShouldPersistTaps="handled"
      className="flex-1"
      contentContainerStyle={{ paddingBottom: 20 }}
    >
      <VStack space="md" className="p-6">
        <FormControl isInvalid={!!form.formState.errors.avatar} isRequired>
          <Controller
            control={form.control}
            name="avatar"
            render={({ field: { onChange } }) => (
              <ImageUpload
                initialImage={user.avatar}
                allowsEditing
                aspect={[1, 1]}
                maxSizeMB={10}
                onFileSelect={(file) => onChange(file)}
                onFileRemove={() => onChange()}
                size="lg"
              />
            )}
          />
        </FormControl>

        <FormControl isInvalid={!!form.formState.errors.firstName} isRequired>
          <FormControlLabel>
            <FormControlLabelText>First Name</FormControlLabelText>
          </FormControlLabel>
          <Controller
            control={form.control}
            name="firstName"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                variant="outline"
                className="border border-neutral-300 rounded-lg h-11"
              >
                <InputField
                  placeholder="Enter your first name"
                  type="text"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
              </Input>
            )}
          />
          {/* Only render FormControlError if there's actually an error */}
          {form.formState.errors.firstName && (
            <FormControlError>
              <FormControlErrorText>
                {form.formState.errors.firstName?.message}
              </FormControlErrorText>
            </FormControlError>
          )}
        </FormControl>

        <FormControl isInvalid={!!form.formState.errors.lastName} isRequired>
          <FormControlLabel>
            <FormControlLabelText>Last Name</FormControlLabelText>
          </FormControlLabel>
          <Controller
            control={form.control}
            name="lastName"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                variant="outline"
                className="border border-neutral-300 rounded-lg h-11"
              >
                <InputField
                  placeholder="Enter your last name"
                  type="text"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
              </Input>
            )}
          />
          {/* Only render FormControlError if there's actually an error */}
          {form.formState.errors.lastName && (
            <FormControlError>
              <FormControlErrorText>
                {form.formState.errors.lastName?.message}
              </FormControlErrorText>
            </FormControlError>
          )}
        </FormControl>

        <FormControl isInvalid={!!form.formState.errors.phone}>
          <FormControlLabel>
            <FormControlLabelText>Phone Number</FormControlLabelText>
          </FormControlLabel>
          <Controller
            control={form.control}
            name="phone"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                variant="outline"
                className="border border-neutral-300 rounded-lg h-11"
              >
                <InputField
                  placeholder="Enter your phone number"
                  type="text"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
              </Input>
            )}
          />
          {/* Only render FormControlError if there's actually an error */}
          {form.formState.errors.phone && (
            <FormControlError>
              <FormControlErrorText>
                {form.formState.errors.phone?.message}
              </FormControlErrorText>
            </FormControlError>
          )}
        </FormControl>

        <FormControl isInvalid={!!form.formState.errors.bio}>
          <FormControlLabel>
            <FormControlLabelText>Bio</FormControlLabelText>
          </FormControlLabel>
          <Controller
            control={form.control}
            name="bio"
            render={({ field: { onChange, onBlur, value } }) => (
              <Textarea className="border border-neutral-300 rounded-lg min-h-20">
                <TextareaInput
                  placeholder="Enter a brief introduction of yourself"
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
          {form.formState.errors.bio && (
            <FormControlError>
              <FormControlErrorText>
                {form.formState.errors.bio?.message}
              </FormControlErrorText>
            </FormControlError>
          )}
        </FormControl>

        <Button
          onPress={form.handleSubmit(onSubmit)}
          className="mt-4 bg-primary-500"
          isDisabled={isLoading}
        >
          <ButtonText>{isLoading ? "Saving" : "Save"}</ButtonText>
        </Button>
      </VStack>
    </KeyboardAwareScrollView>
  );
};
export default EditUserProfile;
