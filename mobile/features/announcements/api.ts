import { api } from "@/store/api";
import { Announcement } from "./types";
import { ApiResponse } from "@/store/api-response";
import { ApiErrorResponse, createApiError } from "@/store/api-error";

export const AnnouncementApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createAnnouncement: builder.mutation<
      Announcement,
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
        return response.data;
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
      invalidatesTags: (result) => {
        if (result) {
          return [{ type: "Announcements" as const, id: "LIST" }];
        } else {
          return [];
        }
      },
    }),
    getSocietyAnnouncements: builder.query<
      Announcement[],
      { societyId: string }
    >({
      query: ({ societyId }) => ({
        url: `/announcements/society-announcements/${societyId}`,
      }),
      transformResponse: (response: ApiResponse<Announcement[]>) => {
        return response.data;
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
      providesTags: (result) => {
        if (result) {
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
    getAnnouncementById: builder.query<Announcement, string>({
      query: (id) => ({
        url: `/announcements/${id}`,
      }),
      transformResponse: (response: ApiResponse<Announcement>) => {
        return response.data;
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
      providesTags: (result) => {
        if (result) {
          return [{ type: "Announcements", id: result.id }];
        } else {
          return [];
        }
      },
    }),
    updateAnnouncement: builder.mutation<
      Announcement,
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
        return response.data;
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
      invalidatesTags: (result) => {
        if (result) {
          return [{ type: "Announcements" as const, id: result.id }];
        } else {
          return [{ type: "Announcements", id: "LIST" }];
        }
      },
    }),
    deleteAnnouncement: builder.mutation<
      Announcement,
      { announcementId: string; societyId: string }
    >({
      query: (args) => ({
        url: `/announcements/${args.announcementId}`,
        method: "DELETE",
        body: { societyId: args.societyId },
      }),
      transformResponse: (response: ApiResponse<Announcement>) => {
        return response.data;
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
      invalidatesTags: ["Announcements"],
    }),
    getRecentAnnouncements: builder.query<Announcement[], { limit?: number }>({
      query: ({ limit = "" }) => ({
        url: `/announcements?limit=${limit}`,
      }),
      transformResponse: (response: ApiResponse<Announcement[]>) => {
        return response.data;
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
      providesTags: (result) => {
        if (result) {
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
  }),
});

export const {
  useCreateAnnouncementMutation,
  useGetSocietyAnnouncementsQuery,
  useGetAnnouncementByIdQuery,
  useUpdateAnnouncementMutation,
  useDeleteAnnouncementMutation,
  useGetRecentAnnouncementsQuery,
} = AnnouncementApi;
