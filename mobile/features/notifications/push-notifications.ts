import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { store } from "@/store";
import { DevicePlatform, notificationApi } from "./api";

export const initializePushNotifications = async () => {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
};

export const requestPermissionsAndGetToken = async () => {
  try {
    if (!Device.isDevice) {
      console.log("Push notifications only work on physical devices");
      return null;
    }

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus === Notifications.PermissionStatus.UNDETERMINED) {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== Notifications.PermissionStatus.GRANTED) {
      console.log("Permission not granted for push notifications");
      return null;
    }

    // Get push token
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
    });

    return tokenData.data;
  } catch (error) {
    console.error("Error getting push token:", error);
    return null;
  }
};

export const getOrCreateDeviceId = async () => {
  try {
    let deviceId = await AsyncStorage.getItem("DEVICE_ID");

    if (!deviceId) {
      // Generate unique device ID
      deviceId = `${Platform.OS}_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 9)}`;
      await AsyncStorage.setItem("DEVICE_ID", deviceId);
    }

    return deviceId;
  } catch (error) {
    console.error("Error managing device ID:", error);
    // Fallback device ID
    return `${Platform.OS}_fallback_${Date.now()}`;
  }
};

export const storePushTokenOnServer = async (token: string) => {
  try {
    const deviceId = await getOrCreateDeviceId();

    const response = await store
      .dispatch(
        notificationApi.endpoints.storePushToken.initiate({
          token,
          deviceId,
          platform:
            Platform.OS === "android"
              ? DevicePlatform.ANDROID
              : Platform.OS === "ios"
              ? DevicePlatform.IOS
              : Platform.OS === "web"
              ? DevicePlatform.WEB
              : Platform.OS === "macos" || Platform.OS === "windows"
              ? DevicePlatform.EXPO
              : DevicePlatform.UNKNOWN,
          meta: {
            platform: Platform.OS,
            appVersion: "1.0.0", // Get from app config
            deviceModel: Device.modelName,
            osVersion: Device.osVersion,
          },
        })
      )
      .unwrap();

    await AsyncStorage.setItem("PUSH_TOKEN", token);
    console.log("Push token stored successfully");
    return true;
  } catch (error) {
    console.error("Error storing push token:", error);
    return false;
  }
};

export const setupPushNotifications = async () => {
  try {
    const token = await requestPermissionsAndGetToken();

    if (token) {
      await storePushTokenOnServer(token);
    }
  } catch (error) {
    console.error("Error setting up push notifications:", error);
  }
};

export const getDeviceId = async () => {
  try {
    const deviceId = await AsyncStorage.getItem("DEVICE_ID");

    // Send deviceId with logout request so backend can clean up
    return deviceId;
  } catch (error) {
    console.error("Error getting device ID for logout:", error);
    return null;
  }
};

export const refreshTokenIfNeeded = async () => {
  try {
    const storedToken = await AsyncStorage.getItem("PUSH_TOKEN");
    const currentToken = await requestPermissionsAndGetToken();

    // If token changed, update server
    if (currentToken && storedToken !== currentToken) {
      await storePushTokenOnServer(currentToken);
    }
  } catch (error) {
    console.error("Error refreshing token:", error);
  }
};
