import { useEffect, useState, useCallback, useRef } from "react";
import { useDispatch } from "react-redux";
import { useAppSelector } from "@/app/hooks";

import { initializeSocket, getSocket, disconnectSocket } from "@/lib/socket";
import { addNotification, setUnreadCount } from "@/features/app/topbar/slice";
import { Notification } from "@/types";
import { toast } from "./components/notification-toast";

export const NotificationSocketProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const dispatch = useDispatch();
  const [socketInitialized, setSocketInitialized] = useState(false);
  const [, setConnectionError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const previousTokenRef = useRef<string | null>(null);
  const authErrorRef = useRef(false);

  // Get authentication token from Redux
  const { accessToken: token } = useAppSelector((state) => state.auth);

  const initializeSocketConnection = useCallback(() => {
    if (!token) {
      if (socketInitialized) {
        disconnectSocket();
        setSocketInitialized(false);
      }
      return;
    }

    // Reset auth error if token has changed
    if (previousTokenRef.current !== token) {
      authErrorRef.current = false;
      previousTokenRef.current = token;
    }

    // Don't try to connect if we had an auth error
    if (authErrorRef.current) {
      return;
    }

    try {
      // Initialize socket connection with just the token
      const socket = initializeSocket(token);
      setSocketInitialized(true);
      setConnectionError(null);
      setRetryCount(0); // Reset retry count on successful connection

      // Listen for notification count updates
      socket.on("notification-count", (data: { count: number }) => {
        dispatch(setUnreadCount(data.count));
      });

      // Listen for new notifications
      socket.on("new-notification", (notification: Notification) => {
        dispatch(addNotification(notification));
        toast(notification);
      });

      // Listen for connection errors
      socket.on("connect_error", (error) => {
        console.error("Socket connection error:", error.message);
        if (error.message.includes("Authentication error")) {
          // TODO: Try refetching the tokens
          setConnectionError("Authentication failed. Please log in again.");
          authErrorRef.current = true;
          disconnectSocket();
          setSocketInitialized(false);
        }
      });

      // Listen for successful connection
      socket.on("connect", () => {
        console.log("Socket connected successfully");
        authErrorRef.current = false;
        // Request notification count on connect
        socket.emit("get-notification-count");
      });

      return () => {
        // Clean up socket listeners
        if (socket) {
          socket.off("notification-count");
          socket.off("new-notification");
          socket.off("connect_error");
          socket.off("connect");
        }
      };
    } catch (error) {
      console.error("Error initializing socket:", error);
      setConnectionError("Failed to connect to notification service");
    }
  }, [token, dispatch, socketInitialized]);

  // Effect for initial connection and token changes
  useEffect(() => {
    const cleanup = initializeSocketConnection();
    return cleanup;
  }, [initializeSocketConnection]);

  // Effect for retry mechanism
  useEffect(() => {
    if (
      !socketInitialized &&
      token &&
      retryCount < 3 &&
      !authErrorRef.current
    ) {
      const timer = setTimeout(() => {
        setRetryCount((prev) => prev + 1);
        initializeSocketConnection();
      }, 1000 * (retryCount + 1)); // Exponential backoff

      return () => clearTimeout(timer);
    }
  }, [socketInitialized, token, retryCount, initializeSocketConnection]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (socketInitialized) {
        disconnectSocket();
      }
    };
  }, [socketInitialized]);

  return <>{children}</>;
};

// Helper function to mark a notification as read
export const markNotificationRead = (notificationId: string) => {
  const socket = getSocket();
  if (socket) {
    socket.emit("mark-notification-read", { notificationId });
  }
};

// Debug component to add to your app during development
export const SocketDebugger = () => {
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  // Keep the component but reduce its functionality to minimum
  return null;
};
