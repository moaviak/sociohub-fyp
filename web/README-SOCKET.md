# Socket.io Notifications Setup and Troubleshooting

## Overview

The notification system uses Socket.io to provide real-time notifications. This document provides guidance on setting up and troubleshooting socket connections.

## How It Works

1. When a user logs in, the socket connection is established in the `NotificationSocketProvider` component
2. The socket connects to the server using the authentication token
3. When a new notification is received, it's added to the Redux store
4. The notification bell in the UI shows the unread count and displays the notifications

## Common Issues and Solutions

### Socket Not Connecting

If the socket isn't connecting, check the following:

1. **Authentication**: Make sure the user is logged in and the authentication token is available

   - The socket provider requires an authentication token from Redux
   - The user data is extracted from the token on the backend

2. **API URL**: Verify that the API URL is correct

   - The socket connects to the base URL, not to a specific endpoint
   - In `src/lib/socket.ts`, check the `baseUrl` variable
   - Default is `http://localhost:3000` but should match your server

3. **CORS Issues**: The server must allow connections from your frontend domain

   - In development, the server should allow connections from `http://localhost:5173` (or your dev port)
   - Check the server logs for CORS errors

4. **Transport Protocol**: The socket tries both WebSocket and HTTP long-polling
   - If your network blocks WebSockets, it will fall back to polling
   - Check the browser console for transport-related messages

### Debugging Socket Connections

We've included debugging tools to help diagnose socket issues:

1. **Socket Debugger**: A small floating panel shows on the bottom right of the app in development mode

   - Shows current connection status and socket ID
   - Allows sending a manual ping to test connectivity

2. **Socket Tester Component**: You can temporarily add the `SocketTester` component to a page

   ```jsx
   import { SocketTester } from "@/features/app/notifications/test-socket";

   // Then in your component:
   return (
     <div>
       <h1>Your Page</h1>
       <SocketTester />
     </div>
   );
   ```

3. **Console Messages**: Check your browser console for socket-related logs
   - Connection status messages
   - Error details
   - Event data

## Server-Side Requirements

The server should implement these Socket.io events:

1. `get-notification-count` - Client requests notification count
2. `notification-count` - Server sends notification count to client
3. `mark-notification-read` - Client marks a notification as read
4. `new-notification` - Server sends new notification to client

## Adapting the Code

If your backend uses different event names:

1. Open `src/features/app/notifications/socket-provider.tsx`
2. Update the event names in the socket.on() calls to match your backend
3. Update the event names in socket.emit() calls

## Socket Status Hook

You can use the `useSocketStatus` hook in any component to check if the socket is connected:

```jsx
import { useSocketStatus } from "@/features/app/notifications/test-socket";

const YourComponent = () => {
  const { isConnected, socketId } = useSocketStatus();

  return (
    <div>{isConnected ? "Connected to notifications" : "Disconnected"}</div>
  );
};
```
