import { api } from "@/features/api";
import { ApiErrorResponse, createApiError } from "@/features/api-error";
import { ApiResponse } from "@/features/api-response";
import { Post } from "./types";

export const postApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createPost: builder.mutation<Post, FormData>({
      query: (formData) => ({
        url: "/cms",
        method: "POST",
        body: formData,
      }),
      transformResponse: (response: ApiResponse<Post>) => {
        return response.data;
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
      invalidatesTags: [{ type: "Posts", id: "LIST" }],
    }),
    getSocietyPosts: builder.query<Post[], string>({
      query: (societyId) => `/cms/society/${societyId}`,
      transformResponse: (response: ApiResponse<Post[]>) => {
        return response.data;
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Posts" as const, id })),
              { type: "Posts", id: "LIST" },
            ]
          : [{ type: "Posts", id: "LIST" }],
    }),
    togglePostLike: builder.mutation<
      void,
      { postId: string; action: "LIKE" | "UNLIKE" }
    >({
      query: ({ postId, action }) => ({
        url: `/cms/${postId}/like`,
        method: "POST",
        body: { action },
      }),
      invalidatesTags: (_result, _error, { postId }) => [
        { type: "Posts", id: postId },
      ],
    }),
    getPostById: builder.query<Post, string>({
      query: (postId) => `/cms/${postId}`,
      transformResponse: (response: ApiResponse<Post>) => {
        return response.data;
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
      providesTags: (result) => [{ type: "Posts", id: result?.id }],
    }),
    addComment: builder.mutation<void, { postId: string; content: string }>({
      query: ({ postId, content }) => ({
        url: `/cms/${postId}/comments`,
        method: "POST",
        body: { content },
      }),
      invalidatesTags: (_result, _error, { postId }) => [
        { type: "Posts", id: postId },
      ],
    }),
    updatePost: builder.mutation<Post, { postId: string; data: FormData }>({
      query: ({ postId, data }) => ({
        url: `/cms/${data.get("societyId")}/${postId}`,
        method: "PUT",
        body: data,
      }),
      transformResponse: (response: ApiResponse<Post>) => {
        return response.data;
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
      invalidatesTags: (_result, _error, { postId }) => [
        { type: "Posts", id: "LIST" },
        { type: "Posts", id: postId },
      ],
    }),
    deletePost: builder.mutation<void, { postId: string; societyId: string }>({
      query: ({ postId, societyId }) => ({
        url: `/cms/${societyId}/${postId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { postId }) => [
        { type: "Posts", id: "LIST" },
        { type: "Posts", id: postId },
      ],
    }),
  }),
});

export const {
  useCreatePostMutation,
  useGetSocietyPostsQuery,
  useTogglePostLikeMutation,
  useGetPostByIdQuery,
  useAddCommentMutation,
  useUpdatePostMutation,
  useDeletePostMutation,
} = postApi;
