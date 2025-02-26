import { api } from "@/features/api";

import { AuthResponse } from "./types";
import { ApiResponse } from "../api-response";
import ApiError, { ApiErrorResponse, createApiError } from "../api-error";

export const authApi = api.injectEndpoints({
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
        url: "/student/register",
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
  }),
});

export const {
  useLoginMutation,
  useStudentSignUpMutation,
  useVerifyEmailMutation,
  useResendEmailMutation,
} = authApi;
