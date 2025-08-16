import { Notification, PushToken } from "@/types";
import { setNotifications } from "./slice";
import { api } from "@/store/api";
import { ApiResponse } from "@/store/api-response";
import { ApiErrorResponse, createApiError } from "@/store/api-error";

export enum DevicePlatform {
  ANDROID = "ANDROID",
  IOS = "IOS",
  WEB = "WEB",
  EXPO = "EXPO",
  UNKNOWN = "UNKNOWN",
}

export const notificationApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<
      {
        notifications: Notification[];
        totalPages: number;
        currentPage: number;
        totalCount: number;
      },
      void
    >({
      query: () => ({
        url: "/notifications?includeRead=true",
      }),
      transformResponse: (
        response: ApiResponse<{
          notifications: Notification[];
          totalPages: number;
          currentPage: number;
          totalCount: number;
        }>
      ) => {
        return response.data;
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
      providesTags: (result) => {
        if (result) {
          return [
            ...result.notifications.map((notification) => ({
              type: "Notifications" as const,
              id: notification.id,
            })),
            { type: "Notifications", id: "LIST" },
          ];
        } else {
          return [];
        }
      },
      onQueryStarted: (_, { dispatch, queryFulfilled }) => {
        queryFulfilled.then(({ data }) => {
          if (!("error" in data)) {
            dispatch(setNotifications(data.notifications));
          }
        });
      },
    }),
    deleteNotification: builder.mutation<
      Notification,
      { notificationId: string }
    >({
      query: ({ notificationId }) => ({
        url: `/notifications/${notificationId}`,
        method: "DELETE",
      }),
      transformResponse: (response: ApiResponse<Notification>) => {
        return response.data;
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
      invalidatesTags: (result) => {
        if (result) {
          return [{ type: "Notifications", id: result.id }];
        } else {
          return [{ type: "Notifications", id: "LIST" }];
        }
      },
    }),
    storePushToken: builder.mutation<
      PushToken,
      {
        token: string;
        deviceId?: string;
        platform?: DevicePlatform;
        meta?: any;
      }
    >({
      query: (data) => ({
        url: "/notifications/push-token",
        method: "POST",
        body: { ...data },
      }),
      transformResponse: (response: ApiResponse<PushToken>) => {
        return response.data;
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useDeleteNotificationMutation,
  useGetPaymentStatusQuery,
} = notificationApi;
