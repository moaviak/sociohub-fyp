import { api } from "@/features/api";
import { Team, TeamJoinRequest, TeamMember, TeamTask } from "./types";
import { ApiResponse } from "@/features/api-response";
import { ApiErrorResponse, createApiError } from "@/features/api-error";

const teamsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    leaveTeam: builder.mutation<void, { teamId: string }>({
      query: (data) => ({
        url: `/teams/leave`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Teams"],
      transformResponse: (response: ApiResponse<void>) => response.data,
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
    }),
    requestToJoinTeam: builder.mutation<
      TeamJoinRequest,
      { teamId: string; studentId: string; message?: string }
    >({
      query: (data) => ({
        url: `/teams/join-request`,
        method: "POST",
        body: data,
      }),
      transformResponse: (response: ApiResponse<TeamJoinRequest>) =>
        response.data,
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
      invalidatesTags: (_result, _error, { teamId }) => [
        { type: "Teams", id: teamId },
      ],
    }),
    createTeam: builder.mutation<Team, FormData>({
      query: (data) => ({
        url: `/teams/societies/${data.get("societyId")}/teams`,
        method: "POST",
        body: data,
      }),
      transformResponse: (response: ApiResponse<Team>) => {
        return response.data;
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
      invalidatesTags: [{ type: "Teams", id: "LIST" }],
    }),
    getSocietyTeams: builder.query<Team[], string>({
      query: (societyId) => `/teams/societies/${societyId}/teams`,
      transformResponse: (response: ApiResponse<Team[]>) => response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Teams" as const, id })),
              { type: "Teams", id: "LIST" },
            ]
          : [{ type: "Teams", id: "LIST" }],
    }),
    getTeamById: builder.query<Team, string>({
      query: (teamId) => `/teams/${teamId}`,
      transformResponse: (response: ApiResponse<Team>) => response.data,
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
      providesTags: (_result, _error, id) => [{ type: "Teams", id }],
    }),
    getTeamJoinRequests: builder.query<TeamJoinRequest[], string>({
      query: (teamId) => `/teams/${teamId}/join-requests`,
      transformResponse: (response: ApiResponse<TeamJoinRequest[]>) =>
        response.data,
      providesTags: (_result, _error, teamId) => [
        { type: "Teams", id: teamId },
        { type: "TeamRequests", id: "LIST" },
      ],
    }),
    approveJoinRequest: builder.mutation<
      TeamJoinRequest,
      { requestId: string; respondedById: string; responseNote?: string }
    >({
      query: ({ requestId, ...body }) => ({
        url: `/teams/join-request/${requestId}/approve`,
        method: "PUT",
        body,
      }),
      transformResponse: (response: ApiResponse<TeamJoinRequest>) =>
        response.data,
      invalidatesTags: (result) => [
        { type: "TeamRequests", id: "LIST" },
        { type: "Teams", id: result?.teamId },
      ],
    }),
    rejectJoinRequest: builder.mutation<
      TeamJoinRequest,
      { requestId: string; respondedById: string; responseNote?: string }
    >({
      query: ({ requestId, ...body }) => ({
        url: `/teams/join-request/${requestId}/reject`,
        method: "PUT",
        body,
      }),
      transformResponse: (response: ApiResponse<TeamJoinRequest>) =>
        response.data,
      invalidatesTags: (result) => [
        { type: "TeamRequests", id: "LIST" },
        { type: "Teams", id: result?.teamId },
      ],
    }),
    assignTeamTask: builder.mutation<
      TeamTask,
      {
        teamId: string;
        title: string;
        description?: string;
        dueDate?: Date;
        societyId: string;
      }
    >({
      query: (data) => ({
        url: `/teams/${data.teamId}/tasks/assign`,
        method: "POST",
        body: data,
      }),
      transformResponse: (response: ApiResponse<TeamTask>) => response.data,
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
      invalidatesTags: (_result, _error, { teamId }) => [
        { type: "Teams", id: teamId },
      ],
    }),

    createTeamTask: builder.mutation<
      TeamTask,
      {
        teamId: string;
        title: string;
        description?: string;
        dueDate?: Date;
        societyId: string;
      }
    >({
      query: (data) => ({
        url: `/teams/${data.teamId}/tasks`,
        method: "POST",
        body: data,
      }),
      transformResponse: (response: ApiResponse<TeamTask>) => response.data,
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
      invalidatesTags: (_result, _error, { teamId }) => [
        { type: "Teams", id: teamId },
      ],
    }),
    updateTaskStatus: builder.mutation<
      TeamTask,
      {
        taskId: string;
        status: TeamTask["status"];
      }
    >({
      query: ({ taskId, status }) => ({
        url: `/teams/tasks/${taskId}/status`,
        method: "PUT",
        body: { status },
      }),
      transformResponse: (response: ApiResponse<TeamTask>) => response.data,
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
      invalidatesTags: (result) => [{ type: "Teams", id: result?.teamId }],
    }),

    removeMemberFromTeam: builder.mutation<
      void,
      {
        teamId: string;
        studentId: string;
      }
    >({
      query: (data) => ({
        url: `/teams/members`,
        method: "DELETE",
        body: data,
      }),
      transformResponse: (response: ApiResponse<void>) => response.data,
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
      invalidatesTags: (_result, _error, { teamId }) => [
        { type: "Teams", id: teamId },
      ],
    }),

    addTeamMembers: builder.mutation<
      TeamMember[],
      {
        teamId: string;
        studentIds: string[];
      }
    >({
      query: (data) => ({
        url: `/teams/members/batch`,
        method: "POST",
        body: data,
      }),
      transformResponse: (response: ApiResponse<TeamMember[]>) => response.data,
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
      invalidatesTags: (_result, _error, { teamId }) => [
        { type: "Teams", id: teamId },
      ],
    }),

    deleteTeam: builder.mutation<void, { teamId: string; societyId: string }>({
      query: ({ societyId, teamId }) => ({
        url: `/teams/societies/${societyId}/teams/${teamId}`,
        method: "DELETE",
      }),
      transformResponse: (response: ApiResponse<void>) => response.data,
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
      invalidatesTags: [{ type: "Teams", id: "LIST" }],
    }),
    updateTeam: builder.mutation<Team, { teamId: string; data: FormData }>({
      query: ({ teamId, data }) => ({
        url: `/teams/${teamId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Teams"],
    }),
  }),
});

export const {
  useCreateTeamMutation,
  useUpdateTeamMutation,
  useGetSocietyTeamsQuery,
  useGetTeamByIdQuery,
  useLeaveTeamMutation,
  useRequestToJoinTeamMutation,
  useGetTeamJoinRequestsQuery,
  useApproveJoinRequestMutation,
  useRejectJoinRequestMutation,
  useAssignTeamTaskMutation,
  useUpdateTaskStatusMutation,
  useCreateTeamTaskMutation,
  useAddTeamMembersMutation,
  useRemoveMemberFromTeamMutation,
  useDeleteTeamMutation,
} = teamsApi;
