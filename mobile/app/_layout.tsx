import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, ReactNode } from "react";
import "react-native-reanimated";

import "@/global.css";
import { Provider } from "react-redux";
import { store } from "@/store";
import { useGetUserQuery } from "@/store/auth/api";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setAuthChecked, initializeAuth } from "@/store/auth/slice";
import { useRefreshAuthMutation } from "@/store/api";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Separate component for auth checking that will be rendered inside the Provider
interface AuthProviderProps {
  children: ReactNode;
}

const AuthProvider = ({ children }: AuthProviderProps) => {
  const dispatch = useAppDispatch();
  const { accessToken, refreshToken, isTokenLoading } = useAppSelector(
    (state) => state.auth
  );

  useEffect(() => {
    // Initialize tokens on mount
    dispatch(initializeAuth());
  }, [dispatch]);

  const [refreshAuth, { isLoading: isRefreshing }] = useRefreshAuthMutation();
  const { isLoading, refetch } = useGetUserQuery(null, {
    skip: (!accessToken && !refreshToken && !isRefreshing) || isTokenLoading,
    refetchOnMountOrArgChange: true,
  });

  // Try to refresh token if we have a refresh token but no access token
  useEffect(() => {
    const attemptTokenRefresh = async () => {
      // Only try to refresh if we have a refresh token but no access token
      if (!accessToken && refreshToken) {
        const refreshed = await refreshAuth();

        if (refreshed) {
          // If refresh successful, trigger the user query
          refetch();
        }
      }
    };

    attemptTokenRefresh();
  }, [accessToken, refreshToken, refetch, refreshAuth]);

  useEffect(() => {
    if (!isLoading && !isRefreshing && !isTokenLoading) {
      dispatch(setAuthChecked(true));
    }
  }, [isLoading, isRefreshing, isTokenLoading, dispatch]);

  return children;
};

export default function RootLayout() {
  const [loaded] = useFonts({
    "Poppins-Black": require("../assets/fonts/Poppins-Black.ttf"),
    "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
    "Poppins-ExtraBold": require("../assets/fonts/Poppins-ExtraBold.ttf"),
    "Poppins-ExtraLight": require("../assets/fonts/Poppins-ExtraLight.ttf"),
    "Poppins-Light": require("../assets/fonts/Poppins-Light.ttf"),
    "Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
    "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-SemiBold": require("../assets/fonts/Poppins-SemiBold.ttf"),
    "Poppins-Thin": require("../assets/fonts/Poppins-Thin.ttf"),
    "DMSans-Black": require("../assets/fonts/DMSans-Black.ttf"),
    "DMSans-Bold": require("../assets/fonts/DMSans-Bold.ttf"),
    "DMSans-ExtraBold": require("../assets/fonts/DMSans-ExtraBold.ttf"),
    "DMSans-ExtraLight": require("../assets/fonts/DMSans-ExtraLight.ttf"),
    "DMSans-Light": require("../assets/fonts/DMSans-Light.ttf"),
    "DMSans-Medium": require("../assets/fonts/DMSans-Medium.ttf"),
    "DMSans-Regular": require("../assets/fonts/DMSans-Regular.ttf"),
    "DMSans-SemiBold": require("../assets/fonts/DMSans-SemiBold.ttf"),
    "DMSans-Thin": require("../assets/fonts/DMSans-Thin.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <Provider store={store}>
      <AuthProvider>
        <GluestackUIProvider mode="light">
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="auth" />
            <Stack.Screen name="(student-tabs)" />
            <Stack.Screen name="(advisor-tabs)" />
            <Stack.Screen name="society/[id]" />
            <Stack.Screen name="profile/[id]" />
          </Stack>
          <StatusBar style="auto" />
        </GluestackUIProvider>
      </AuthProvider>
    </Provider>
  );
}
