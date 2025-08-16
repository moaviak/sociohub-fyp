// hooks/useDeepLinkHandler.ts
import { useEffect, useRef } from "react";
import { Linking } from "react-native";
import { useToastUtility } from "./useToastUtility";

interface DeepLinkParams {
  eventId?: string;
  session_id?: string;
  [key: string]: string | undefined;
}

interface UseDeepLinkHandlerOptions {
  onPaymentSuccess?: (params: DeepLinkParams) => void;
  onPaymentCancelled?: (params: DeepLinkParams) => void;
  onDeepLink?: (url: string, params: DeepLinkParams) => void;
  onToastShow?: (
    type: "success" | "warning" | "error",
    message: string
  ) => void;
}

export const useDeepLinkHandler = (options: UseDeepLinkHandlerOptions = {}) => {
  const { onPaymentSuccess, onPaymentCancelled, onDeepLink, onToastShow } =
    options;

  const isInitialMount = useRef(true);

  const parseUrlParams = (url: string): DeepLinkParams => {
    try {
      // Handle both custom scheme and https URLs
      let urlToParse = url;

      // If it's a custom scheme URL, we need to parse it differently
      if (url.includes("://") && !url.startsWith("http")) {
        // Convert "yourapp://payment-success?eventId=123" to proper URL format
        const parts = url.split("://");
        if (parts.length === 2) {
          const [, pathAndQuery] = parts;
          urlToParse = `https://sociohub.site/${pathAndQuery}`;
        }
      }

      const urlObj = new URL(urlToParse);
      const params: DeepLinkParams = {};

      // Get all search parameters
      urlObj.searchParams.forEach((value, key) => {
        params[key] = value;
      });

      return params;
    } catch (error) {
      return {};
    }
  };

  const getRouteFromUrl = (url: string): string => {
    try {
      if (url.includes("payment-success")) {
        return "payment-success";
      } else if (url.includes("payment-cancelled")) {
        return "payment-cancelled";
      }

      // Extract route from URL path
      const parts = url.split("://");
      if (parts.length === 2) {
        const pathPart = parts[1].split("?")[0]; // Remove query params
        return pathPart.replace(/^\/+/, ""); // Remove leading slashes
      }

      return "";
    } catch (error) {
      return "";
    }
  };

  const handleDeepLink = (url: string) => {
    const route = getRouteFromUrl(url);
    const params = parseUrlParams(url);

    // Call the general onDeepLink callback first
    onDeepLink?.(url, params);

    switch (route) {
      case "payment-success":
        onToastShow?.(
          "success",
          "Payment successful! You're registered for the event."
        );
        onPaymentSuccess?.(params);
        break;

      case "payment-cancelled":
        onToastShow?.(
          "warning",
          "Payment was cancelled. Registration incomplete."
        );
        onPaymentCancelled?.(params);
        break;

      default:
        break;
    }
  };

  useEffect(() => {
    let subscription: any;

    const setupDeepLinking = async () => {
      try {
        // Handle initial URL (when app is opened from a deep link)
        const initialUrl = await Linking.getInitialURL();

        // Only process initial URL if it's not the first mount to avoid
        // processing the same URL multiple times during app startup
        if (initialUrl && !isInitialMount.current) {
          handleDeepLink(initialUrl);
        }

        // Handle URLs when app is already open
        subscription = Linking.addEventListener("url", ({ url }) => {
          handleDeepLink(url);
        });
      } catch (error) {
      } finally {
        isInitialMount.current = false;
      }
    };

    setupDeepLinking();

    // Cleanup subscription on unmount
    return () => {
      subscription?.remove();
    };
  }, [onPaymentSuccess, onPaymentCancelled, onDeepLink, onToastShow]);

  // Return utility functions that might be useful
  return {
    parseUrlParams,
    getRouteFromUrl,
  };
};
