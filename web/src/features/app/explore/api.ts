import { JoinRequest } from "@/types";
import { api } from "@/features/api";
import { ApiResponse } from "@/features/api-response";
import ApiError, {
  ApiErrorResponse,
  createApiError,
} from "@/features/api-error";
import { Societies } from "./types";
import { Event } from "@/types/event";

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
    getEvents: builder.query<
      Event[] | ApiError,
      { status?: string; categories?: string; search?: string }
    >({
      query: ({ status = "", categories = "", search = "" }) => ({
        url: `/events?status=${status}&categories=${categories}&search=${search}`,
      }),
      transformResponse: (response: ApiResponse<Event[]>) => {
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
            ...result.map(({ id }) => ({ type: "Events" as const, id })),
            { type: "Events", id: "LIST" },
          ];
        } else {
          return [];
        }
      },
    }),
  }),
});

export const {
  useGetSocietiesQuery,
  useSendJoinRequestMutation,
  useCancelJoinRequestMutation,
  useGetEventsQuery,
} = ExploreApi;
