import { Controller, useForm } from "react-hook-form";
import {
  View,
  Text,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import {
  SocietyRegistrationFormSchema,
  SocietyRegistrationFormValues,
} from "./schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useGetSocietiesQuery, useSendJoinRequestMutation } from "./api";
import { useAppSelector } from "@/store/hooks";
import { Toast, ToastDescription, useToast } from "@/components/ui/toast";
import { useRouter } from "expo-router";
import ApiError from "@/store/api-error";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
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
import {
  Select,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicator,
  SelectDragIndicatorWrapper,
  SelectIcon,
  SelectInput,
  SelectItem,
  SelectPortal,
  SelectTrigger,
} from "@/components/ui/select";
import { ChevronDownIcon } from "lucide-react-native";
import { Student } from "@/types/type";
import { useEffect } from "react";
import { SocietyRules } from "./components/society-rules";

const RegistrationForm = ({ societyId }: { societyId?: string }) => {
  const { user, userType } = useAppSelector((state) => state.auth);
  const toast = useToast();
  const router = useRouter();

  const { society, isFetching } = useGetSocietiesQuery(
    {},
    {
      selectFromResult: ({ data, isFetching }) => ({
        society: data?.find((society) => society.id === societyId),
        isFetching,
      }),
    }
  );
  const [sendJoinRequest, { isLoading }] = useSendJoinRequestMutation();

  const form = useForm<SocietyRegistrationFormValues>({
    resolver: zodResolver(SocietyRegistrationFormSchema),
    defaultValues: {
      societyId: societyId,
      whatsappNo: "",
      interestedRole: "",
      reason: "",
      expectations: "",
      skills: "",
      isAgree: false,
      semester: undefined,
    },
  });

  // Fix Error 2: Move router.back() to useEffect to avoid calling during render
  useEffect(() => {
    if (!society && !isFetching) {
      router.back();
    }
  }, [society, router]);

  // Return early if society is not found, but don't call router.back() here
  if (!society) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size={"large"} />
      </View>
    );
  }

  const isAgree = form.watch("isAgree");
  const semester = form.watch("semester");

  const onSubmit = async (values: SocietyRegistrationFormValues) => {
    try {
      await sendJoinRequest(values).unwrap();
      toast.show({
        duration: 5000,
        placement: "top",
        containerStyle: {
          marginTop: 18,
        },
        render: () => {
          return (
            <Toast action="success">
              <ToastDescription>Request successfully sent.</ToastDescription>
            </Toast>
          );
        },
      });
      router.back();
    } catch (error) {
      const message = (error as ApiError).errorMessage;
      toast.show({
        duration: 10000,
        placement: "top",
        containerStyle: {
          marginTop: 18,
        },
        render: () => {
          return (
            <Toast action="error">
              <ToastDescription>
                {message || "An unexpected error occurred"}
              </ToastDescription>
            </Toast>
          );
        },
      });
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
      <VStack space="2xl" className="p-4">
        {/* Student Information Display */}
        <VStack space="md">
          <Text className="font-semibold text-lg text-gray-800">
            Registration Details
          </Text>

          <VStack space="sm">
            <HStack className="justify-between" space="sm">
              <Text className="text-gray-600">Society Name:</Text>
              <Text className="font-semibold text-gray-800 flex-1 text-right">
                {society.name}
              </Text>
            </HStack>

            <HStack className="justify-between" space="sm">
              <Text className="text-gray-600">Student Name:</Text>
              <Text className="font-semibold text-gray-800 flex-1 text-right">
                {`${user?.firstName} ${user?.lastName}`}
              </Text>
            </HStack>

            <HStack className="justify-between" space="sm">
              <Text className="text-gray-600">Registration #:</Text>
              <Text className="font-semibold text-gray-800 flex-1 text-right">
                {(user as Student).registrationNumber}
              </Text>
            </HStack>

            <HStack className="justify-between" space="sm">
              <Text className="text-gray-600">Email:</Text>
              <Text className="font-semibold text-gray-800 flex-1 text-right">
                {user?.email}
              </Text>
            </HStack>
          </VStack>
        </VStack>

        {/* Form Fields */}
        <VStack space="lg">
          {/* WhatsApp Number */}
          <FormControl
            isInvalid={!!form.formState.errors.whatsappNo}
            isRequired
          >
            <FormControlLabel>
              <FormControlLabelText>WhatsApp Number</FormControlLabelText>
            </FormControlLabel>
            <Controller
              control={form.control}
              name="whatsappNo"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  variant="outline"
                  className="border border-neutral-300 rounded-lg h-11"
                >
                  <InputField
                    placeholder="+92-3xx-xxxxxxx"
                    type="text"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                  />
                </Input>
              )}
            />
            {/* Fix Error 1: Only render FormControlError if there's actually an error */}
            {form.formState.errors.whatsappNo && (
              <FormControlError>
                <FormControlErrorText>
                  {form.formState.errors.whatsappNo?.message}
                </FormControlErrorText>
              </FormControlError>
            )}
          </FormControl>

          {/* Semester */}
          <FormControl isInvalid={!!form.formState.errors.semester} isRequired>
            <FormControlLabel>
              <FormControlLabelText>Semester</FormControlLabelText>
            </FormControlLabel>
            <Controller
              control={form.control}
              name="semester"
              render={({ field: { onChange, value } }) => (
                <Select
                  onValueChange={(val) => onChange(Number(val))}
                  className="flex-1 min-w-0"
                >
                  <SelectTrigger
                    variant="outline"
                    className="h-11 border-neutral-300 rounded-lg justify-between"
                  >
                    <SelectInput
                      placeholder="Select your semester"
                      value={value?.toString() || ""}
                    />
                    <SelectIcon className="mr-2" as={ChevronDownIcon} />
                  </SelectTrigger>
                  <SelectPortal>
                    <SelectBackdrop />
                    <SelectContent className="max-h-[50vh]">
                      <SelectDragIndicatorWrapper>
                        <SelectDragIndicator />
                      </SelectDragIndicatorWrapper>
                      <ScrollView className="w-full">
                        {Array.from({ length: 10 }, (_, i) => i + 1).map(
                          (semester) => (
                            <SelectItem
                              key={semester}
                              label={semester.toString()}
                              value={semester.toString()}
                            />
                          )
                        )}
                      </ScrollView>
                    </SelectContent>
                  </SelectPortal>
                </Select>
              )}
            />
            {form.formState.errors.semester && (
              <FormControlError>
                <FormControlErrorText>
                  {form.formState.errors.semester?.message}
                </FormControlErrorText>
              </FormControlError>
            )}
          </FormControl>

          {/* Interested Role */}
          <FormControl
            isInvalid={!!form.formState.errors.interestedRole}
            isRequired
          >
            <FormControlLabel>
              <FormControlLabelText>
                Select role you are interested in
              </FormControlLabelText>
            </FormControlLabel>
            <Controller
              control={form.control}
              name="interestedRole"
              render={({ field: { onChange, value } }) => (
                <Select onValueChange={onChange} className="flex-1 min-w-0">
                  <SelectTrigger
                    variant="outline"
                    className="h-11 border-neutral-300 rounded-lg justify-between"
                    disabled={!semester}
                  >
                    <SelectInput placeholder="Select role" />
                    <SelectIcon className="mr-2" as={ChevronDownIcon} />
                  </SelectTrigger>
                  <SelectPortal>
                    <SelectBackdrop />
                    <SelectContent className="max-h-[50vh]">
                      <SelectDragIndicatorWrapper>
                        <SelectDragIndicator />
                      </SelectDragIndicatorWrapper>
                      <ScrollView className="w-full">
                        {society.roles?.map((role) => {
                          if (
                            !role?.minSemester ||
                            (semester && semester >= role.minSemester)
                          ) {
                            return (
                              <SelectItem
                                key={role.id}
                                label={role.name}
                                value={role.id}
                              />
                            );
                          }
                          return null;
                        })}
                      </ScrollView>
                    </SelectContent>
                  </SelectPortal>
                </Select>
              )}
            />
            {form.formState.errors.interestedRole && (
              <FormControlError>
                <FormControlErrorText>
                  {form.formState.errors.interestedRole?.message}
                </FormControlErrorText>
              </FormControlError>
            )}
          </FormControl>

          {/* Reason for joining */}
          <FormControl isInvalid={!!form.formState.errors.reason} isRequired>
            <FormControlLabel>
              <FormControlLabelText>Reason for joining</FormControlLabelText>
            </FormControlLabel>
            <Controller
              control={form.control}
              name="reason"
              render={({ field: { onChange, onBlur, value } }) => (
                <Textarea className="border border-neutral-300 rounded-lg min-h-20">
                  <TextareaInput
                    placeholder="Why do you want to join this society?"
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
            {form.formState.errors.reason && (
              <FormControlError>
                <FormControlErrorText>
                  {form.formState.errors.reason?.message}
                </FormControlErrorText>
              </FormControlError>
            )}
          </FormControl>

          {/* Expectations */}
          <FormControl
            isInvalid={!!form.formState.errors.expectations}
            isRequired
          >
            <FormControlLabel>
              <FormControlLabelText>
                Expectations from the society
              </FormControlLabelText>
            </FormControlLabel>
            <Controller
              control={form.control}
              name="expectations"
              render={({ field: { onChange, onBlur, value } }) => (
                <Textarea className="border border-neutral-300 rounded-lg min-h-20">
                  <TextareaInput
                    placeholder="What do you expect to gain from this society?"
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
            {form.formState.errors.expectations && (
              <FormControlError>
                <FormControlErrorText>
                  {form.formState.errors.expectations?.message}
                </FormControlErrorText>
              </FormControlError>
            )}
          </FormControl>

          {/* Skills */}
          <FormControl isInvalid={!!form.formState.errors.skills}>
            <FormControlLabel>
              <FormControlLabelText>Relevant Skills</FormControlLabelText>
            </FormControlLabel>
            <Controller
              control={form.control}
              name="skills"
              render={({ field: { onChange, onBlur, value } }) => (
                <Textarea className="border border-neutral-300 rounded-lg h-16">
                  <TextareaInput
                    placeholder="Do you have any skills or past experience related to this society?"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    multiline
                    numberOfLines={2}
                    className="align-top"
                  />
                </Textarea>
              )}
            />
            {form.formState.errors.skills && (
              <FormControlError>
                <FormControlErrorText>
                  {form.formState.errors.skills?.message}
                </FormControlErrorText>
              </FormControlError>
            )}
          </FormControl>

          {/* Society Rules & Agreement */}
          <SocietyRules form={form} />

          {/* Submit Button */}
          <Button
            onPress={form.handleSubmit(onSubmit)}
            isDisabled={!isAgree || isLoading}
            className="mt-4 bg-primary-500"
          >
            <ButtonText>{isLoading ? "Submitting..." : "Submit"}</ButtonText>
          </Button>
        </VStack>
      </VStack>
    </KeyboardAwareScrollView>
  );
};

export default RegistrationForm;
