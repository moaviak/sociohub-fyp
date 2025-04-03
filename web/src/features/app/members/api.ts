import { api } from "@/features/api";
import { JoinRequest, RequestAction } from "@/types";
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
            ...result.map(({ studentId, societyId }) => ({
              type: "Requests" as const,
              id: `${societyId},${studentId}`,
            })),
            { type: "Requests", id: "LIST" },
          ];
        } else {
          return [{ type: "Requests", id: "LIST" }];
        }
      },
    }),
    handleSocietyRequest: builder.mutation<
      null | ApiError,
      {
        societyId: string;
        studentId: string;
        action: RequestAction;
      }
    >({
      query: ({ societyId, studentId, action }) => ({
        url: `/society/requests/${societyId}`,
        method: "PUT",
        body: { studentId, action },
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
        { type: "Requests", id: `${arg.societyId},${arg.studentId}` },
      ],
    }),
  }),
});

export const { useGetSocietyRequestsQuery, useHandleSocietyRequestMutation } =
  MembersApi;
