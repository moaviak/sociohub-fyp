import { api } from "@/features/api";
import ApiError, {
  ApiErrorResponse,
  createApiError,
} from "@/features/api-error";
import { ApiResponse } from "@/features/api-response";
import { Advisor, Student } from "@/types";

export const UsersApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getUserById: builder.query<Student | Advisor | ApiError, { id: string }>({
      query: ({ id }) => ({
        url: `/users/${id}`,
        method: "GET",
      }),
      transformResponse: (response: ApiResponse<Student | Advisor>) => {
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
    updateProfile: builder.mutation<
      Student | Advisor | ApiError,
      { formData: FormData }
    >({
      query: ({ formData }) => ({
        url: `/users/profile`,
        method: "PATCH",
        body: formData,
      }),
      transformResponse: (response: ApiResponse<Student | Advisor>) => {
        if (response.success) {
          return response.data;
        }
        return createApiError(response.message);
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
      invalidatesTags: ["Auth"],
    }),
  }),
});

export const { useGetUserByIdQuery, useUpdateProfileMutation } = UsersApi;
