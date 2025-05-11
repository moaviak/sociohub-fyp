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
      providesTags: (result, _error, args) => {
        if (result && !("error" in result)) {
          return [
            ...result.map(({ id }) => ({
              type: "Requests" as const,
              id,
            })),
            { type: "Requests", id: `${args.societyId}-LIST` },
          ];
        } else {
          return [];
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
      providesTags: (result, _error, args) => {
        if (result && !("error" in result)) {
          return [
            ...result.map(({ id }) => ({
              type: "Requests" as const,
              id: `${args.societyId}-${id}`,
            })),
            { type: "Requests", id: `${args.societyId}-LIST` },
          ];
        } else {
          return [];
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
      invalidatesTags: (result, _error, args) => {
        if (result && !("error" in result)) {
          return [
            { type: "Requests", id: result.id },
            ...(args.action === RequestAction.ACCEPT
              ? [{ type: "Members" as const, id: `${args.societyId}-LIST` }]
              : []),
          ];
        } else {
          return [{ type: "Requests", id: `${args.societyId}-LIST` }];
        }
      },
    }),
    deleteRequest: builder.mutation<
      JoinRequest | ApiError,
      { societyId: string; requestId: string }
    >({
      query: ({ societyId, requestId }) => ({
        url: `/society/requests/${societyId}`,
        method: "DELETE",
        body: { requestId },
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
      invalidatesTags(result, _error, arg) {
        console.log({ result, arg });
        if (result && !("error" in result)) {
          return [{ type: "Requests", id: `${arg.societyId}-${result.id}` }];
        } else {
          return [{ type: "Requests", id: `${arg.societyId}-LIST` }];
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
      providesTags: (result, _error, args) => {
        if (result && !("error" in result)) {
          return [
            ...result.map(({ id }) => ({
              type: "Members" as const,
              id: `${args.societyId}-${id}`,
            })),
            { type: "Members", id: `${args.societyId}-LIST` },
          ];
        } else {
          return [];
        }
      },
    }),
    removeMember: builder.mutation<
      null | ApiError,
      {
        societyId: string;
        studentId: string;
        reason: string;
      }
    >({
      query: ({ societyId, studentId, reason }) => ({
        url: `/society/members/${societyId}`,
        method: "DELETE",
        body: { studentId, reason },
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
      invalidatesTags: (result, _error, args) => {
        if (result && !("error" in result)) {
          return [
            { type: "Members", id: `${args.societyId}-${args.studentId}` },
          ];
        } else {
          return [{ type: "Members", id: `${args.societyId}-LIST` }];
        }
      },
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
      providesTags: (result, _error, args) => {
        if (result && !("error" in result)) {
          return [
            ...result.map(({ id }) => ({
              type: "Roles" as const,
              id: `${args.societyId}-${id}`,
            })),
            { type: "Roles", id: `${args.societyId}-LIST` },
          ];
        } else {
          return [];
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
      invalidatesTags: (result, _error, args) => {
        if (result && !("error" in result) && args.members) {
          return [
            ...args.members.map((id) => ({
              type: "Members" as const,
              id: `${args.societyId}-${id}`,
            })),
            { type: "Roles", id: `${args.societyId}-LIST` },
          ];
        } else {
          return [{ type: "Roles", id: `${args.societyId}-LIST` }];
        }
      },
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
      invalidatesTags: (result, _error, args) => {
        if (result && !("error" in result)) {
          return [
            { type: "Roles", id: `${args.societyId}-${args.roleId}` },
            { type: "Members", id: `${args.societyId}-LIST` },
          ];
        } else {
          return [{ type: "Roles", id: `${args.societyId}-LIST` }];
        }
      },
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
            { type: "Roles", id: `${arg.societyId}-${result.id}` },
            { type: "Members", id: `${arg.societyId}-LIST` },
          ];
        } else {
          return [{ type: "Roles", id: `${arg.societyId}-LIST` }];
        }
      },
    }),
    assignRoles: builder.mutation<
      Role[] | ApiError,
      { societyId: string; studentId: string; roleIds: string[] }
    >({
      query: ({ societyId, studentId, roleIds }) => ({
        url: `/society/roles/${societyId}/assign-roles`,
        method: "POST",
        body: { studentId, roleIds },
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
      invalidatesTags: (result, _error, args) => {
        if (result && !("error" in result)) {
          return [
            ...result.map(({ id }) => ({
              type: "Roles" as const,
              id: `${args.societyId}-${id}`,
            })),
            { type: "Members", id: `${args.societyId}-${args.studentId}` },
          ];
        } else {
          return [{ type: "Members", id: `${args.societyId}-LIST` }];
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
  useDeleteRequestMutation,
  useAssignRolesMutation,
} = MembersApi;
