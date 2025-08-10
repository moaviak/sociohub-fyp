import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import { useFonts } from "expo-font";
import { Stack, useRouter } from "expo-router";
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
import {
  useHandlePaymentSuccessMutation,
  useRefreshAuthMutation,
} from "@/store/api";
import { useToastUtility } from "@/hooks/useToastUtility";
import { useDeepLinkHandler } from "@/hooks/useDeepLinkHandler";
import { Text, TouchableOpacity, View } from "react-native";
import { ArrowLeft, Menu } from "lucide-react-native";

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

  const router = useRouter();
  const { showSuccessToast, showWarningToast, showErrorToast } =
    useToastUtility();
  const [handlePaymentSuccess] = useHandlePaymentSuccessMutation();

  // Use the deep link handler hook
  useDeepLinkHandler({
    onPaymentSuccess: async (params) => {
      console.log("Payment success for session_id: ", params.session_id);

      if (params.session_id) {
        const result = await handlePaymentSuccess({
          sessionId: params.session_id,
        }).unwrap();

        if (result.status === "COMPLETED") {
          showSuccessToast("Payment successful! Registration confirmed.");
        } else {
          showErrorToast("Payment processing failed");
        }
      }
    },

    onPaymentCancelled: (params) => {
      console.log("Payment cancelled for event:", params.eventId);

      if (params.eventId) {
        router.push({
          pathname: "/event/[id]",
          params: { id: params.eventId },
        });
      }
    },

    onDeepLink: (url, params) => {
      // This is called for ANY deep link, useful for logging or analytics
      console.log("Deep link opened:", url, params);
    },

    onToastShow: (type, message) => {
      switch (type) {
        case "success":
          showSuccessToast(message);
          break;
        case "warning":
          showWarningToast(message);
          break;
        case "error":
          showErrorToast(message);
          break;
      }
    },
  });

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
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="auth" options={{ headerShown: false }} />
            <Stack.Screen
              name="(student-tabs)"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="(advisor-tabs)"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="society/[id]"
              options={{ header: () => <Header title="Society Profile" /> }}
            />
            <Stack.Screen
              name="profile/[id]"
              options={{ header: () => <Header title="User Profile" /> }}
            />
            <Stack.Screen
              name="event/[id]"
              options={{ header: () => <Header title="Event Details" /> }}
            />
          </Stack>
          <StatusBar style="auto" />
        </GluestackUIProvider>
      </AuthProvider>
    </Provider>
  );
}

const Header = ({ title }: { title: string }) => {
  const router = useRouter();

  return (
    <View className="flex-row items-center px-4 py-3 bg-white border-b border-neutral-300">
      <TouchableOpacity
        onPress={() => router.back()}
        className="mr-3 p-2 -ml-2"
        activeOpacity={0.7}
      >
        <ArrowLeft size={20} color="#333" />
      </TouchableOpacity>
      <Text className="text-xl font-heading font-bold flex-1">{title}</Text>
    </View>
  );
};
