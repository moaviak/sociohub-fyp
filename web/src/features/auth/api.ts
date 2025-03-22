import { Society } from "@/types";
import { api } from "@/features/api";

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
            dispatch(login(data));
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
            dispatch(login(data));
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
      onQueryStarted: (_, { dispatch, queryFulfilled }) => {
        queryFulfilled.then(({ data }) => {
          if (!("error" in data)) {
            dispatch(login(data));
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
          dispatch(logout());
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
            dispatch(login(data));
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
