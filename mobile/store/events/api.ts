import { Ticket } from "@/types/type";
import { api } from "../api";
import ApiError, { ApiErrorResponse, createApiError } from "../api-error";
import { ApiResponse } from "../api-response";

export const EventApi = api.injectEndpoints({
  endpoints: (builder) => ({
    scanTicket: builder.mutation<
      Ticket | ApiError,
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
        if (response.success) {
          return response.data;
        }
        return createApiError(response.message);
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

export const { useScanTicketMutation } = EventApi;
