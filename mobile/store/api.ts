import { FetchArgs } from "@reduxjs/toolkit/query";
import { BaseQueryFn } from "@reduxjs/toolkit/query";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { logout, setCredentials } from "./auth/slice";
import { RootState } from ".";
import ApiError, { ApiErrorResponse, createApiError } from "./api-error";
import { ApiResponse } from "./api-response";
import { hasRefreshToken } from "./storage";

interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.EXPO_PUBLIC_API_URL,
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken;

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
        {
          url: "/auth/refresh",
          method: "POST",
          body: {
            refreshToken: (api.getState() as RootState).auth.refreshToken,
          },
        },
        api,
        extraOptions
      );

      if (refreshResult.data) {
        // Retry the original request
        const { accessToken, refreshToken } =
          refreshResult.data as RefreshTokenResponse;
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
  tagTypes: ["Auth", "Societies", "Requests", "Members", "Roles"],
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
      onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
        if (!(await hasRefreshToken())) {
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
