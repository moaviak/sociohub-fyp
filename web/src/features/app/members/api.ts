import { api } from "@/features/api";
import { JoinRequest, Member, RequestAction, Role } from "@/types";
import { ApiResponse } from "@/features/api-response";
import ApiError, {
  ApiErrorResponse,
  createApiError,
} from "@/features/api-error";

export const MembersApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getSocietyRequests: builder.query<
      JoinRequest[] | ApiError,
      { societyId: string }
    >({
      query: ({ societyId }) => ({
        url: `/society/requests/${societyId}`,
      }),
      transformResponse: (response: ApiResponse<JoinRequest[]>) => {
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
              type: "Requests" as const,
              id,
            })),
            { type: "Requests", id: "LIST" },
          ];
        } else {
          return [{ type: "Requests", id: "LIST" }];
        }
      },
    }),
    getRequestsHistory: builder.query<
      JoinRequest[] | ApiError,
      { societyId: string }
    >({
      query: ({ societyId }) => ({
        url: `/society/requests/${societyId}/history`,
      }),
      transformResponse: (response: ApiResponse<JoinRequest[]>) => {
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
              type: "Requests" as const,
              id,
            })),
            { type: "Requests", id: "LIST" },
          ];
        } else {
          return [{ type: "Requests", id: "LIST" }];
        }
      },
    }),
    handleSocietyRequest: builder.mutation<
      JoinRequest | ApiError,
      {
        societyId: string;
        studentId: string;
        action: RequestAction;
        reason?: string;
      }
    >({
      query: ({ societyId, studentId, action, reason }) => ({
        url: `/society/requests/${societyId}`,
        method: "PUT",
        body: { studentId, action, reason },
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
          return [
            { type: "Requests", id: result.id },
            { type: "Members", id: "LIST" },
          ];
        } else {
          return [{ type: "Requests", id: "LIST" }];
        }
      },
    }),
    getSocietyMembers: builder.query<
      Member[] | ApiError,
      { societyId: string }
    >({
      query: ({ societyId }) => ({
        url: `/society/members/${societyId}`,
      }),
      transformResponse: (response: ApiResponse<Member[]>) => {
        if (response.success) {
          return response.data;
        }
        return createApiError(response.message);
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
      providesTags: (result, _error, arg) => {
        if (result && !("error" in result)) {
          return [
            ...result.map(({ id }) => ({
              type: "Members" as const,
              id: `${arg.societyId},${id}`,
            })),
            { type: "Members", id: "LIST" },
          ];
        } else {
          return [{ type: "Members", id: "LIST" }];
        }
      },
    }),
    removeMember: builder.mutation<
      null | ApiError,
      {
        societyId: string;
        studentId: string;
      }
    >({
      query: ({ societyId, studentId }) => ({
        url: `/society/members/${societyId}`,
        method: "DELETE",
        body: { studentId },
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
        { type: "Members", id: `${arg.societyId},${arg.studentId}` },
      ],
    }),
    getSocietyRoles: builder.query<Role[] | ApiError, { societyId: string }>({
      query: ({ societyId }) => ({
        url: `/society/roles/${societyId}`,
      }),
      transformResponse: (response: ApiResponse<Role[]>) => {
        if (response.success) {
          return response.data;
        }
        return createApiError(response.message);
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
      providesTags: (result, _error, arg) => {
        if (result && !("error" in result)) {
          return [
            ...result.map(({ id }) => ({
              type: "Roles" as const,
              id: `${arg.societyId},${id}`,
            })),
            { type: "Roles", id: "LIST" },
          ];
        } else {
          return [{ type: "Roles", id: "LIST" }];
        }
      },
    }),
    createRole: builder.mutation<
      Role | ApiError,
      {
        societyId: string;
        name: string;
        minSemester?: number;
        description?: string | undefined;
        privileges?: string[] | undefined;
        members?: string[] | undefined;
      }
    >({
      query: ({ societyId, ...body }) => ({
        url: `/society/roles/${societyId}`,
        method: "POST",
        body: { ...body },
      }),
      transformResponse: (response: ApiResponse<Role>) => {
        if (response.success) {
          return response.data;
        }
        return createApiError(response.message);
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
      invalidatesTags: [
        { type: "Roles", id: "LIST" },
        { type: "Members", id: "LIST" },
      ],
    }),
    deleteRole: builder.mutation<
      void | ApiError,
      { societyId: string; roleId: string }
    >({
      query: ({ societyId, roleId }) => ({
        url: `/society/roles/${societyId}`,
        method: "DELETE",
        body: { roleId },
      }),
      transformResponse: (response: ApiResponse<void>) => {
        if (response.success) {
          return response.data;
        }
        return createApiError(response.message);
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
      invalidatesTags: [
        { type: "Roles", id: "LIST" },
        { type: "Members", id: "LIST" },
      ],
    }),
    updateRole: builder.mutation<
      Role | ApiError,
      {
        roleId: string;
        societyId: string;
        name: string;
        minSemester?: number;
        description?: string | undefined;
        privileges?: string[] | undefined;
        members?: string[] | undefined;
      }
    >({
      query: ({ societyId, ...body }) => ({
        url: `/society/roles/${societyId}`,
        method: "PUT",
        body: { ...body },
      }),
      transformResponse: (response: ApiResponse<Role>) => {
        if (response.success) {
          return response.data;
        }
        return createApiError(response.message);
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
      invalidatesTags: (result, _error, arg) => {
        if (result && !("error" in result)) {
          return [
            { type: "Roles", id: `${arg.societyId},${result.id}` },
            { type: "Members", id: "LIST" },
          ];
        } else {
          return [
            { type: "Roles", id: "LIST" },
            { type: "Members", id: "LIST" },
          ];
        }
      },
    }),
  }),
});

export const {
  useGetSocietyRequestsQuery,
  useGetRequestsHistoryQuery,
  useHandleSocietyRequestMutation,
  useGetSocietyMembersQuery,
  useRemoveMemberMutation,
  useGetSocietyRolesQuery,
  useCreateRoleMutation,
  useDeleteRoleMutation,
  useUpdateRoleMutation,
} = MembersApi;
