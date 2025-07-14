import { Event, Student } from ".";

// types/payment.ts
export interface PaymentOnboardingStatus {
  isOnboarded: boolean;
  accountId?: string;
  detailsSubmitted: boolean;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
}

export interface PaymentMethod {
  id: string;
  type: "card";
  card: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
}

export interface PaymentIntent {
  id: string;
  clientSecret: string;
  amount: number;
  currency: string;
  status:
    | "requires_payment_method"
    | "requires_confirmation"
    | "succeeded"
    | "canceled";
}

export interface Transaction {
  id: string;
  eventId: string;
  studentId: string;
  registrationId: string;
  amount: number;
  status: "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED";
  description: string;
  applicationFeeAmount: number;
  transferAmount: number;
  paidAt: string;
  createdAt: string;
  updatedAt: string;
  student: Student;
  event: Event;
}

export interface PaymentConfig {
  stripePublishableKey: string;
  currency: string;
  minimumAmount: number;
}

export interface RevenueTrendData {
  date: string;
  revenue: number;
  transactions: number;
}

export interface TopEarningEvent {
  id: string;
  title: string;
  startDate: Date;
  ticketPrice: number | null;
  totalTransactions: number;
  totalRevenue: number;
}

export interface TransactionVolumeTrendData {
  date: string;
  transactionCount: number;
  uniqueEvents: number;
}

export interface RevenueBreakdown {
  totalRevenue: number;
  totalTransactions: number;
  avgTransactionAmount: number;
}

export interface RevenueAnalysisData {
  revenueTrend: RevenueTrendData[];
  topEarningEvents: TopEarningEvent[];
  transactionVolumeTrend: TransactionVolumeTrendData[];
  revenueBreakdown: RevenueBreakdown;
  dateRange: {
    startDate: Date;
    endDate: Date;
    groupBy: "day" | "week" | "month";
  };
}

export interface RevenueAnalysisFilters {
  startDate: string;
  endDate: string;
  groupBy: "day" | "week" | "month";
  topEventsLimit?: number;
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export type TimeGrouping = "day" | "week" | "month";

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface RevenueChartData extends ChartDataPoint {
  transactions: number;
}

export interface VolumeChartData extends ChartDataPoint {
  uniqueEvents: number;
}

export interface GetTransactionsRequest {
  societyId: string;
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: "createdAt" | "paidAt";
  sortOrder?: "asc" | "desc";
  status?: "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED";
}

export interface GetTransactionsResponse {
  transactions: Transaction[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
}
