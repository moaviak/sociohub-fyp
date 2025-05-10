import { api } from "@/features/api";
import ApiError, {
  ApiErrorResponse,
  createApiError,
} from "@/features/api-error";
import { ApiResponse } from "@/features/api-response";
import { Notification } from "@/types";
import { setNotifications } from "./slice";

export const notificationApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<
      | {
          notifications: Notification[];
          totalPages: number;
          currentPage: number;
          totalCount: number;
        }
      | ApiError,
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
        if (response.success) {
          return response.data;
        }
        return createApiError(response.message);
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
      providesTags: (result) => {
        if (result && !("error" in result)) {
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
      Notification | ApiError,
      { notificationId: string }
    >({
      query: ({ notificationId }) => ({
        url: `/notifications/${notificationId}`,
        method: "DELETE",
      }),
      transformResponse: (response: ApiResponse<Notification>) => {
        if (response.success) {
          return response.data;
        }
        return createApiError(response.message);
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
      invalidatesTags: (result) => {
        if (result && !("error" in result)) {
          return [{ type: "Notifications", id: result.id }];
        } else {
          return [{ type: "Notifications", id: "LIST" }];
        }
      },
    }),
  }),
});

export const { useGetNotificationsQuery, useDeleteNotificationMutation } =
  notificationApi;
