import { api } from "@/features/api";
import ApiError, {
  ApiErrorResponse,
  createApiError,
} from "@/features/api-error";
import { ApiResponse } from "@/features/api-response";
import { Announcement } from "@/types";

export const AnnouncementApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createAnnouncement: builder.mutation<
      Announcement | ApiError,
      {
        societyId: string;
        title: string;
        content: string;
        publishDateTime?: Date;
        audience: "All" | "Members";
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
    getSocietyAnnouncements: builder.query<
      Announcement[] | ApiError,
      { societyId: string }
    >({
      query: ({ societyId }) => ({
        url: `/announcements/society-announcements/${societyId}`,
      }),
      transformResponse: (response: ApiResponse<Announcement[]>) => {
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
            ...result.map((item) => ({
              type: "Announcements" as const,
              id: item.id,
            })),
            { type: "Announcements", id: "LIST" },
          ];
        } else {
          return [];
        }
      },
    }),
    getAnnouncementById: builder.query<Announcement | ApiError, string>({
      query: (id) => ({
        url: `/announcements/${id}`,
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
      providesTags: (result) => {
        if (result && !("error" in result)) {
          return [{ type: "Announcements", id: result.id }];
        } else {
          return [];
        }
      },
    }),
    updateAnnouncement: builder.mutation<
      Announcement | ApiError,
      {
        announcementId: string;
        societyId: string;
        title: string;
        content: string;
        publishDateTime?: Date;
        audience: "All" | "Members";
        sendEmail?: boolean;
      }
    >({
      query: (arg) => ({
        url: `/announcements/${arg.announcementId}`,
        method: "PATCH",
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
          return [{ type: "Announcements" as const, id: result.id }];
        } else {
          return [{ type: "Announcements", id: "LIST" }];
        }
      },
    }),
    deleteAnnouncement: builder.mutation<
      Announcement | ApiError,
      { announcementId: string; societyId: string }
    >({
      query: (args) => ({
        url: `/announcements/${args.announcementId}`,
        method: "DELETE",
        body: { societyId: args.societyId },
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
      invalidatesTags: ["Announcements"],
    }),
  }),
});

export const {
  useCreateAnnouncementMutation,
  useGetSocietyAnnouncementsQuery,
  useGetAnnouncementByIdQuery,
  useUpdateAnnouncementMutation,
  useDeleteAnnouncementMutation,
} = AnnouncementApi;
