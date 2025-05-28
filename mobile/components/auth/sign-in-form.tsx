import { useEffect, useState } from "react";
import { Link } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Text, TouchableOpacity, ScrollView } from "react-native";

import { VStack } from "../ui/vstack";
import { HStack } from "../ui/hstack";
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
} from "../ui/select";
import { DEGREES } from "@/data";
import { Button } from "../ui/button";
import { getYearOptions } from "@/lib/utils";
import { Input, InputField, InputIcon, InputSlot } from "../ui/input";
import { ChevronDownIcon, EyeIcon, EyeOffIcon } from "../ui/icon";
import { signInSchema, signInValues } from "@/schema";
import {
  FormControl,
  FormControlError,
  FormControlErrorText,
} from "../ui/form-control";
import { useLoginMutation } from "@/store/auth/api";
import { Toast, ToastDescription, ToastTitle, useToast } from "../ui/toast";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ApiError from "@/store/api-error";
import { AuthResponse } from "@/types/type";

export const SignInForm = () => {
  const [selectedTab, setSelectedTab] = useState<"Advisor" | "Student">(
    "Advisor"
  );
  const [showPassword, setShowPassword] = useState(false);
  const yearOptions = getYearOptions();

  const toast = useToast();
  const router = useRouter();

  const [login, { isLoading, error, isError }] = useLoginMutation();

  const form = useForm<signInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      userType: "Advisor",
      email: "",
      registrationNo: {
        session: "SP",
        year: yearOptions[yearOptions.length - 1],
        degree: DEGREES[0].value,
        rollNumber: undefined,
      },
      password: "",
    },
  });

  const onSubmit = async (values: signInValues) => {
    const formattedRegistrationNumber = values.registrationNo?.rollNumber
      ? `${values.registrationNo?.session}${values.registrationNo?.year}-${values.registrationNo?.degree}-${values.registrationNo?.rollNumber}`
      : undefined;

    const response = await login({
      email: values.email || undefined,
      registrationNumber: formattedRegistrationNumber,
      password: values.password,
    });

    if (!response.error) {
      const data = response.data as AuthResponse;
      if (!data.user.isEmailVerified) {
        router.replace("/auth/verify-email");
      } else if (data.user && "societyId" in data.user) {
        router.replace("/auth/society-form");
        AsyncStorage.setItem("societyName", data.user.societyName || "");
      } else {
        router.replace("/");
      }
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
    <VStack className="gap-y-8 max-w-full">
      {/* Tab Selector */}
      <HStack className="rounded-md overflow-hidden bg-gray-100">
        {["Advisor", "Student"].map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => {
              setSelectedTab(tab as "Advisor" | "Student");
              form.reset();
              form.setValue("userType", tab as "Advisor" | "Student");
            }}
            className={`flex-1 items-center py-2 ${
              selectedTab === tab
                ? "bg-white border-b-2 border-primary-500"
                : "bg-neutral-100"
            }`}
          >
            <Text
              className={`font-medium font-body ${
                selectedTab === tab ? "text-primary-500" : "text-neutral-500"
              }`}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </HStack>

      <VStack className="gap-y-4">
        {/* Conditional Fields */}
        {selectedTab === "Advisor" ? (
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
        ) : (
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
        )}

        {/* Password Field */}
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

        {/* Remember Me & Forgot */}
        <HStack className="justify-end items-center">
          <Text className="text-sm text-primary-500">Forgot Password?</Text>
        </HStack>
      </VStack>

      {/* Submit Button */}
      <Button
        className="bg-primary-500 rounded-md"
        size="xl"
        onPress={form.handleSubmit(onSubmit)}
        isDisabled={isLoading}
      >
        <Text className="text-white font-semibold">Sign In</Text>
      </Button>

      <Link href="/auth/sign-up-path" className="text-center">
        <Text className="text-neutral-400 font-body">
          Don't have an account?{" "}
        </Text>
        <Text className="text-primary-500 font-body">Sign Up</Text>
      </Link>
    </VStack>
  );
};
