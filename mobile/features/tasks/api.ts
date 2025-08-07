import { api } from "@/store/api";
import { Task } from "./types";
import { ApiResponse } from "@/store/api-response";
import { ApiErrorResponse, createApiError } from "@/store/api-error";

export const TasksApi = api.injectEndpoints({
  endpoints: (builder) => ({
    assignTask: builder.mutation<
      Task,
      { description: string; memberId: string; societyId: string }
    >({
      query: (data) => ({
        url: "/tasks/assign",
        method: "POST",
        body: data,
      }),
      transformResponse: (response: ApiResponse<Task>) => {
        return response.data;
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
    }),
  }),
});

export const { useAssignTaskMutation } = TasksApi;
