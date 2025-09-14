import { ActivityLog, CalendarReminder, Society, Student } from "@/types";
import { api } from "../api";
import ApiError, { ApiErrorResponse, createApiError } from "../api-error";
import { ApiResponse } from "../api-response";

interface GetActivityLogsRequest {
  societyId: string;
  page?: number;
  limit?: number;
  search?: string;
}

interface GetActivityLogsResponse {
  activityLogs: ActivityLog[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
}

interface SocietyKPIsResponse {
  members: number;
  activeEvents: number;
  totalTeams: number;
  upcomingEventRegistrations: number;
}

export const appApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getSociety: builder.query<Society | ApiError, { societyId: string }>({
      query: ({ societyId }) => ({
        url: `/society/${societyId}`,
      }),
      transformResponse: (response: ApiResponse<Society>) => {
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
          return [{ type: "Societies", id: result.id }];
        } else {
          return [];
        }
      },
    }),
    updateSocietySettings: builder.mutation<
      Society | ApiError,
      { societyId: string; acceptingNewMembers: boolean; membersLimit: number }
    >({
      query: ({ societyId, acceptingNewMembers, membersLimit }) => ({
        url: `/society/settings/${societyId}`,
        method: "PATCH",
        body: { acceptingNewMembers, membersLimit },
      }),
      transformResponse: (response: ApiResponse<Society>) => {
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
          return [{ type: "Societies", id: result.id }];
        } else {
          return [];
        }
      },
    }),
    updateSocietyProfile: builder.mutation<
      Society | ApiError,
      { societyId: string; formData: FormData }
    >({
      query: ({ societyId, formData }) => ({
        url: `/society/profile/${societyId}`,
        method: "PATCH",
        body: formData,
      }),
      transformResponse: (response: ApiResponse<Society>) => {
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
          return [{ type: "Societies", id: result.id }];
        } else {
          return [];
        }
      },
    }),
    getActivityLogs: builder.query<
      GetActivityLogsResponse,
      GetActivityLogsRequest
    >({
      query: ({ societyId, page, limit, search }) => ({
        url: `/society/${societyId}/activity-logs`,
        params: { page, limit, search },
      }),
      transformResponse: (response: ApiResponse<GetActivityLogsResponse>) => {
        return response.data;
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
    }),
    getSocietyKPIs: builder.query<SocietyKPIsResponse, string>({
      query: (societyId) => `/society/${societyId}/kpis`,
      transformResponse: (response: ApiResponse<SocietyKPIsResponse>) => {
        return response.data;
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
    }),
    getCalendarReminders: builder.query<CalendarReminder[], void>({
      query: () => `/users/reminders`,
      transformResponse: (response: ApiResponse<CalendarReminder[]>) => {
        return response.data;
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
    }),
    getStudents: builder.query<Student[], { search: string }>({
      query: ({ search }) => `/users/students?search=${search}`,
      transformResponse: (response: ApiResponse<Student[]>) => {
        return response.data;
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
    }),
  }),
});

export const {
  useGetSocietyQuery,
  useUpdateSocietySettingsMutation,
  useUpdateSocietyProfileMutation,
  useGetActivityLogsQuery,
  useGetSocietyKPIsQuery,
  useGetCalendarRemindersQuery,
  useGetStudentsQuery,
} = appApi;
