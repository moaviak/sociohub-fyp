import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormControlError,
  FormControlErrorText,
} from "@/components/ui/form-control";
import { ChevronDownIcon, EyeIcon, EyeOffIcon } from "@/components/ui/icon";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
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
import { Toast, ToastDescription, useToast } from "@/components/ui/toast";
import { VStack } from "@/components/ui/vstack";
import { SOCIETIES_ADVISORS } from "@/data";
import { advisorSignUpSchema, advisorSignUpValues } from "@/schema";
import ApiError from "@/store/api-error";
import {
  useAdvisorSignUpMutation,
  useGetAdvisorsListQuery,
} from "@/store/auth/api";
import { Advisor, AuthResponse, SocietyAdvisor } from "@/types/type";
import { zodResolver } from "@hookform/resolvers/zod";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { View, Text, ScrollView } from "react-native";

export const AdvisorForm = () => {
  const [advisors, setAdvisors] =
    useState<SocietyAdvisor[]>(SOCIETIES_ADVISORS);
  const [showPassword, setShowPassword] = useState(false);
  const toast = useToast();

  const { data: advisorList, isSuccess } = useGetAdvisorsListQuery();
  const [signUp, { isLoading, isError, error }] = useAdvisorSignUpMutation();

  const form = useForm<advisorSignUpValues>({
    resolver: zodResolver(advisorSignUpSchema),
    defaultValues: {
      firstName: advisors[0].firstName,
      lastName: advisors[0].lastName,
      displayName: advisors[0].displayName,
      email: advisors[0].email,
      password: "",
    },
  });

  useEffect(() => {
    if (isSuccess) setAdvisors(advisorList as SocietyAdvisor[]);
  }, [advisorList, isSuccess]);

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

  const onSubmit = async (values: advisorSignUpValues) => {
    const response = await signUp(values);

    if (!("error" in response) && response.data) {
      const user = (response.data as AuthResponse).user as Advisor;
      await AsyncStorage.setItem("societyName", user.societyName || "");
      toast.show({
        render: () => {
          return (
            <Toast action="success">
              <ToastDescription>
                Account created successfully! Please verify your email.
              </ToastDescription>
            </Toast>
          );
        },
      });
      router.replace("/auth/verify-email");
    }
  };

  return (
    <VStack className="gap-y-6">
      <VStack className="gap-y-4">
        <FormControl isInvalid={!!form.formState.errors.firstName} isRequired>
          <Controller
            control={form.control}
            name="firstName"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                variant="outline"
                className="border border-neutral-300 rounded-lg h-11"
              >
                <InputField
                  placeholder="First Name"
                  type="text"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
              </Input>
            )}
          />
          <FormControlError>
            <FormControlErrorText>
              {form.formState.errors.firstName?.message}
            </FormControlErrorText>
          </FormControlError>
        </FormControl>

        <FormControl isInvalid={!!form.formState.errors.lastName} isRequired>
          <Controller
            control={form.control}
            name="lastName"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                variant="outline"
                className="border border-neutral-300 rounded-lg h-11"
              >
                <InputField
                  placeholder="Last Name"
                  type="text"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
              </Input>
            )}
          />
          <FormControlError>
            <FormControlErrorText>
              {form.formState.errors.lastName?.message}
            </FormControlErrorText>
          </FormControlError>
        </FormControl>

        <FormControl isInvalid={!!form.formState.errors.displayName} isRequired>
          <Controller
            control={form.control}
            name="displayName"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                variant="outline"
                className="border border-neutral-300 rounded-lg h-11"
              >
                <InputField
                  placeholder="Display Name"
                  type="text"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
              </Input>
            )}
          />
          <FormControlError>
            <FormControlErrorText>
              {form.formState.errors.displayName?.message}
            </FormControlErrorText>
          </FormControlError>
        </FormControl>

        <FormControl isInvalid={!!form.formState.errors.email} isRequired>
          <Controller
            control={form.control}
            name="email"
            render={({ field: { onChange, value } }) => (
              <Select
                onValueChange={(email) => {
                  onChange(email);
                  const selectedAdvisor = advisors.find(
                    (advisor) => advisor.email === email
                  );
                  if (selectedAdvisor) {
                    form.setValue("firstName", selectedAdvisor.firstName);
                    form.setValue("lastName", selectedAdvisor.lastName);
                    form.setValue("displayName", selectedAdvisor.displayName);
                  }
                }}
                className="w-full"
              >
                <SelectTrigger
                  variant="outline"
                  className="h-11 border-neutral-300 rounded-lg justify-between"
                >
                  <SelectInput value={value} />
                  <SelectIcon className="mr-2" as={ChevronDownIcon} />
                </SelectTrigger>
                <SelectPortal>
                  <SelectBackdrop />
                  <SelectContent>
                    <SelectDragIndicatorWrapper>
                      <SelectDragIndicator />
                    </SelectDragIndicatorWrapper>
                    <ScrollView className="w-full">
                      {advisors.map((advisor, idx) => (
                        <SelectItem
                          key={idx}
                          label={advisor.email}
                          value={advisor.email}
                        />
                      ))}
                    </ScrollView>
                  </SelectContent>
                </SelectPortal>
              </Select>
            )}
          />
          <FormControlError>
            <FormControlErrorText>
              {form.formState.errors.email?.message}
            </FormControlErrorText>
          </FormControlError>
        </FormControl>

        <FormControl isInvalid={!!form.formState.errors.phone}>
          <Controller
            control={form.control}
            name="phone"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                variant="outline"
                className="border border-neutral-300 rounded-lg h-11"
              >
                <InputField
                  placeholder="phone"
                  type="text"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="phone-pad"
                />
              </Input>
            )}
          />
          <FormControlError>
            <FormControlErrorText>
              {form.formState.errors.phone?.message}
            </FormControlErrorText>
          </FormControlError>
        </FormControl>

        <FormControl isInvalid={!!form.formState.errors.password} isRequired>
          <Controller
            control={form.control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                variant="outline"
                className="border border-neutral-300 rounded-lg h-11"
              >
                <InputField
                  placeholder="Password"
                  type={showPassword ? "text" : "password"}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  secureTextEntry={!showPassword}
                />
                <InputSlot
                  className="pr-3"
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <InputIcon as={showPassword ? EyeIcon : EyeOffIcon} />
                </InputSlot>
              </Input>
            )}
          />
          <FormControlError>
            <FormControlErrorText>
              {form.formState.errors.password?.message}
            </FormControlErrorText>
          </FormControlError>
        </FormControl>
      </VStack>

      <Button
        className="bg-primary-500 rounded-md"
        size="xl"
        onPress={form.handleSubmit(onSubmit)}
        isDisabled={isLoading}
      >
        <Text className="text-white font-semibold">Sign up</Text>
      </Button>
    </VStack>
  );
};
