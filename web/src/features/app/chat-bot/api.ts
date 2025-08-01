import { api } from "@/features/api";
import { ApiErrorResponse, createApiError } from "@/features/api-error";
import { ApiResponse } from "@/features/api-response";
import { setError, setLoading, setSessionId } from "./slice";
import { ChatMessage } from "./components/chat-view";
import { v4 as uuid } from "uuid";

const chatBotApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createSession: builder.mutation<{ sessionId: string }, void>({
      query: () => ({
        url: "/chatbot/session",
        method: "POST",
      }),
      transformResponse: (response: ApiResponse<{ sessionId: string }>) => {
        return response.data;
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
      onQueryStarted: (_, { dispatch, queryFulfilled }) => {
        dispatch(setLoading(true));
        queryFulfilled
          .then(({ data }) => {
            dispatch(setSessionId(data.sessionId));
          })
          .catch((error) => {
            console.error("Failed to create session:", error);
            dispatch(setError(error.message));
          })
          .finally(() => {
            dispatch(setLoading(false));
          });
      },
    }),
    sendQuery: builder.mutation<
      ChatMessage,
      { sessionId: string; query: string }
    >({
      query: (args) => ({
        url: "/chatbot/query",
        method: "POST",
        body: args,
      }),
      transformResponse: (
        response: ApiResponse<{
          response: string;
          intermediateSteps: unknown[];
        }>
      ) => {
        return {
          id: uuid(),
          isUser: false,
          text: response.data.response,
          timestamp: new Date().toISOString(),
        };
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
    }),
  }),
});

export const { useCreateSessionMutation, useSendQueryMutation } = chatBotApi;
