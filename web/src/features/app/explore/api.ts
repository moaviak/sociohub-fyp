import { Advisor, JoinRequest, Student } from "@/types";
import { api } from "@/features/api";
import { ApiResponse } from "@/features/api-response";
import ApiError, {
  ApiErrorResponse,
  createApiError,
} from "@/features/api-error";
import { Societies } from "./types";
import { Event } from "@/types/event";

interface GetUsersResponse {
  users: (Student | Advisor)[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

interface GetUsersQueryArg {
  limit?: number;
  // Add other query parameters if needed in the future
  search?: string;
  status?: string;
}

export const ExploreApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getSocieties: builder.query<Societies | ApiError, { search?: string }>({
      query: (arg) => ({
        url: `/society?search=${arg.search}`,
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
      Event[],
      { status?: string; categories?: string; search?: string; limit?: number }
    >({
      query: ({ status = "", categories = "", search = "", limit = "" }) => ({
        url: `/events?status=${status}&categories=${categories}&search=${search}&limit=${limit}`,
      }),
      transformResponse: (response: ApiResponse<Event[]>) => {
        return response.data;
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
    getAllUsers: builder.infiniteQuery<
      GetUsersResponse | ApiError, // Keep full response for pagination info
      GetUsersQueryArg,
      number
    >({
      infiniteQueryOptions: {
        initialPageParam: 1,
        maxPages: 10,
        getNextPageParam: (lastPage, _allPages, lastPageParam) => {
          // Now we have access to full pagination info
          if (lastPage && !("error" in lastPage)) {
            return lastPageParam < lastPage.totalPages
              ? lastPageParam + 1
              : undefined;
          }
          return undefined;
        },
        getPreviousPageParam: (_firstPage, _allPages, firstPageParam) => {
          return firstPageParam > 1 ? firstPageParam - 1 : undefined;
        },
      },
      query: ({ queryArg, pageParam }) => {
        const { limit = 20, search = "", status = "" } = queryArg;
        const params = new URLSearchParams({
          page: pageParam.toString(),
          limit: limit.toString(),
        });

        if (search) params.append("search", search);
        if (status) params.append("status", status);

        return {
          url: `/users?${params.toString()}`,
        };
      },
      transformResponse: (response: ApiResponse<GetUsersResponse>) => {
        if (response.success) {
          return response.data;
        }
        return createApiError(response.message);
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
      providesTags: ["Users"],
    }),
    fetchUsers: builder.query<(Student | Advisor)[], { search?: string }>({
      query: ({ search }) => ({
        url: "/users",
        params: { search },
      }),
      transformResponse: (response: ApiResponse<GetUsersResponse>) => {
        return response.data.users;
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
    }),
  }),
});

export const {
  useGetSocietiesQuery,
  useSendJoinRequestMutation,
  useCancelJoinRequestMutation,
  useGetEventsQuery,
  useGetAllUsersInfiniteQuery,
  useFetchUsersQuery,
} = ExploreApi;
