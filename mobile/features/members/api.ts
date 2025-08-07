import { api } from "@/store/api";
import { ApiErrorResponse, createApiError } from "@/store/api-error";
import { ApiResponse } from "@/store/api-response";
import { RequestAction } from "@/types";
import { JoinRequest, Member, Role } from "@/types/type";

export const MembersApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getSocietyMembers: builder.query<
      Member[],
      { societyId: string; search?: string }
    >({
      query: ({ societyId, search }) => ({
        url: `/society/members/${societyId}?search=${search}`,
      }),
      transformResponse: (response: ApiResponse<Member[]>) => {
        return response.data;
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
      providesTags: (result, _error, args) => {
        if (result) {
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
      null,
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
        return response.data;
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
      invalidatesTags: (result, _error, args) => {
        if (result) {
          return [
            { type: "Members", id: `${args.societyId}-${args.studentId}` },
          ];
        } else {
          return [{ type: "Members", id: `${args.societyId}-LIST` }];
        }
      },
    }),
    getSocietyRoles: builder.query<Role[], { societyId: string }>({
      query: ({ societyId }) => ({
        url: `/society/roles/${societyId}`,
      }),
      transformResponse: (response: ApiResponse<Role[]>) => {
        return response.data;
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
      providesTags: (result, _error, args) => {
        if (result) {
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
      Role,
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
        return response.data;
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
      invalidatesTags: (result, _error, args) => {
        if (result && args.members) {
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
    deleteRole: builder.mutation<void, { societyId: string; roleId: string }>({
      query: ({ societyId, roleId }) => ({
        url: `/society/roles/${societyId}`,
        method: "DELETE",
        body: { roleId },
      }),
      transformResponse: (response: ApiResponse<void>) => {
        return response.data;
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
      invalidatesTags: (result, _error, args) => {
        if (result) {
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
      Role,
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
        return response.data;
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
      invalidatesTags: (result, _error, arg) => {
        if (result) {
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
      Role[],
      { societyId: string; studentId: string; roleIds: string[] }
    >({
      query: ({ societyId, studentId, roleIds }) => ({
        url: `/society/roles/${societyId}/assign-roles`,
        method: "POST",
        body: { studentId, roleIds },
      }),
      transformResponse: (response: ApiResponse<Role[]>) => {
        return response.data;
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
      invalidatesTags: (result, _error, args) => {
        if (result) {
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
    getSocietyRequests: builder.query<
      JoinRequest[],
      { societyId: string; search?: string }
    >({
      query: ({ societyId, search }) => ({
        url: `/society/requests/${societyId}?search=${search}`,
      }),
      transformResponse: (response: ApiResponse<JoinRequest[]>) => {
        return response.data;
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
      providesTags: (result, _error, args) => {
        if (result) {
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
      JoinRequest[],
      { societyId: string; search?: string }
    >({
      query: ({ societyId, search }) => ({
        url: `/society/requests/${societyId}/history?search=${search}`,
      }),
      transformResponse: (response: ApiResponse<JoinRequest[]>) => {
        return response.data;
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
      providesTags: (result, _error, args) => {
        if (result) {
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
      JoinRequest,
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
        return response.data;
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
      invalidatesTags: (result, _error, args) => {
        if (result) {
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
      JoinRequest,
      { societyId: string; requestId: string }
    >({
      query: ({ societyId, requestId }) => ({
        url: `/society/requests/${societyId}`,
        method: "DELETE",
        body: { requestId },
      }),
      transformResponse: (response: ApiResponse<JoinRequest>) => {
        return response.data;
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
  }),
});

export const {
  useGetSocietyMembersQuery,
  useRemoveMemberMutation,
  useGetSocietyRolesQuery,
  useCreateRoleMutation,
  useDeleteRoleMutation,
  useUpdateRoleMutation,
  useDeleteRequestMutation,
  useAssignRolesMutation,
  useGetSocietyRequestsQuery,
  useGetRequestsHistoryQuery,
  useHandleSocietyRequestMutation,
} = MembersApi;
