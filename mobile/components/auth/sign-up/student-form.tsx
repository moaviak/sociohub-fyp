import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { View, Text, ScrollView } from "react-native";

import { DEGREES } from "@/data";
import { getYearOptions } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { studentSignUpSchema, studentSignUpValues } from "@/schema";
import { VStack } from "@/components/ui/vstack";
import { Button } from "@/components/ui/button";
import { HStack } from "@/components/ui/hstack";
import {
  FormControl,
  FormControlError,
  FormControlErrorText,
} from "@/components/ui/form-control";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { ChevronDownIcon, EyeIcon, EyeOffIcon } from "@/components/ui/icon";
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
import { useStudentSignUpMutation } from "@/store/auth/api";
import { Toast, ToastDescription, useToast } from "@/components/ui/toast";
import ApiError from "@/store/api-error";
import { router } from "expo-router";

export const StudentForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const yearOptions = getYearOptions();

  const [signUp, { isLoading, isError, error }] = useStudentSignUpMutation();
  const toast = useToast();

  const form = useForm<studentSignUpValues>({
    resolver: zodResolver(studentSignUpSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      registrationNo: {
        session: "SP",
        year: yearOptions[yearOptions.length - 1],
        degree: DEGREES[0].value,
        rollNumber: "",
      },
    },
  });

  const onSubmit = async (values: studentSignUpValues) => {
    const formattedRegistrationNumber = `${values.registrationNo.session}${values.registrationNo.year}-${values.registrationNo.degree}-${values.registrationNo.rollNumber}`;

    const response = await signUp({
      email: values.email,
      password: values.password,
      firstName: values.firstName,
      lastName: values.lastName,
      registrationNumber: formattedRegistrationNumber,
    });

    if (!("error" in response) && response.data) {
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

        <FormControl isInvalid={!!form.formState.errors.email} isRequired>
          <Controller
            control={form.control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                variant="outline"
                className="border border-neutral-300 rounded-lg h-11"
              >
                <InputField
                  placeholder="Email"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </Input>
            )}
          />
          <FormControlError>
            <FormControlErrorText>
              {form.formState.errors.email?.message}
            </FormControlErrorText>
          </FormControlError>
        </FormControl>

        <FormControl isRequired>
          <HStack className="w-full gap-1">
            {/* Term Selector */}
            <Controller
              control={form.control}
              name="registrationNo.session"
              render={({ field: { onChange, value } }) => (
                <Select onValueChange={onChange} className="flex-1 min-w-0">
                  <SelectTrigger
                    variant="outline"
                    className="h-11 border-neutral-300 rounded-lg"
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
                      <SelectItem label="SP" value="SP" />
                      <SelectItem label="FA" value="FA" />
                    </SelectContent>
                  </SelectPortal>
                </Select>
              )}
            />

            {/* Year Selector */}
            <Controller
              control={form.control}
              name="registrationNo.year"
              render={({ field: { onChange, value } }) => (
                <Select onValueChange={onChange} className="flex-1 min-w-0">
                  <SelectTrigger
                    variant="outline"
                    className="h-11 border-neutral-300 rounded-lg"
                  >
                    <SelectInput value={value} />
                    <SelectIcon className="mr-2" as={ChevronDownIcon} />
                  </SelectTrigger>
                  <SelectPortal>
                    <SelectBackdrop />
                    <SelectContent className="max-h-[50vh]">
                      <SelectDragIndicatorWrapper>
                        <SelectDragIndicator />
                      </SelectDragIndicatorWrapper>
                      <ScrollView className="w-full">
                        {yearOptions.map((year) => (
                          <SelectItem key={year} label={year} value={year} />
                        ))}
                      </ScrollView>
                    </SelectContent>
                  </SelectPortal>
                </Select>
              )}
            />

            {/* Degree Selector */}
            <Controller
              control={form.control}
              name="registrationNo.degree"
              render={({ field: { onChange, value } }) => (
                <Select onValueChange={onChange} className="flex-1 min-w-0">
                  <SelectTrigger
                    variant="outline"
                    className="h-11 border-neutral-300 rounded-lg"
                  >
                    <SelectInput value={value} />
                    <SelectIcon className="mr-2" as={ChevronDownIcon} />
                  </SelectTrigger>
                  <SelectPortal>
                    <SelectBackdrop />
                    <SelectContent className="max-h-[50vh]">
                      <SelectDragIndicatorWrapper>
                        <SelectDragIndicator />
                      </SelectDragIndicatorWrapper>
                      <ScrollView className="w-full">
                        {DEGREES.map((degree) => (
                          <SelectItem
                            key={degree.value}
                            label={degree.value}
                            value={degree.value}
                          />
                        ))}
                      </ScrollView>
                    </SelectContent>
                  </SelectPortal>
                </Select>
              )}
            />

            <Controller
              control={form.control}
              name="registrationNo.rollNumber"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  variant="outline"
                  className="flex-1 min-w-0 h-11 border border-neutral-300 rounded-lg"
                >
                  <InputField
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    keyboardType="numeric"
                  />
                </Input>
              )}
            />
          </HStack>
          {(form.formState.errors.registrationNo?.session ||
            form.formState.errors.registrationNo?.year ||
            form.formState.errors.registrationNo?.degree ||
            form.formState.errors.registrationNo?.rollNumber) && (
            <FormControlError>
              <FormControlErrorText>
                {form.formState.errors.registrationNo.year?.message ||
                  form.formState.errors.registrationNo.session?.message ||
                  form.formState.errors.registrationNo.degree?.message ||
                  form.formState.errors.registrationNo.rollNumber?.message}
              </FormControlErrorText>
            </FormControlError>
          )}
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
