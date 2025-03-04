import { api } from "@/features/api";

import { ApiResponse } from "../api-response";
import { AuthResponse, SocietyAdvisor } from "./types";
import { login, logout, updateCheckAuth } from "./slice";
import ApiError, { ApiErrorResponse, createApiError } from "../api-error";

export const AuthApi = api.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<
      AuthResponse | ApiError,
      { email?: string; username?: string; password: string }
    >({
      query: ({ email, username, password }) => ({
        url: "/auth/login",
        method: "POST",
        body: { email, username, password },
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
            dispatch(login(data));
          }
        });
      },
    }),
    studentSignUp: builder.mutation<
      AuthResponse | ApiError,
      {
        email: string;
        username: string;
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
            dispatch(login(data));
          }
        });
      },
    }),
    verifyEmail: builder.mutation<
      AuthResponse | ApiError,
      { email: string; otp: string }
    >({
      query: ({ email, otp }) => ({
        url: "/auth/verify-email",
        method: "POST",
        body: { email, code: otp },
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
      onQueryStarted: (_, { dispatch, queryFulfilled }) => {
        queryFulfilled.then(({ data }) => {
          if (!("error" in data)) {
            dispatch(login(data));
          } else {
            dispatch(logout());
          }

          dispatch(updateCheckAuth(true));
        });
        queryFulfilled.catch(() => {
          dispatch(logout());
          dispatch(updateCheckAuth(true));
        });
      },
    }),
    logout: builder.mutation<null | ApiError, null>({
      query: () => ({
        url: "/auth/logout",
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
        return createApiError(errorResponse.message);
      },
      onQueryStarted: (_, { dispatch }) => {
        dispatch(logout());
      },
    }),
    setRegistrationNumber: builder.mutation<
      AuthResponse | ApiError,
      { registrationNumber: string }
    >({
      query: ({ registrationNumber }) => ({
        url: "/student/reg-no",
        method: "POST",
        body: { registrationNumber },
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
      onQueryStarted: (_, { dispatch, queryFulfilled }) => {
        queryFulfilled.then(({ data }) => {
          if (!("error" in data)) {
            dispatch(login(data));
          }
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
    advisorSignUp: builder.mutation<
      AuthResponse | ApiError,
      {
        email: string;
        username: string;
        password: string;
        firstName: string;
        lastName: string;
        displayName: string;
      }
    >({
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
            dispatch(login(data));
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
  useSetRegistrationNumberMutation,
  useGetAdvisorsListQuery,
  useAdvisorSignUpMutation,
} = AuthApi;
