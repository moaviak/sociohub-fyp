import { api } from "@/features/api";
import ApiError, {
  ApiErrorResponse,
  createApiError,
} from "@/features/api-error";
import { ApiResponse } from "@/features/api-response";
import { Task } from "@/types";

const TodoListApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getUserTasks: builder.query<Task[] | ApiError, void>({
      query: () => ({
        url: "/tasks",
      }),
      transformResponse: (response: ApiResponse<Task[]>) => {
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
              type: "Tasks" as const,
              id: item.id,
            })),
            { type: "Tasks", id: "LIST" },
          ];
        } else {
          return [];
        }
      },
    }),
    createTask: builder.mutation<Task | ApiError, { description: string }>({
      query: (data) => ({
        url: "/tasks",
        method: "POST",
        body: data,
      }),
      transformResponse: (response: ApiResponse<Task>) => {
        if (response.success) {
          return response.data;
        }
        return createApiError(response.message);
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
      invalidatesTags: [{ type: "Tasks", id: "LIST" }],
    }),
    completeTask: builder.mutation<
      Task | ApiError,
      { id: string; isCompleted: boolean }
    >({
      query: (data) => ({
        url: `/tasks/${data.id}/complete`,
        method: "PATCH",
        body: data,
      }),
      transformResponse: (response: ApiResponse<Task>) => {
        if (response.success) {
          return response.data;
        }
        return createApiError(response.message);
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
    }),
    starTask: builder.mutation<
      Task | ApiError,
      { id: string; isStarred: boolean }
    >({
      query: (data) => ({
        url: `/tasks/${data.id}/star`,
        method: "PATCH",
        body: data,
      }),
      transformResponse: (response: ApiResponse<Task>) => {
        if (response.success) {
          return response.data;
        }
        return createApiError(response.message);
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
    }),
    assignTask: builder.mutation<
      Task | ApiError,
      { description: string; memberId: string; societyId: string }
    >({
      query: (data) => ({
        url: "/tasks/assign",
        method: "POST",
        body: data,
      }),
      transformResponse: (response: ApiResponse<Task>) => {
        if (response.success) {
          return response.data;
        }
        return createApiError(response.message);
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
    }),
    deleteTask: builder.mutation<Task | ApiError, { id: string }>({
      query: (data) => ({
        url: `/tasks/${data.id}`,
        method: "DELETE",
      }),
      transformResponse: (response: ApiResponse<Task>) => {
        if (response.success) {
          return response.data;
        }
        return createApiError(response.message);
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
      invalidatesTags: [{ type: "Tasks", id: "LIST" }],
    }),
    updateTask: builder.mutation<
      Task | ApiError,
      { id: string; description: string }
    >({
      query: (data) => ({
        url: `/tasks/${data.id}`,
        method: "PATCH",
        body: data,
      }),
      transformResponse: (response: ApiResponse<Task>) => {
        if (response.success) {
          return response.data;
        }
        return createApiError(response.message);
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
    }),
  }),
});

export const {
  useGetUserTasksQuery,
  useCreateTaskMutation,
  useCompleteTaskMutation,
  useStarTaskMutation,
  useAssignTaskMutation,
  useDeleteTaskMutation,
  useUpdateTaskMutation,
} = TodoListApi;
