import { api } from "@/features/api";
import { Chat, Message } from "./types";
import { ApiResponse } from "@/features/api-response";
import { ApiErrorResponse, createApiError } from "@/features/api-error";
import { User } from "@/types";
import { setChats, setMessages } from "./slice";

export const chatsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getChats: builder.query<Chat[], void>({
      query: () => "/chats",
      transformResponse: (response: ApiResponse<Chat[]>) => {
        return response.data;
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Chat" as const, id })),
              { type: "Chat", id: "LIST" },
            ]
          : [{ type: "Chat", id: "LIST" }],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setChats(data));
        } catch (error) {
          console.error("Failed to fetch chats:", error);
        }
      },
    }),
    getMessagesByChatId: builder.query<Message[], string>({
      query: (chatId) => `/messages/${chatId}`,
      transformResponse: (response: ApiResponse<Message[]>) => {
        return response.data.reverse(); // Reverse to show latest messages at the bottom
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
      providesTags: (_result, _error, chatId) => [{ type: "Chat", id: chatId }],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setMessages(data));
        } catch (error) {
          console.error("Failed to fetch messages:", error);
        }
      },
    }),
    searchUsers: builder.query<User[], string>({
      query: (query) => `/users/search?q=${query}`,
      transformResponse: (response: ApiResponse<User[]>) => {
        return response.data;
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
    }),
    createOneToOneChat: builder.mutation<Chat, string>({
      query: (recipientId) => ({
        url: `/chats/one-on-one/${recipientId}`,
        method: "POST",
      }),
      transformResponse: (response: ApiResponse<Chat>) => {
        return response.data;
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
      invalidatesTags: [{ type: "Chat", id: "LIST" }],
    }),
    sendMessage: builder.mutation<
      Message,
      { chatId: string; content: string; files?: File[] }
    >({
      query: ({ chatId, content, files }) => {
        const formData = new FormData();
        formData.append("content", content);
        if (files) {
          files.forEach((file) => formData.append("attachments", file));
        }
        return {
          url: `/messages/${chatId}`,
          method: "POST",
          body: formData,
        };
      },
      transformResponse: (response: ApiResponse<Message>) => {
        return response.data;
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
    }),
    markChatAsRead: builder.mutation<void, string>({
      query: (chatId) => ({
        url: `/chats/${chatId}/read`,
        method: "POST",
      }),
      transformResponse: (response: ApiResponse<void>) => {
        return response.data;
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
    }),
    removeParticipant: builder.mutation<
      void,
      { chatId: string; participantId: string }
    >({
      query: ({ chatId, participantId }) => ({
        url: `/chats/group/${chatId}/participants/${participantId}`,
        method: "DELETE",
      }),
      transformResponse: (response: ApiResponse<void>) => {
        return response.data;
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
      invalidatesTags: (_result, _error, { chatId }) => [
        { type: "Chat", id: chatId },
      ],
    }),
    getSuggestedUsers: builder.query<User[], void>({
      query: () => "/chats/suggested-users",
      transformResponse: (response: ApiResponse<User[]>) => {
        return response.data;
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
    }),
    createGroupChat: builder.mutation<
      Chat,
      { name: string; participants: string[]; avatar?: File }
    >({
      query: ({ name, participants, avatar }) => {
        const formData = new FormData();
        formData.append("name", name);
        participants.forEach((p) => formData.append("participants", p));
        if (avatar) {
          formData.append("avatar", avatar);
        }

        return {
          url: "/chats/group",
          method: "POST",
          body: formData,
        };
      },
      transformResponse: (response: ApiResponse<Chat>) => {
        return response.data;
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
      invalidatesTags: [{ type: "Chat", id: "LIST" }],
    }),
    addParticipants: builder.mutation<
      void,
      { chatId: string; participantIds: string[] }
    >({
      query: ({ chatId, participantIds }) => ({
        url: `/chats/group/${chatId}/participants/bulk`,
        method: "POST",
        body: { participantIds },
      }),
      transformResponse: (response: ApiResponse<void>) => {
        return response.data;
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
      invalidatesTags: (_result, error, { chatId }) => {
        if (!error) return [{ type: "Chat", id: chatId }];
        else return [];
      },
    }),
    deleteMessage: builder.mutation<void, string>({
      query: (messageId) => ({
        url: `/messages/${messageId}`,
        method: "DELETE",
      }),
      transformResponse: (response: ApiResponse<void>) => {
        return response.data;
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
    }),
    deleteOneToOneChat: builder.mutation<void, string>({
      query: (chatId) => ({
        url: `/chats/one-on-one/${chatId}`,
        method: "DELETE",
      }),
      transformResponse: (response: ApiResponse<void>) => {
        return response.data;
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
      invalidatesTags: [{ type: "Chat", id: "LIST" }],
    }),
    leaveGroupChat: builder.mutation<void, string>({
      query: (chatId) => ({
        url: `/chats/group/${chatId}/leave`,
        method: "POST",
      }),
      transformResponse: (response: ApiResponse<void>) => {
        return response.data;
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
      invalidatesTags: [{ type: "Chat", id: "LIST" }],
    }),
    deleteGroupChat: builder.mutation<void, string>({
      query: (chatId) => ({
        url: `/chats/group/${chatId}`,
        method: "DELETE",
      }),
      transformResponse: (response: ApiResponse<void>) => {
        return response.data;
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
      invalidatesTags: [{ type: "Chat", id: "LIST" }],
    }),
  }),
});

export const {
  useGetChatsQuery,
  useGetMessagesByChatIdQuery,
  useLazySearchUsersQuery,
  useCreateOneToOneChatMutation,
  useSendMessageMutation,
  useMarkChatAsReadMutation,
  useRemoveParticipantMutation,
  useGetSuggestedUsersQuery,
  useCreateGroupChatMutation,
  useAddParticipantsMutation,
  useDeleteMessageMutation,
  useDeleteOneToOneChatMutation,
  useLeaveGroupChatMutation,
  useDeleteGroupChatMutation,
} = chatsApi;
