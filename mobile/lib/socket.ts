import { io, Socket } from "socket.io-client";

// Create a single socket instance
let socket: Socket | null = null;

// Initialize socket connection
export const initializeSocket = (token: string) => {
  if (socket) {
    // If socket exists but token changed, disconnect and reconnect
    const currentAuth = socket.auth as { token?: string };
    if (currentAuth.token !== token) {
      socket.disconnect();
      socket = null;
    } else {
      return socket;
    }
  }

  // Fix API URL - make sure it doesn't include /api at the end
  const baseUrl = process.env.EXPO_PUBLIC_SERVER_URL || "http://localhost:3000";

  socket = io(baseUrl, {
    auth: { token },
    extraHeaders: {
      Authorization: `Bearer ${token}`,
    },
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    transports: ["websocket", "polling"],
    // Add timeout to prevent hanging connections
    timeout: 10000,
  });

  socket.on("connect", () => {
    console.log("Socket connected successfully");
    // Request notification count on connect
    socket?.emit("get-notification-count");
  });

  socket.on("connect_error", (error) => {
    console.error("Socket connection error:", error.message);
    // If it's an authentication error, disconnect and prevent reconnection
    if (error.message.includes("Authentication error")) {
      socket?.disconnect();
      socket = null;
    }
  });

  socket.on("disconnect", (reason) => {
    console.log("Socket disconnected:", reason);
    // If disconnected due to server closing or auth error, don't try to reconnect
    if (
      reason === "io server disconnect" ||
      reason === "io client disconnect"
    ) {
      socket = null;
    }
  });

  return socket;
};

// Get the socket instance
export const getSocket = () => socket;

// Disconnect socket
export const disconnectSocket = () => {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
};
