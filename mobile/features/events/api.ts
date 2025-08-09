import { api } from "@/store/api";
import { ApiErrorResponse, createApiError } from "@/store/api-error";
import { ApiResponse } from "@/store/api-response";
import { Ticket } from "@/types";
import { Event, Registration } from "./types";

export interface EventRegistrationResponse {
  registration: Registration;
  paymentRequired: boolean;
  ticket?: Ticket | null;
  clientSecret?: string | null;
  paymentIntentId?: string;
}

export interface CreateCheckoutSessionRequest {
  eventId: string;
  registrationId: string;
  successUrl?: string;
  cancelUrl?: string;
}

export interface CreateCheckoutSessionResponse {
  transaction: {
    id: string;
    eventId: string;
    studentId: string;
    registrationId: string;
    amount: number;
    status: string;
    stripeCheckoutSessionId: string;
  };
  checkoutUrl: string;
  sessionId: string;
}

export const EventsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    scanTicket: builder.mutation<
      Ticket,
      {
        registrationId: string;
        eventId: string;
        studentId: string;
        societyId: string;
      }
    >({
      query: (arg) => ({
        url: "/events/scan-ticket",
        method: "POST",
        body: { ...arg },
      }),
      transformResponse: (response: ApiResponse<Ticket>) => {
        return response.data;
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(
          errorResponse && "message" in errorResponse
            ? errorResponse.message
            : "Unexpected error occurred"
        );
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
    getEventById: builder.query<Event, string>({
      query: (id) => ({
        url: `/events/${id}`,
      }),
      transformResponse: (response: ApiResponse<Event>) => {
        return response.data;
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
      providesTags: (result) => {
        if (result) {
          return [{ type: "Events", id: result.id }];
        } else {
          return [];
        }
      },
    }),
    updateEvent: builder.mutation<Event, { id: string; data: FormData }>({
      query: ({ id, data }) => ({
        url: `/events/${id}`,
        method: "PUT",
        body: data,
      }),
      transformResponse: (response: ApiResponse<Event>) => {
        return response.data;
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
      invalidatesTags: (result) => {
        if (result) {
          return [{ type: "Events", id: result.id }];
        } else {
          return [];
        }
      },
    }),
    registerForEvent: builder.mutation<EventRegistrationResponse, string>({
      query: (arg) => ({
        url: `/events/${arg}/register`,
        method: "POST",
      }),
      transformResponse: (response: ApiResponse<EventRegistrationResponse>) => {
        return response.data;
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
      invalidatesTags: (result) => {
        if (result) {
          return [{ type: "Events", id: result.registration.eventId }];
        } else {
          return [];
        }
      },
    }),
    deleteEvent: builder.mutation<
      Event,
      { eventId: string; societyId: string }
    >({
      query: ({ eventId, societyId }) => ({
        url: `/events/${eventId}`,
        method: "DELETE",
        body: { societyId },
      }),
      transformResponse: (response: ApiResponse<Event>) => {
        return response.data;
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
      invalidatesTags: (result) => {
        if (result) {
          return [{ type: "Events", id: result.id }];
        } else {
          return [];
        }
      },
    }),
    cancelEvent: builder.mutation<
      Event,
      { eventId: string; societyId: string }
    >({
      query: ({ eventId, societyId }) => ({
        url: `/events/${eventId}/cancel`,
        method: "PATCH",
        body: { societyId },
      }),
      transformResponse: (response: ApiResponse<Event>) => {
        return response.data;
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
      invalidatesTags: (result) => {
        if (result) {
          return [{ type: "Events", id: result.id }];
        } else {
          return [];
        }
      },
    }),
    getMyRegistrations: builder.query<Event[], void>({
      query: () => ({
        url: "/events/my-registrations",
      }),
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
    createCheckoutSession: builder.mutation<
      CreateCheckoutSessionResponse,
      CreateCheckoutSessionRequest
    >({
      query: (data) => ({
        url: `/payments/create-checkout-session`,
        method: "POST",
        body: data,
      }),
      transformResponse: (
        response: ApiResponse<CreateCheckoutSessionResponse>
      ) => {
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
  useScanTicketMutation,
  useGetSocietyEventsQuery,
  useGetEventByIdQuery,
  useUpdateEventMutation,
  useRegisterForEventMutation,
  useDeleteEventMutation,
  useCancelEventMutation,
  useGetMyRegistrationsQuery,
  useGetEventsQuery,
  useCreateCheckoutSessionMutation,
} = EventsApi;
