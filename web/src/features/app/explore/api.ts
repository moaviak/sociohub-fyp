import { JoinRequest } from "@/types";
import { api } from "@/features/api";
import { ApiResponse } from "@/features/api-response";
import ApiError, {
  ApiErrorResponse,
  createApiError,
} from "@/features/api-error";
import { Societies } from "./types";

export const ExploreApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getSocieties: builder.query<Societies | ApiError, void>({
      query: () => ({
        url: "/society",
      }),
      transformResponse: (response: ApiResponse<Societies>) => {
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
            ...result.map(({ id }) => ({ type: "Societies" as const, id })),
            { type: "Societies", id: "LIST" },
          ];
        } else {
          return [{ type: "Societies", id: "LIST" }];
        }
      },
    }),
    sendJoinRequest: builder.mutation<
      JoinRequest | ApiError,
      {
        societyId: string;
        reason: string;
        expectations: string;
        skills?: string;
      }
    >({
      query: (credentials) => ({
        url: "/student/send-request",
        method: "POST",
        body: credentials,
      }),
      transformResponse: (response: ApiResponse<JoinRequest>) => {
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
          return [{ type: "Societies", id: result.societyId }];
        } else {
          return [{ type: "Societies", id: "LIST" }];
        }
      },
    }),
    cancelJoinRequest: builder.mutation<
      null | ApiError,
      {
        societyId: string;
      }
    >({
      query: ({ societyId }) => ({
        url: `/student/cancel-request/${societyId}`,
        method: "DELETE",
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
      invalidatesTags: (_result, _error, arg) => [
        { type: "Societies", id: arg.societyId },
      ],
    }),
  }),
});

export const {
  useGetSocietiesQuery,
  useSendJoinRequestMutation,
  useCancelJoinRequestMutation,
} = ExploreApi;
