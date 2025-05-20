import { api } from "../api";
import ApiError, { ApiErrorResponse, createApiError } from "../api-error";
import { ApiResponse } from "../api-response";

export const SocitiesAuth = api.injectEndpoints({
  endpoints: (builder) => ({
    getSocieties: builder.query<
      | (Society & { isMember: boolean; hasRequestedToJoin: boolean })[]
      | ApiError,
      void
    >({
      query: () => ({
        url: "/society",
      }),
      transformResponse: (
        response: ApiResponse<
          (Society & { isMember: boolean; hasRequestedToJoin: boolean })[]
        >
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
      JoinRequest | ApiError,
      {
        societyId: string;
      }
    >({
      query: ({ societyId }) => ({
        url: `/student/cancel-request/${societyId}`,
        method: "DELETE",
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
  }),
});

export const {
  useGetSocietiesQuery,
  useCancelJoinRequestMutation,
  useSendJoinRequestMutation,
} = SocitiesAuth;
