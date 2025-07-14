import { api } from "@/features/api";
import ApiError, {
  ApiErrorResponse,
  createApiError,
} from "@/features/api-error";
import { ApiResponse } from "@/features/api-response";
import {
  GetTransactionsRequest,
  GetTransactionsResponse,
  PaymentOnboardingStatus,
  RevenueAnalysisData,
  RevenueAnalysisFilters,
  RevenueTrendData,
  TopEarningEvent,
  Transaction,
  TransactionVolumeTrendData,
} from "@/types";
import { setLoading, setOnboardingStatus } from "./slice";

interface PaymentIntent {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
}

interface PaymentConfirmation {
  paymentIntentId: string;
  status: "COMPLETED" | "FAILED" | "PENDING" | "CANCELLED";
  ticketId?: string;
  registrationId?: string;
}

export interface CreateCheckoutSessionRequest {
  eventId: string;
  registrationId: string;
  successUrl?: string;
  cancelUrl?: string;
}

export interface CreateCheckoutSessionResponse {
  transaction: {
    id: string;
    eventId: string;
    studentId: string;
    registrationId: string;
    amount: number;
    status: string;
    stripeCheckoutSessionId: string;
  };
  checkoutUrl: string;
  sessionId: string;
}

export interface PaymentStatusResponse {
  sessionId: string;
  status: string;
  ticketId?: string;
  registrationId: string;
}

export interface PaymentSuccessRequest {
  sessionId: string;
}

export interface PaymentSuccessResponse {
  sessionId: string;
  status: string;
  registrationId: string;
}

export interface DashboardKPIsResponse {
  currentAccountBalance: number;
  totalRevenue: {
    allTime: number;
    period: number;
    change: number;
  };
  totalPaidRegistrations: {
    allTime: number;
    period: number;
    change: number;
  };
  upcomingProjectedRevenue: number;
}

export const paymentsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getOnboardingStatus: builder.query<
      PaymentOnboardingStatus | ApiError,
      string
    >({
      query: (societyId) => `/payments/onboarding/status/${societyId}`,
      transformResponse: (response: ApiResponse<PaymentOnboardingStatus>) => {
        if (response.success) {
          return response.data;
        }
        return createApiError(response.message);
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
      providesTags: ["OnboardingStatus"],
      onQueryStarted: (_, { dispatch, queryFulfilled }) => {
        dispatch(setLoading(true));

        queryFulfilled.then(({ data }) => {
          const status = data && !("error" in data) ? data : undefined;

          if (status) {
            dispatch(setOnboardingStatus(status));
          }
        });
        queryFulfilled.finally(() => {
          dispatch(setLoading(false));
        });
      },
    }),
    startOnboarding: builder.mutation<
      { onboardingUrl: string } | ApiError,
      {
        societyId: string;
        returnUrl?: string;
      }
    >({
      query: (body) => ({
        url: "/payments/onboarding/start",
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<{ onboardingUrl: string }>) => {
        if (response.success) {
          return response.data;
        }
        return createApiError(response.message);
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
      invalidatesTags: ["OnboardingStatus"],
    }),
    // Complete onboarding (called after Stripe redirect)
    completeOnboarding: builder.mutation<
      PaymentOnboardingStatus | ApiError,
      { societyId: string }
    >({
      query: ({ societyId }) => ({
        url: `/payments/onboarding/complete`,
        method: "POST",
        body: { societyId },
      }),
      transformResponse: (response: ApiResponse<PaymentOnboardingStatus>) => {
        if (response.success) {
          return response.data;
        }
        return createApiError(response.message);
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
      invalidatesTags: ["OnboardingStatus"],
      onQueryStarted: (_, { dispatch, queryFulfilled }) => {
        dispatch(setLoading(true));

        queryFulfilled.then(({ data }) => {
          const status = data && !("error" in data) ? data : undefined;

          if (status) {
            dispatch(setOnboardingStatus(status));
          }
        });
        queryFulfilled.finally(() => {
          dispatch(setLoading(false));
        });
      },
    }),
    // Create payment intent for event registration
    createPaymentIntent: builder.mutation<
      PaymentIntent | ApiError,
      { eventId: string; registrationId: string }
    >({
      query: ({ eventId, registrationId }) => ({
        url: `/payments/create-payment-intent`,
        method: "POST",
        body: { eventId, registrationId },
      }),
      transformResponse: (response: ApiResponse<PaymentIntent>) => {
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
    // Confirm payment and register for event
    confirmPayment: builder.mutation<
      PaymentConfirmation | ApiError,
      { paymentIntentId: string }
    >({
      query: ({ paymentIntentId }) => ({
        url: `/payments/confirm-payment`,
        method: "POST",
        body: { paymentIntentId },
      }),
      transformResponse: (response: ApiResponse<PaymentConfirmation>) => {
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
    // Get payment status
    getPaymentStatus: builder.query<PaymentConfirmation, string>({
      query: (paymentIntentId) => `/payments/payment-status/${paymentIntentId}`,
      transformResponse: (response: ApiResponse<PaymentConfirmation>) => {
        return response.data;
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
    }),
    // Cancel payment intent
    cancelPaymentIntent: builder.mutation<
      { paymentIntentId: string; transaction: Transaction } | ApiError,
      { paymentIntentId: string }
    >({
      query: ({ paymentIntentId }) => ({
        url: `/payments/cancel-payment-intent/${paymentIntentId}`,
        method: "POST",
      }),
      transformResponse: (
        response: ApiResponse<{
          paymentIntentId: string;
          transaction: Transaction;
        }>
      ) => {
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
    createCheckoutSession: builder.mutation<
      CreateCheckoutSessionResponse,
      CreateCheckoutSessionRequest
    >({
      query: (data) => ({
        url: `/payments/create-checkout-session`,
        method: "POST",
        body: data,
      }),
      transformResponse: (
        response: ApiResponse<CreateCheckoutSessionResponse>
      ) => {
        return response.data;
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
    }),
    handlePaymentSuccess: builder.mutation<
      PaymentStatusResponse,
      PaymentSuccessRequest
    >({
      query: (data) => ({
        url: `/payments/handle-payment-success`,
        method: "POST",
        body: data,
      }),
      transformResponse: (response: ApiResponse<PaymentStatusResponse>) => {
        return response.data;
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
    }),
    getPaymentDashboardKPIs: builder.query<
      DashboardKPIsResponse,
      { societyId: string; startDate?: string; endDate?: string }
    >({
      query: ({ societyId, startDate, endDate }) =>
        `/payments/dashboard-kpis/${societyId}?startDate=${startDate}&endDate=${endDate}`,
      transformResponse: (response: ApiResponse<DashboardKPIsResponse>) => {
        return response.data;
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
    }),
    getRevenueAnalysis: builder.query<
      RevenueAnalysisData,
      { societyId: string } & RevenueAnalysisFilters
    >({
      query: ({ societyId, startDate, endDate, groupBy, topEventsLimit }) =>
        `/payments/${societyId}/revenue-analysis?startDate=${startDate}&endDate=${endDate}&groupBy=${
          groupBy ? groupBy : "week"
        }&topEventsLimit=${topEventsLimit ? topEventsLimit : "10"}`,
      transformResponse: (response: ApiResponse<RevenueAnalysisData>) => {
        return response.data;
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
    }),
    getRevenueTrend: builder.query<
      RevenueTrendData[],
      { societyId: string } & RevenueAnalysisFilters
    >({
      query: ({ societyId, startDate, endDate, groupBy, topEventsLimit }) =>
        `/payments/${societyId}/revenue-trend?startDate=${startDate}&endDate=${endDate}&groupBy=${
          groupBy ? groupBy : "week"
        }&topEventsLimit=${topEventsLimit ? topEventsLimit : "10"}`,
      transformResponse: (response: ApiResponse<RevenueTrendData[]>) => {
        return response.data;
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
    }),
    getTopEarningEvents: builder.query<
      TopEarningEvent[],
      { societyId: string } & RevenueAnalysisFilters
    >({
      query: ({ societyId, startDate, endDate, groupBy, topEventsLimit }) =>
        `/payments/${societyId}/top-earning-events?startDate=${startDate}&endDate=${endDate}&groupBy=${
          groupBy ? groupBy : "week"
        }&topEventsLimit=${topEventsLimit ? topEventsLimit : "5"}`,
      transformResponse: (response: ApiResponse<TopEarningEvent[]>) => {
        return response.data;
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
    }),
    getTransactionVolumeTrend: builder.query<
      TransactionVolumeTrendData[],
      { societyId: string } & RevenueAnalysisFilters
    >({
      query: ({ societyId, startDate, endDate, groupBy, topEventsLimit }) =>
        `/payments/${societyId}/transaction-volume-trend?startDate=${startDate}&endDate=${endDate}&groupBy=${
          groupBy ? groupBy : "week"
        }&topEventsLimit=${topEventsLimit ? topEventsLimit : "10"}`,
      transformResponse: (
        response: ApiResponse<TransactionVolumeTrendData[]>
      ) => {
        return response.data;
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
    }),
    getTransactions: builder.query<
      GetTransactionsResponse,
      GetTransactionsRequest
    >({
      query: (args) =>
        `/payments/${args.societyId}/transactions?page=${
          args.page ? args.page : 1
        }&limit=${args.limit ? args.limit : 20}&search=${
          args.search ? args.search : ""
        }&sortBy=${args.sortBy ? args.sortBy : "createdAt"}&sortOrder=${
          args.sortOrder ? args.sortOrder : "desc"
        }&status=${args.status ? args.status : ""}`,
      transformResponse: (response: ApiResponse<GetTransactionsResponse>) => {
        return response.data;
      },
      transformErrorResponse: (response) => {
        const errorResponse = response.data as ApiErrorResponse;
        return createApiError(errorResponse.message);
      },
    }),
  }),
});

export const {
  useGetOnboardingStatusQuery,
  useCompleteOnboardingMutation,
  useConfirmPaymentMutation,
  useCreatePaymentIntentMutation,
  useGetPaymentStatusQuery,
  useStartOnboardingMutation,
  useCancelPaymentIntentMutation,
  useCreateCheckoutSessionMutation,
  useHandlePaymentSuccessMutation,
  useGetPaymentDashboardKPIsQuery,
  useGetRevenueAnalysisQuery,
  useGetRevenueTrendQuery,
  useGetTopEarningEventsQuery,
  useGetTransactionVolumeTrendQuery,
  useGetTransactionsQuery,
} = paymentsApi;
