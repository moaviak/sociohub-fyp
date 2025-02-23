export interface ApiErrorResponse {
  statusCode: number;
  message: string;
  errors: unknown[];
  stack: string;
}

interface ApiError {
  error: true;
  errorMessage: string;
  errorData?: {
    status?: number | string;
    data?: unknown;
  };
  errorResponse?: ApiErrorResponse;
}

// Add this function to create ApiError objects
export const createApiError = (
  message: string,
  errorData?: ApiError["errorData"],
  errorResponse?: ApiErrorResponse
): ApiError => ({
  error: true,
  errorMessage: message,
  errorData,
  errorResponse,
});

export default ApiError;
