import { api } from "@/features/api";
import ApiError, {
  ApiErrorResponse,
  createApiError,
} from "@/features/api-error";
import { ApiResponse } from "@/features/api-response";
import { Event, EventInvitation, Registration, Ticket } from "@/types";
import { EventAnnouncementInput } from "./types";

export interface EventRegistrationResponse {
  registration: Registration;
  paymentRequired: boolean;
  ticket?: Ticket | null;
  clientSecret?: string | null;
  paymentIntentId?: string;
}

export const eventApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createEvent: builder.mutation<Event | ApiError, FormData>({
      query: (formData) => ({
        url: "/events",
        method: "POST",
        body: formData,
      }),
      transformResponse: (response: ApiResponse<Event>) => {
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
          return [{ type: "Events" as const, id: "LIST" }];
        } else {
          return [];
        }
      },
    }),
    draftEvent: builder.mutation<Event | ApiError, FormData>({
      query: (formData) => ({
        url: "/events/drafts",
        method: "POST",
        body: formData,
      }),
      transformResponse: (response: ApiResponse<Event>) => {
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
            { type: "Events" as const, id: "LIST" },
            { type: "Events", id: result.id },
          ];
        } else {
          return [];
        }
      },
    }),
    generateAnnouncement: builder.mutation<
      string | ApiError,
      EventAnnouncementInput
    >({
      query: (input) => ({
        url: "/events/generate-announcement",
        method: "PUT",
        body: input,
      }),
      transformResponse: (response: ApiResponse<string>) => {
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
    getSocietyEvents: builder.query<
      Event[],
      {
        societyId: string;
        status?: string;
        categories?: string;
        search?: string;
      }
    >({
      query: ({ societyId, status = "", categories = "", search = "" }) => ({
        url: `/events?societyId=${societyId}&status=${status}&categories=${categories}&search=${search}`,
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
            ...result.map((event) => ({
              type: "Events" as const,
              id: event.id,
            })),
            { type: "Events", id: "LIST" },
          ];
        } else {
          return [];
        }
      },
    }),
    getEventById: builder.query<Event | ApiError, string>({
      query: (id) => ({
        url: `/events/${id}`,
      }),
      transformResponse: (response: ApiResponse<Event>) => {
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
          return [{ type: "Events", id: result.id }];
        } else {
          return [];
        }
      },
    }),
    updateEvent: builder.mutation<
      Event | ApiError,
      { id: string; data: FormData }
    >({
      query: ({ id, data }) => ({
        url: `/events/${id}`,
        method: "PUT",
        body: data,
      }),
      transformResponse: (response: ApiResponse<Event>) => {
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
          return [{ type: "Events", id: result.id }];
        } else {
          return [];
        }
      },
    }),
    registerForEvent: builder.mutation<
      EventRegistrationResponse | ApiError,
      string
    >({
      query: (arg) => ({
        url: `/events/${arg}/register`,
        method: "POST",
      }),
      transformResponse: (response: ApiResponse<EventRegistrationResponse>) => {
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
          return [{ type: "Events", id: result.registration.eventId }];
        } else {
          return [];
        }
      },
    }),
    deleteEvent: builder.mutation<
      Event | ApiError,
      { eventId: string; societyId: string }
    >({
      query: ({ eventId, societyId }) => ({
        url: `/events/${eventId}`,
        method: "DELETE",
        body: { societyId },
      }),
      transformResponse: (response: ApiResponse<Event>) => {
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
          return [{ type: "Events", id: result.id }];
        } else {
          return [];
        }
      },
    }),
    cancelEvent: builder.mutation<
      Event | ApiError,
      { eventId: string; societyId: string }
    >({
      query: ({ eventId, societyId }) => ({
        url: `/events/${eventId}/cancel`,
        method: "PATCH",
        body: { societyId },
      }),
      transformResponse: (response: ApiResponse<Event>) => {
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
          return [{ type: "Events", id: result.id }];
        } else {
          return [];
        }
      },
    }),
    getMyRegistrations: builder.query<Event[] | ApiError, void>({
      query: () => ({
        url: "/events/my-registrations",
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
            ...result.map((event) => ({
              type: "Events" as const,
              id: event.id,
            })),
            { type: "Events", id: "LIST" },
          ];
        } else {
          return [];
        }
      },
    }),
    inviteStudents: builder.mutation<
      EventInvitation[],
      { societyId: string; eventId: string; studentIds: string[] }
    >({
      query: ({ eventId, societyId, studentIds }) => ({
        url: `/events/${eventId}/invite?societyId=${societyId}`,
        method: "POST",
        body: { studentIds },
      }),
      transformResponse: (response: ApiResponse<EventInvitation[]>) => {
        return response.data;
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
      invalidatesTags: (_, __, arg) => [{ type: "Events", id: arg.eventId }],
    }),
    getMyInvites: builder.query<Event[], void>({
      query: () => "/events/my-invitations",
      transformResponse: (response: ApiResponse<Event[]>) => {
        return response.data;
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
      providesTags: (result) => {
        if (result) {
          return [
            { type: "Events", id: "LIST" },
            ...result.map((event) => ({
              type: "Events" as const,
              id: event.id,
            })),
          ];
        } else {
          return [];
        }
      },
    }),
    rejectInvite: builder.mutation<void, { eventId: string }>({
      query: ({ eventId }) => ({
        url: `/events/${eventId}/reject-invite`,
        method: "POST",
      }),
      transformResponse: (response: ApiResponse<void>) => {
        return response.data;
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
      invalidatesTags: (_, __, arg) => [{ type: "Events", id: arg.eventId }],
    }),
  }),
});

export const {
  useCreateEventMutation,
  useDraftEventMutation,
  useGenerateAnnouncementMutation,
  useGetSocietyEventsQuery,
  useGetEventByIdQuery,
  useUpdateEventMutation,
  useRegisterForEventMutation,
  useDeleteEventMutation,
  useCancelEventMutation,
  useGetMyRegistrationsQuery,
  useInviteStudentsMutation,
  useGetMyInvitesQuery,
  useRejectInviteMutation,
} = eventApi;
