import { api } from "@/features/api";
import ApiError, {
  ApiErrorResponse,
  createApiError,
} from "@/features/api-error";
import { ApiResponse } from "@/features/api-response";
import { Announcement, AnnouncementAudience } from "@/types";

export const AnnouncementApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createAnnouncement: builder.mutation<
      Announcement | ApiError,
      {
        societyId: string;
        title: string;
        content: string;
        publishDateTime?: Date;
        audience: AnnouncementAudience;
        sendEmail?: boolean;
      }
    >({
      query: (arg) => ({
        url: "/announcements",
        method: "POST",
        body: { ...arg },
      }),
      transformResponse: (response: ApiResponse<Announcement>) => {
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
          return [{ type: "Announcements" as const, id: "LIST" }];
        } else {
          return [];
        }
      },
    }),
  }),
});

export const { useCreateAnnouncementMutation } = AnnouncementApi;
