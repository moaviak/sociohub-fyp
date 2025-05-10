import { Society } from "@/types";
import { api } from "@/features/api";
import { RootState } from "@/app/store";

import {
  login,
  logout,
  setAuthChecked,
  setSociety,
  verifyEmail,
} from "./slice";
import { ApiResponse } from "../api-response";
import { AuthResponse, SocietyAdvisor } from "./types";
import ApiError, { ApiErrorResponse, createApiError } from "../api-error";

export const AuthApi = api.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<
      AuthResponse | ApiError,
      { email?: string; registrationNumber?: string; password: string }
    >({
      query: ({ email, registrationNumber, password }) => ({
        url: "/auth/login",
        method: "POST",
        body: { email, registrationNumber, password },
      }),
      transformResponse: (response: ApiResponse<AuthResponse>) => {
        if (response.success) {
          return response.data;
        } else {
          return createApiError(response.message);
        }
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(
          errorResponse.message,
          {
            status: errorResponse.statusCode,
            data: errorResponse.errors,
          },
          errorResponse
        );
      },
      onQueryStarted: (_, { dispatch, queryFulfilled }) => {
        queryFulfilled.then(({ data }) => {
          if (!("error" in data)) {
            const authData = {
              ...data,
              accessToken: data.accessToken || null,
              refreshToken: data.refreshToken || null,
            };
            dispatch(login(authData));
          }
        });
      },
    }),
    studentSignUp: builder.mutation<
      AuthResponse | ApiError,
      {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        registrationNumber: string;
      }
    >({
      query: (credentials) => ({
        url: "/student",
        method: "POST",
        body: credentials,
      }),
      transformResponse: (response: ApiResponse<AuthResponse>) => {
        if (response.success) {
          return response.data;
        }
        return createApiError(response.message);
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(
          errorResponse.message,
          {
            status: errorResponse.statusCode,
            data: errorResponse.errors,
          },
          errorResponse
        );
      },
      onQueryStarted: (_, { dispatch, queryFulfilled }) => {
        queryFulfilled.then(({ data }) => {
          if (!("error" in data)) {
            const authData = {
              ...data,
              accessToken: data.accessToken || null,
              refreshToken: data.refreshToken || null,
            };
            dispatch(login(authData));
          }
        });
      },
    }),
    verifyEmail: builder.mutation<AuthResponse | ApiError, { otp: string }>({
      query: ({ otp }) => ({
        url: "/auth/verify-email",
        method: "POST",
        body: { code: otp },
      }),
      transformResponse: (response: ApiResponse<AuthResponse>) => {
        if (response.success) {
          return response.data;
        }
        return createApiError(response.message);
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(
          errorResponse.message,
          {
            status: errorResponse.statusCode,
            data: errorResponse.errors,
          },
          errorResponse
        );
      },
      onQueryStarted: (_, { dispatch, queryFulfilled }) => {
        queryFulfilled.then(({ data }) => {
          if (!("error" in data)) {
            dispatch(verifyEmail());
          }
        });
      },
    }),

    resendEmail: builder.mutation<null | ApiError, null>({
      query: () => ({
        url: "/auth/resend-email-verification",
        method: "POST",
      }),
      transformResponse: (response: ApiResponse<null>) => {
        if (response.success) {
          return response.data;
        }
        return createApiError(response.message);
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(
          errorResponse.message,
          {
            status: errorResponse.statusCode,
            data: errorResponse.errors,
          },
          errorResponse
        );
      },
    }),
    getUser: builder.query<AuthResponse | ApiError, null>({
      query: () => ({
        url: "/auth/me",
        method: "GET",
      }),
      transformResponse: (response: ApiResponse<AuthResponse>) => {
        if (response.success) {
          return response.data;
        }
        return createApiError(response.message);
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
      onQueryStarted: (_, { dispatch, queryFulfilled, getState }) => {
        queryFulfilled.then(({ data }) => {
          if (!("error" in data)) {
            const state = getState() as RootState;
            const { accessToken, refreshToken } = state.auth;

            const authData = {
              ...data,
              accessToken: accessToken || data.accessToken,
              refreshToken: refreshToken || data.refreshToken,
            };

            dispatch(login(authData));
          } else {
            dispatch(logout());
          }

          dispatch(setAuthChecked(true));
        });
        queryFulfilled.catch(() => {
          dispatch(logout());
          dispatch(setAuthChecked(true));
        });
      },
      providesTags: ["Auth"],
    }),
    logout: builder.mutation<void | ApiError, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
      transformResponse: (response: ApiResponse<void>) => {
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
        queryFulfilled.then(() => {
          // This will clear tokens from localStorage via the reducer
          dispatch(logout());
          dispatch(api.util.resetApiState());
        });
      },
    }),
    getAdvisorsList: builder.query<SocietyAdvisor[] | ApiError, null>({
      query: () => ({
        url: "/advisor/list",
        method: "GET",
      }),
      transformResponse: (response: ApiResponse<SocietyAdvisor[]>) => {
        if (response.success) {
          return response.data;
        }
        return createApiError(response.message);
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
    }),
    advisorSignUp: builder.mutation<AuthResponse | ApiError, FormData>({
      query: (credentials) => ({
        url: "/advisor",
        method: "POST",
        body: credentials,
      }),
      transformResponse: (response: ApiResponse<AuthResponse>) => {
        if (response.success) {
          return response.data;
        }
        return createApiError(response.message);
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(
          errorResponse.message,
          {
            status: errorResponse.statusCode,
            data: errorResponse.errors,
          },
          errorResponse
        );
      },
      onQueryStarted: (_, { dispatch, queryFulfilled }) => {
        queryFulfilled.then(({ data }) => {
          if (!("error" in data)) {
            const authData = {
              ...data,
              accessToken: data.accessToken || null,
              refreshToken: data.refreshToken || null,
            };
            dispatch(login(authData));
          }
        });
      },
    }),
    createSociety: builder.mutation<Society | ApiError, FormData>({
      query: (credentials) => ({
        url: "/society",
        method: "POST",
        body: credentials,
      }),
      transformResponse: (response: ApiResponse<Society>) => {
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
        queryFulfilled.then(({ data }) => {
          if (!("error" in data)) {
            dispatch(setSociety(data));
          }
        });
      },
    }),
  }),
});

export const {
  useLoginMutation,
  useStudentSignUpMutation,
  useVerifyEmailMutation,
  useResendEmailMutation,
  useGetUserQuery,
  useLogoutMutation,
  useGetAdvisorsListQuery,
  useAdvisorSignUpMutation,
  useCreateSocietyMutation,
} = AuthApi;
