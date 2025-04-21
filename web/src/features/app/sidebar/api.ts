import { api } from "@/features/api";
import ApiError, {
  ApiErrorResponse,
  createApiError,
} from "@/features/api-error";
import { ApiResponse } from "@/features/api-response";
import { Society } from "@/types";

export const SidebarApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getMySocieties: builder.query<
      (Society & { privileges: string[] })[] | ApiError,
      void
    >({
      query: () => ({
        url: `/student/societies`,
      }),
      transformResponse: (
        response: ApiResponse<(Society & { privileges: string[] })[]>
      ) => {
        if (response.success) {
          return response.data;
        }
        return createApiError(response.message);
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
      providesTags: (result) => {
        if (result && !("error" in result)) {
          return [
            ...result.map(({ id }) => ({
              type: "Societies" as const,
              id,
            })),
            { type: "Societies", id: "LIST" },
          ];
        } else {
          return [{ type: "Societies", id: "LIST" }];
        }
      },
    }),
  }),
});

export const { useGetMySocietiesQuery } = SidebarApi;
