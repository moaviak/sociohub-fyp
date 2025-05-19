import { api } from "@/features/api";
import ApiError, {
  ApiErrorResponse,
  createApiError,
} from "@/features/api-error";
import { ApiResponse } from "@/features/api-response";
import { Event } from "@/types";

export const eventApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createEvent: builder.mutation<Event | ApiError, FormData>({
      query: (formData) => ({
        url: "/events",
        method: "POST",
        body: formData,
      }),
      transformResponse: (response: ApiResponse<Event>) => {
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
          return [{ type: "Events" as const, id: "LIST" }];
        } else {
          return [];
        }
      },
    }),
  }),
});

export const { useCreateEventMutation } = eventApi;
