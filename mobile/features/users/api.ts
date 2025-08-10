import { api } from "@/store/api";
import { ApiErrorResponse, createApiError } from "@/store/api-error";
import { ApiResponse } from "@/store/api-response";
import { Advisor, Student } from "@/types";

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

export const UsersApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getUserById: builder.query<Student | Advisor, { id: string }>({
      query: ({ id }) => ({
        url: `/users/${id}`,
        method: "GET",
      }),
      transformResponse: (response: ApiResponse<Student | Advisor>) => {
        return response.data;
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
    }),
    updateProfile: builder.mutation<Student | Advisor, { formData: FormData }>({
      query: ({ formData }) => ({
        url: `/users/profile`,
        method: "PATCH",
        body: formData,
      }),
      transformResponse: (response: ApiResponse<Student | Advisor>) => {
        return response.data;
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
      invalidatesTags: ["Auth"],
    }),
    getAllUsers: builder.infiniteQuery<
      GetUsersResponse,
      GetUsersQueryArg,
      number
    >({
      infiniteQueryOptions: {
        initialPageParam: 1,
        maxPages: 10,
        getNextPageParam: (lastPage, _allPages, lastPageParam) => {
          return lastPageParam < lastPage.totalPages
            ? lastPageParam + 1
            : undefined;
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
        return response.data;
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
      providesTags: ["Users"],
    }),
  }),
});

export const {
  useGetUserByIdQuery,
  useUpdateProfileMutation,
  useGetAllUsersInfiniteQuery,
} = UsersApi;
