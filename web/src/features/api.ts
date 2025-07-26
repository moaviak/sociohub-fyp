import { FetchArgs } from "@reduxjs/toolkit/query";
import { BaseQueryFn } from "@reduxjs/toolkit/query";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "@/app/store";
import { logout, setCredentials } from "./auth/slice";
import { hasRefreshToken } from "./auth/storage";
import { ApiResponse } from "./api-response";
import ApiError, { ApiErrorResponse, createApiError } from "./api-error";

interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_REACT_APP_API_URL,
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    // Get the token from the Redux store
    const token = (getState() as RootState).auth.accessToken;

    // If we have a token, add it to the headers
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    return headers;
  },
});

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && "status" in result.error) {
    const { status } = result.error;
    // Handle 401 Unauthorized errors
    if (status === 401) {
      // Try to refresh the token
      const refreshResult = await baseQuery(
        { url: "/auth/refresh", method: "POST" },
        api,
        extraOptions
      );

      if (refreshResult.data) {
        // Retry the original request
        const { accessToken, refreshToken } = (
          refreshResult.data as ApiResponse<RefreshTokenResponse>
        ).data;
        console.log(refreshResult);
        api.dispatch(setCredentials({ accessToken, refreshToken }));
        result = await baseQuery(args, api, extraOptions);
      } else {
        api.dispatch(logout());
      }
    }
  }

  return result;
};

export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    "Auth",
    "Societies",
    "Requests",
    "Members",
    "Roles",
    "Notifications",
    "Events",
    "Users",
    "Announcements",
    "Tasks",
    "Meetings",
    "OnboardingStatus",
    "PaymentIntent",
    "Chat",
    "Posts",
    "Teams",
    "TeamRequests",
  ],
  endpoints: (builder) => ({
    refreshAuth: builder.mutation<RefreshTokenResponse | ApiError, void>({
      query: () => ({
        url: `/auth/refresh`,
        method: "POST",
      }),
      transformResponse: (response: ApiResponse<RefreshTokenResponse>) => {
        if (response.success) {
          return response.data;
        }
        return createApiError(response.message);
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
      onQueryStarted: (_, { dispatch, queryFulfilled }) => {
        if (!hasRefreshToken()) {
          dispatch(logout());
          return;
        }

        queryFulfilled
          .then((result) => {
            if (!("error" in result)) {
              dispatch(setCredentials(result.data));
            } else {
              dispatch(logout());
            }
          })
          .catch(() => {
            dispatch(logout());
          });
      },
    }),
  }),
});

export const { useRefreshAuthMutation } = api;
