import { api } from "@/features/api";

import { LoginResponse, Student } from "./types";
import { ApiResponse } from "../api-response";
import ApiError, { ApiErrorResponse, createApiError } from "../api-error";

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<
      LoginResponse | ApiError,
      { email?: string; username?: string; password: string }
    >({
      query: ({ email, username, password }) => ({
        url: "/auth/login",
        method: "POST",
        body: { email, username, password },
      }),
      transformResponse: (response: ApiResponse<LoginResponse>) => {
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
      Student | ApiError,
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
      transformResponse: (response: ApiResponse<{ user: Student }>) => {
        if (response.success && response.data.user) {
          return response.data.user;
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
      { isEmailVerified: boolean } | ApiError,
      { email: string; otp: string }
    >({
      query: ({ email, otp }) => ({
        url: "/auth/verify-email",
        method: "POST",
        body: { email, code: otp },
      }),
      transformResponse: (
        response: ApiResponse<{ isEmailVerified: boolean }>
      ) => {
        if (response.success) {
          return response.data;
        }
        return createApiError(response.message);
      },
    }),
  }),
});

export const {
  useLoginMutation,
  useStudentSignUpMutation,
  useVerifyEmailMutation,
} = authApi;
