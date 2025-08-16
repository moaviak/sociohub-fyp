import { Notification } from "@/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface NotificationsState {
  notifications: Notification[] | null;
  unreadCount: number;
}

const initialState: NotificationsState = {
  notifications: null,
  unreadCount: 0,
};

const notificationsSlice = createSlice({
  name: "notificationSlice",
  initialState,
  reducers: {
    setNotifications: (state, action: PayloadAction<Notification[] | null>) => {
      state.notifications = action.payload;
    },
    setUnreadCount: (state, action: PayloadAction<number>) => {
      state.unreadCount = action.payload;
    },
    addNotification: (state, action: PayloadAction<Notification>) => {
      if (!state.notifications) {
        state.notifications = [action.payload];
      } else {
        // Add the new notification at the beginning of the array
        state.notifications = [action.payload, ...state.notifications];
      }
      state.unreadCount += 1;
    },
    markNotificationAsRead: (state, action: PayloadAction<string>) => {
      if (state.notifications) {
        const index = state.notifications.findIndex(
          (notification) => notification.id === action.payload
        );
        if (index !== -1 && !state.notifications[index].isRead) {
          state.notifications[index].isRead = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      }
    },
  },
});

export const {
  setNotifications,
  setUnreadCount,
  addNotification,
  markNotificationAsRead,
} = notificationsSlice.actions;

export default notificationsSlice.reducer;
