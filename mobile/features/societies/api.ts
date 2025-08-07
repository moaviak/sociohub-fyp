import { api } from "@/store/api";
import ApiError, { ApiErrorResponse, createApiError } from "@/store/api-error";
import { ApiResponse } from "@/store/api-response";
import { JoinRequest, Society } from "@/types/type";

export const SocietiesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getSocieties: builder.query<
      (Society & { isMember: boolean; hasRequestedToJoin: boolean })[],
      { search?: string }
    >({
      query: ({ search }) => ({
        url: "/society",
        params: { search },
      }),
      transformResponse: (
        response: ApiResponse<
          (Society & { isMember: boolean; hasRequestedToJoin: boolean })[]
        >
      ) => {
        return response.data;
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
      providesTags: (result) => {
        if (result) {
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
      JoinRequest,
      {
        societyId: string;
        whatsappNo: string;
        semester: number;
        interestedRole: string;
        reason: string;
        expectations: string;
        skills?: string;
      }
    >({
      query: (body) => ({
        url: "/student/send-request",
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<JoinRequest>) => {
        return response.data;
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
      invalidatesTags: (result) => {
        if (result) {
          return [{ type: "Societies", id: result.societyId }];
        } else {
          return [{ type: "Societies", id: "LIST" }];
        }
      },
    }),
    cancelJoinRequest: builder.mutation<
      JoinRequest,
      {
        societyId: string;
      }
    >({
      query: ({ societyId }) => ({
        url: `/student/cancel-request/${societyId}`,
        method: "DELETE",
      }),
      transformResponse: (response: ApiResponse<JoinRequest>) => {
        return response.data;
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
      invalidatesTags: (result) => {
        if (result) {
          return [{ type: "Societies", id: result.societyId }];
        } else {
          return [{ type: "Societies", id: "LIST" }];
        }
      },
    }),
  }),
});

export const {
  useGetSocietiesQuery,
  useCancelJoinRequestMutation,
  useSendJoinRequestMutation,
} = SocietiesApi;
