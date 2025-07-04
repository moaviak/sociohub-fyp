import { api } from "@/features/api";
import ApiError, {
  ApiErrorResponse,
  createApiError,
} from "@/features/api-error";
import { ApiResponse } from "@/features/api-response";
import { Advisor, Meeting, Member } from "@/types";

export interface JoinData {
  dailyRoomUrl: string;
  dailyToken: string;
  meeting: {
    id: string;
    title: string;
    host: string;
    isHost: boolean;
  };
}

export const MeetingApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getSocietyPeople: builder.query<
      { advisor?: Advisor; members: Member[] } | ApiError,
      { societyId: string; search?: string }
    >({
      query: ({ societyId, search }) => ({
        url: `/society/people/${societyId}?search=${search}`,
      }),
      transformResponse: (
        response: ApiResponse<{ advisor: Advisor; members: Member[] }>
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
    }),
    createMeeting: builder.mutation<
      Meeting | ApiError,
      {
        title: string;
        description?: string;
        scheduledAt: Date;
        societyId: string;
        audienceType: "ALL_SOCIETY_MEMBERS" | "SPECIFIC_MEMBERS";
        invitedUserIds: string[];
      }
    >({
      query: (body) => ({
        url: "/meetings",
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<Meeting>) => {
        if (response.success) {
          return response.data;
        }
        return createApiError(response.message);
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
      invalidatesTags: ["Meetings"],
    }),
    updateMeeting: builder.mutation<
      Meeting | ApiError,
      {
        meetingId: string;
        title: string;
        description?: string;
        scheduledAt: Date;
        societyId: string;
        audienceType: "ALL_SOCIETY_MEMBERS" | "SPECIFIC_MEMBERS";
        invitedUserIds: string[];
      }
    >({
      query: ({ meetingId, societyId, ...body }) => ({
        url: `/meetings/${meetingId}?societyId=${societyId}`,
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<Meeting>) => {
        if (response.success) {
          return response.data;
        }
        return createApiError(response.message);
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
      invalidatesTags: ["Meetings"],
    }),
    getMyMeetings: builder.query<Meeting[] | ApiError, { societyId: string }>({
      query: ({ societyId }) => ({
        url: `/meetings/my-meetings?societyId=${societyId}`,
      }),
      transformResponse: (response: ApiResponse<Meeting[]>) => {
        if (response.success) {
          return response.data;
        }
        return createApiError(response.message);
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
      providesTags: ["Meetings"],
    }),
    joinMeeting: builder.mutation<JoinData | ApiError, { meetingId: string }>({
      query: ({ meetingId }) => ({
        url: `/meetings/${meetingId}/join`,
        method: "POST",
      }),
      transformResponse: (response: ApiResponse<JoinData>) => {
        if (response.success) {
          return response.data;
        }
        return createApiError(response.message);
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
    }),
    getMeetingById: builder.query<Meeting | ApiError, { meetingId: string }>({
      query: ({ meetingId }) => ({
        url: `/meetings/${meetingId}`,
      }),
      transformResponse: (response: ApiResponse<Meeting>) => {
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
          return [{ type: "Meetings", id: result.id }];
        } else {
          return [];
        }
      },
    }),
    cancelMeeting: builder.mutation<Meeting | ApiError, { meetingId: string }>({
      query: ({ meetingId }) => ({
        url: `/meetings/${meetingId}/cancel`,
        method: "POST",
      }),
      transformResponse: (response: ApiResponse<Meeting>) => {
        if (response.success) {
          return response.data;
        }
        return createApiError(response.message);
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
      invalidatesTags: ["Meetings"],
    }),
    endMeeting: builder.mutation<Meeting | ApiError, { meetingId: string }>({
      query: ({ meetingId }) => ({
        url: `/meetings/${meetingId}/end`,
        method: "POST",
      }),
      transformResponse: (response: ApiResponse<Meeting>) => {
        if (response.success) {
          return response.data;
        }
        return createApiError(response.message);
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
      invalidatesTags: ["Meetings"],
    }),
    joinByCode: builder.mutation<JoinData | ApiError, { code: string }>({
      query: ({ code }) => ({
        url: "/meetings/join-by-code",
        method: "POST",
        body: { meetingCode: code },
      }),
      transformResponse: (response: ApiResponse<JoinData>) => {
        if (response.success) {
          return response.data;
        }
        return createApiError(response.message);
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
    }),
  }),
});

export const {
  useGetSocietyPeopleQuery,
  useCreateMeetingMutation,
  useGetMyMeetingsQuery,
  useJoinMeetingMutation,
  useGetMeetingByIdQuery,
  useCancelMeetingMutation,
  useEndMeetingMutation,
  useJoinByCodeMutation,
  useUpdateMeetingMutation,
} = MeetingApi;
