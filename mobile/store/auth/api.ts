import { AuthResponse, Society, SocietyAdvisor } from "@/types";
import { api } from "../api";
import ApiError, { ApiErrorResponse, createApiError } from "../api-error";
import { ApiResponse } from "../api-response";
import {
  login,
  logout,
  setAuthChecked,
  setSociety,
  verifyEmail,
} from "./slice";

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
        return createApiError(
          errorResponse && "message" in errorResponse
            ? errorResponse.message
            : "Unexpected error occurred"
        );
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
          dispatch(logout());
          dispatch(api.util.resetApiState());
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
    advisorSignUp: builder.mutation<
      AuthResponse | ApiError,
      {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        displayName: string;
        phone?: string;
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
    getAdvisorsList: builder.query<SocietyAdvisor[] | ApiError, void>({
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
    createSociety: builder.mutation<Society | ApiError, FormData>({
      query: (credentials) => ({
        url: "/society",
        method: "POST",
        body: credentials,
        // Important for React Native FormData with files
        formData: true,
        // Let the browser set the appropriate boundary for multipart/form-data
        headers: {
          Accept: "application/json",
        },
      }),
      transformResponse: (response: ApiResponse<Society>) => {
        if (response.success) {
          return response.data;
        }
        return createApiError(
          response && response.message
            ? response.message
            : "Unexpected error occurred"
        );
      },
      transformErrorResponse: (response) => {
        // If the status is 201 but for some reason it comes to error handler
        if (response.status === 201) {
          try {
            // Try to parse the response as a success
            const data = response.data as ApiResponse<Society>;
            if (data && data.success) {
              return data.data;
            }
          } catch (e) {
            console.error("Failed to parse 201 response:", e);
          }
        }

        // Normal error handling
        if (response.data) {
          const errorResponse = response.data as ApiErrorResponse;
          return createApiError(
            errorResponse && "message" in errorResponse
              ? errorResponse.message
              : "Unexpected error occurred"
          );
        }

        return createApiError("Network error occurred");
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
  overrideExisting: true,
});

export const {
  useLoginMutation,
  useStudentSignUpMutation,
  useGetUserQuery,
  useLogoutMutation,
  useVerifyEmailMutation,
  useResendEmailMutation,
  useAdvisorSignUpMutation,
  useGetAdvisorsListQuery,
  useCreateSocietyMutation,
} = AuthApi;
