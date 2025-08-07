import { api } from "@/store/api";
import { ApiErrorResponse, createApiError } from "@/store/api-error";
import { ApiResponse } from "@/store/api-response";
import { Ticket } from "@/types/type";

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
  }),
});

export const { useScanTicketMutation } = EventsApi;
