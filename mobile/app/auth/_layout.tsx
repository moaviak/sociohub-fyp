import { useAppSelector } from "@/store/hooks";
import { UserType } from "@/types";
import { router, Stack, usePathname } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { View } from "react-native";

export default function AuthLayout() {
  const { isAuthenticated, isAuthChecked, user, userType } = useAppSelector(
    (state) => state.auth
  );
  const pathname = usePathname();

  const isVerifyEmail = pathname === "/auth/verify-email";
  const isSocietyForm = pathname === "/auth/society-form";
  const isSignIn = pathname === "/auth/sign-in";
  const isSignUp = pathname.startsWith("/auth/sign-up");

  useEffect(() => {
    if (!isAuthChecked) {
      return;
    }

    if ((isVerifyEmail || isSocietyForm) && !isAuthenticated) {
      router.replace("/auth/sign-in");
      return;
    }

    // If user is fully authenticated and on a public route, redirect to dashboard
    if (isAuthenticated && (isSignIn || isSignUp)) {
      // Check if user has completed all required steps
      if (user && user.isEmailVerified) {
        if (userType === UserType.ADVISOR && !(user as Advisor).societyId) {
          router.replace("/auth/society-form");
        } else {
          // All steps completed, go to dashboard
          router.replace("/");
        }
      } else if (user && !user.isEmailVerified) {
        router.replace("/auth/verify-email");
      }
    }

    // Additional check for the verify email and society form routes
    if (isAuthenticated && user) {
      // If email is verified and on verify email page, redirect to appropriate next step
      if (isVerifyEmail && user.isEmailVerified) {
        if (userType === UserType.ADVISOR && !(user as Advisor).societyId) {
          router.replace("/auth/society-form");
        } else {
          router.replace("/");
        }
      }

      // If society is created and on society form page, redirect to dashboard
      if (
        isSocietyForm &&
        userType === UserType.ADVISOR &&
        (user as Advisor).societyId
      ) {
        router.replace("/");
      }
    }
  });

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="sign-in" />
        <Stack.Screen name="verify-email" />
        <Stack.Screen name="society-form" />
        <Stack.Screen name="sign-up-path" />
        <Stack.Screen name="sign-up-advisor" />
        <Stack.Screen name="sign-up-student" />
      </Stack>
    </View>
  );
}
