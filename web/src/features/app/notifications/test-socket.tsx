import { useState, useEffect } from "react";
import { getSocket } from "@/lib/socket";
import { Button } from "@/components/ui/button";

/**
 * Hook to get socket connection status
 * Use this to detect if user is connected to the socket server
 */
export const useSocketStatus = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [socketId, setSocketId] = useState<string | null>(null);

  useEffect(() => {
    const checkConnection = () => {
      const socket = getSocket();
      if (socket) {
        setIsConnected(socket.connected);
        setSocketId(socket.id || null);
      } else {
        setIsConnected(false);
        setSocketId(null);
      }
    };

    // Check immediately
    checkConnection();

    // Set up an interval to check connection status
    const interval = setInterval(checkConnection, 3000);

    return () => clearInterval(interval);
  }, []);

  return { isConnected, socketId };
};

/**
 * Test component to verify socket.io connection works
 * You can add this to a page temporarily to test socket functionality
 */
export const SocketTester = () => {
  const [response, setResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notificationCount, setNotificationCount] = useState<number | null>(
    null
  );
  const { isConnected, socketId } = useSocketStatus();

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    // Listen for notification count updates
    const handleNotificationCount = (data: { count: number }) => {
      setNotificationCount(data.count);
      setResponse(JSON.stringify(data, null, 2));
    };

    socket.on("notification-count", handleNotificationCount);

    return () => {
      socket.off("notification-count", handleNotificationCount);
    };
  }, []);

  const handleGetNotifications = () => {
    const socket = getSocket();

    setError(null);

    if (!socket) {
      setError("Socket is not initialized. Make sure you're logged in.");
      return;
    }

    if (!socket.connected) {
      setError("Socket is not connected. Check your server connection.");
      return;
    }

    try {
      // Request notification count
      socket.emit("get-notification-count");
      console.log("Requested notification count");
    } catch (err) {
      console.error("Error requesting notifications:", err);
      setError(`Error: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 border rounded-lg shadow-sm bg-white">
      <div className="mb-4">
        <h2 className="text-lg font-bold mb-1">Socket.io Connection Tester</h2>
        <p className="text-sm text-gray-500">
          Test if your socket connection is working properly
        </p>
        <div
          className={`mt-2 text-sm ${
            isConnected ? "text-green-600" : "text-red-600"
          }`}
        >
          Status: {isConnected ? "Connected" : "Disconnected"}
        </div>
        {socketId && (
          <div className="text-xs text-gray-500 mt-1">
            Socket ID: {socketId}
          </div>
        )}
        {notificationCount !== null && (
          <div className="text-sm font-medium mt-2">
            Notification Count: {notificationCount}
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-4">
          {error}
        </div>
      )}

      {response && (
        <div className="bg-green-50 text-green-600 p-3 rounded-md text-sm mb-4">
          <p className="font-semibold">Response received:</p>
          <pre className="whitespace-pre-wrap overflow-auto max-h-[200px] text-xs mt-2">
            {response}
          </pre>
        </div>
      )}

      <div className="flex space-x-2">
        <Button
          onClick={handleGetNotifications}
          className="flex-1"
          disabled={!isConnected}
        >
          Get Notifications
        </Button>
      </div>
    </div>
  );
};
