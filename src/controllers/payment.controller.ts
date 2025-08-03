import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import paymentService from "../services/payment.service";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { IUser, UserType } from "../types";
import paymentDashboardService from "../services/payment-dashboard.service";
import activityService from "../services/activity.service";

export const createCheckoutSession = asyncHandler(
  async (req: Request, res: Response) => {
    const { eventId, registrationId, successUrl, cancelUrl } = req.body;
    const studentId = (req.user as IUser).id;

    const result = await paymentService.createCheckoutSession(
      eventId,
      studentId,
      registrationId,
      successUrl,
      cancelUrl
    );

    return res
      .status(200)
      .json(new ApiResponse(200, result, "Checkout session created."));
  }
);

export const handlePaymentSuccess = asyncHandler(
  async (req: Request, res: Response) => {
    const { sessionId } = req.body;

    const result = await paymentService.processSuccessfulPayment(sessionId);

    return res
      .status(200)
      .json(new ApiResponse(200, result, "Payment successfully completed."));
  }
);

export const getEventTransactions = asyncHandler(
  async (req: Request, res: Response) => {
    const { eventId } = req.params;

    if (!eventId) {
      throw new ApiError(400, "Missing Event Id from parameters.");
    }

    const transactions = await paymentService.getEventTransactions(eventId);

    return res.status(200).json(new ApiResponse(200, transactions));
  }
);

export const getOnboardingStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const { societyId } = req.params;

    if (!societyId) {
      throw new ApiError(400, "Society ID is missing from parameters.");
    }

    const result = await paymentService.getSocietyOnboardingStatus(societyId);

    return res.status(200).json(new ApiResponse(200, result));
  }
);

export const startOnboarding = asyncHandler(
  async (req: Request, res: Response) => {
    const { societyId, returnUrl } = req.body;
    const user = req.user as IUser;

    const accountLink = await paymentService.startOnboarding(
      societyId,
      user.email,
      returnUrl
    );

    if (user.userType === UserType.STUDENT) {
      activityService.createActivityLog({
        studentId: user.id,
        societyId,
        action: "Start Payment Account On-Boarding",
        description: `${user.firstName} ${user.lastName} started society payment account on-boardnig process.`,
        nature: "NEUTRAL",
      });
    }

    return res
      .status(200)
      .json(new ApiResponse(200, { onboardingUrl: accountLink.url }));
  }
);

export const completeOnboarding = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user as IUser;
    const { societyId, accountId } = req.body;

    const status = await paymentService.completeOnboarding(societyId);

    if (user.userType === UserType.STUDENT && status.isOnboarded) {
      activityService.createActivityLog({
        studentId: user.id,
        societyId,
        action: "Complete Payment Account On-Boarding",
        description: `${user.firstName} ${user.lastName} completed the payment account on-boarding process.`,
        nature: "CONSTRUCTIVE",
      });
    }

    res.status(200).json(new ApiResponse(200, status));
  }
);

export const getPaymentStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const { sessionId } = req.params;
    if (!sessionId) {
      throw new ApiError(400, "Session Id is required.");
    }

    const response = await paymentService.getPaymentStatus(sessionId);

    return res.status(200).json(new ApiResponse(200, response));
  }
);

export const getPaymentDashboardKPIs = asyncHandler(
  async (req: Request, res: Response) => {
    const { societyId } = req.params;
    const { startDate, endDate } = req.query;
    let options = undefined;
    if (startDate || endDate) {
      options = {
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
      };
    }
    const kpis = await paymentDashboardService.getPaymentDashboardKPIs(
      societyId,
      options
    );
    return res.status(200).json(new ApiResponse(200, kpis));
  }
);

/**
 * Get revenue trend data
 * @route GET /api/payments/:societyId/revenue-trend
 * @access Private (Society Admin)
 */
export const getRevenueTrend = asyncHandler(
  async (req: Request, res: Response) => {
    const { societyId } = req.params;

    const { startDate, endDate, groupBy = "day" } = req.query;

    // Validate required parameters
    if (!startDate || !endDate) {
      throw new ApiError(400, "Start date and end date are required");
    }

    // Validate groupBy parameter
    if (!["day", "week", "month"].includes(groupBy as string)) {
      throw new ApiError(
        400,
        "Invalid groupBy parameter. Must be 'day', 'week', or 'month'"
      );
    }

    // Parse dates
    const start = new Date(startDate as string);
    const end = new Date(endDate as string);

    // Validate dates
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new ApiError(400, "Invalid date format");
    }

    if (start >= end) {
      throw new ApiError(400, "Start date must be before end date");
    }

    const trendData = await paymentDashboardService.getRevenueTrend(
      societyId,
      start,
      end,
      groupBy as "day" | "week" | "month"
    );

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          trendData,
          "Revenue trend data retrieved successfully"
        )
      );
  }
);

/**
 * Get top earning events
 * @route GET /api/payments/:societyId/top-earning-events
 * @access Private (Society Admin)
 */
export const getTopEarningEvents = asyncHandler(
  async (req: Request, res: Response) => {
    const { societyId } = req.params;
    const { limit = 5 } = req.query;

    // Validate limit parameter
    const parsedLimit = parseInt(limit as string);
    if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 50) {
      throw new ApiError(
        400,
        "Invalid limit parameter. Must be between 1 and 50"
      );
    }

    const topEvents = await paymentDashboardService.getTopEarningEvents(
      societyId,
      parsedLimit
    );

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          topEvents,
          "Top earning events retrieved successfully"
        )
      );
  }
);

/**
 * Get transaction volume trend
 * @route GET /api/payments/:societyId/transaction-volume-trend
 * @access Private (Society Admin)
 */
export const getTransactionVolumeTrend = asyncHandler(
  async (req: Request, res: Response) => {
    const { societyId } = req.params;
    const { startDate, endDate, groupBy = "day" } = req.query;

    // Validate required parameters
    if (!startDate || !endDate) {
      throw new ApiError(400, "Start date and end date are required");
    }

    // Validate groupBy parameter
    if (!["day", "week", "month"].includes(groupBy as string)) {
      throw new ApiError(
        400,
        "Invalid groupBy parameter. Must be 'day', 'week', or 'month'"
      );
    }

    // Parse dates
    const start = new Date(startDate as string);
    const end = new Date(endDate as string);

    // Validate dates
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new ApiError(400, "Invalid date format");
    }

    if (start >= end) {
      throw new ApiError(400, "Start date must be before end date");
    }

    const volumeTrend = await paymentDashboardService.getTransactionVolumeTrend(
      societyId,
      start,
      end,
      groupBy as "day" | "week" | "month"
    );

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          volumeTrend,
          "Transaction volume trend retrieved successfully"
        )
      );
  }
);

/**
 * Get revenue breakdown
 * @route GET /api/payments/:societyId/revenue-breakdown
 * @access Private (Society Admin)
 */
export const getRevenueBreakdown = asyncHandler(
  async (req: Request, res: Response) => {
    const { societyId } = req.params;
    const { startDate, endDate } = req.query;

    let start: Date | undefined;
    let end: Date | undefined;

    // Parse dates if provided
    if (startDate) {
      start = new Date(startDate as string);
      if (isNaN(start.getTime())) {
        throw new ApiError(400, "Invalid start date format");
      }
    }

    if (endDate) {
      end = new Date(endDate as string);
      if (isNaN(end.getTime())) {
        throw new ApiError(400, "Invalid end date format");
      }
    }

    // Validate date range if both provided
    if (start && end && start >= end) {
      throw new ApiError(400, "Start date must be before end date");
    }

    const breakdown = await paymentDashboardService.getRevenueBreakdown(
      societyId,
      start,
      end
    );

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          breakdown,
          "Revenue breakdown retrieved successfully"
        )
      );
  }
);

/**
 * Get comprehensive revenue analysis
 * @route GET /api/payments/:societyId/revenue-analysis
 * @access Private (Society Admin)
 */
export const getRevenueAnalysis = asyncHandler(
  async (req: Request, res: Response) => {
    const { societyId } = req.params;
    const {
      startDate,
      endDate,
      groupBy = "week",
      topEventsLimit = 10,
    } = req.query;

    // Validate required parameters
    if (!startDate || !endDate) {
      throw new ApiError(400, "Start date and end date are required");
    }

    // Parse dates
    const start = new Date(startDate as string);
    const end = new Date(endDate as string);

    // Validate dates
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new ApiError(400, "Invalid date format");
    }

    if (start >= end) {
      throw new ApiError(400, "Start date must be before end date");
    }

    const limit = parseInt(topEventsLimit as string) || 10;

    // Fetch all data in parallel
    const [
      revenueTrend,
      topEarningEvents,
      transactionVolumeTrend,
      revenueBreakdown,
    ] = await Promise.all([
      paymentDashboardService.getRevenueTrend(
        societyId,
        start,
        end,
        groupBy as "day" | "week" | "month"
      ),
      paymentDashboardService.getTopEarningEvents(societyId, limit),
      paymentDashboardService.getTransactionVolumeTrend(
        societyId,
        start,
        end,
        groupBy as "day" | "week" | "month"
      ),
      paymentDashboardService.getRevenueBreakdown(societyId, start, end),
    ]);

    const analysisData = {
      revenueTrend,
      topEarningEvents,
      transactionVolumeTrend,
      revenueBreakdown,
      dateRange: {
        startDate: start,
        endDate: end,
        groupBy,
      },
    };

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          analysisData,
          "Revenue analysis retrieved successfully"
        )
      );
  }
);

/**
 * Get society payment transactions
 * @route GET /api/payments/:societyId/transactions
 * @access Private (Society Admin)
 */
export const getSocietyPaymentTransactions = asyncHandler(
  async (req: Request, res: Response) => {
    const { societyId } = req.params;
    const {
      page = 1,
      limit = 20,
      search = "",
      sortBy = "createdAt",
      sortOrder = "desc",
      status,
    } = req.query;

    const transactions =
      await paymentDashboardService.fetchSocietyPaymentTransactions({
        societyId,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        search: search as string,
        sortBy: sortBy as "createdAt" | "paidAt",
        sortOrder: sortOrder as "asc" | "desc",
        status: status as string,
      });

    return res.status(200).json(new ApiResponse(200, transactions));
  }
);
