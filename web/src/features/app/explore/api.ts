import { Society } from "@/types";
import { api } from "@/features/api";
import { ApiResponse } from "@/features/api-response";
import ApiError, {
  ApiErrorResponse,
  createApiError,
} from "@/features/api-error";

export const ExploreApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getSocieties: builder.query<Society[] | ApiError, void>({
      query: () => ({
        url: "/society",
      }),
      transformResponse: (response: ApiResponse<Society[]>) => {
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
  }),
});

export const { useGetSocietiesQuery } = ExploreApi;
