import { Society } from "@/types";
import { api } from "../api";
import ApiError, { ApiErrorResponse, createApiError } from "../api-error";
import { ApiResponse } from "../api-response";

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
  }),
});

export const { useGetSocietyQuery, useUpdateSocietySettingsMutation } = appApi;
