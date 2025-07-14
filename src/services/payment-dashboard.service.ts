import prisma from "../db";
import { Prisma } from "@prisma/client";
import { ApiError } from "../utils/ApiError";
import stripeService from "./stripe.service";

// Types
interface KPIOptions {
  startDate?: Date;
  endDate?: Date;
}

interface PeriodData {
  startDate: Date;
  endDate: Date;
}

interface KPIMetric {
  allTime: number;
  period: number;
  change: number;
}

interface DashboardKPIs {
  currentAccountBalance: number;
  totalRevenue: KPIMetric;
  totalPaidRegistrations: KPIMetric;
  upcomingProjectedRevenue: number;
}

// Utility Functions
class DateUtils {
  static calculatePreviousPeriod(startDate: Date, endDate: Date): PeriodData {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diff = end.getTime() - start.getTime();

    return {
      startDate: new Date(start.getTime() - diff),
      endDate: new Date(end.getTime() - diff),
    };
  }

  static createDateFilter(options?: KPIOptions): any {
    const dateFilter: any = {};
    if (options?.startDate) dateFilter.gte = options.startDate;
    if (options?.endDate) dateFilter.lte = options.endDate;
    return dateFilter;
  }
}

class MathUtils {
  static percentChange(current: number, previous: number): number {
    if (previous === 0) return current === 0 ? 0 : 100;
    return ((current - previous) / Math.abs(previous)) * 100;
  }

  static calculateMovingAverage(values: number[], period: number = 3): number {
    if (values.length === 0) return 0;
    const relevantValues = values.slice(-period);
    return (
      relevantValues.reduce((sum, val) => sum + val, 0) / relevantValues.length
    );
  }

  static calculateLinearTrend(values: number[], periods: number = 3): number {
    if (values.length < 2) return 0;

    const recentValues = values.slice(-periods);
    const n = recentValues.length;

    if (n < 2) return 0;

    // Calculate linear regression slope
    const xValues = Array.from({ length: n }, (_, i) => i);
    const xMean = xValues.reduce((sum, x) => sum + x, 0) / n;
    const yMean = recentValues.reduce((sum, y) => sum + y, 0) / n;

    const numerator = xValues.reduce(
      (sum, x, i) => sum + (x - xMean) * (recentValues[i] - yMean),
      0
    );
    const denominator = xValues.reduce(
      (sum, x) => sum + Math.pow(x - xMean, 2),
      0
    );

    return denominator === 0 ? 0 : numerator / denominator;
  }
}

// Data Access Layer
class PaymentDataAccess {
  static async getPaymentConfig(societyId: string) {
    return await prisma.societyPaymentConfig.findUnique({
      where: { societyId },
    });
  }

  static async getAccountBalance(stripeAccountId: string): Promise<number> {
    try {
      const balance = await stripeService.getAccountBalance(stripeAccountId);

      if (balance && Array.isArray(balance.available)) {
        return balance.available.reduce(
          (sum, entry) => sum + (entry.amount || 0),
          0
        );
      }
      return 0;
    } catch (error) {
      console.error("Error fetching account balance:", error);
      return 0;
    }
  }

  static async getTotalRevenue(societyId: string, dateFilter?: any) {
    const where = {
      status: "COMPLETED",
      event: { societyId },
      ...(dateFilter &&
        Object.keys(dateFilter).length > 0 && { paidAt: dateFilter }),
    };

    return await prisma.paymentTransaction.aggregate({
      _sum: { amount: true },
      where,
    });
  }

  static async getTotalPaidRegistrations(societyId: string, dateFilter?: any) {
    const where = {
      status: "COMPLETED",
      event: { societyId },
      ...(dateFilter &&
        Object.keys(dateFilter).length > 0 && { paidAt: dateFilter }),
    };

    return await prisma.paymentTransaction.count({ where });
  }

  static async getFuturePaidEvents(societyId: string) {
    const now = new Date();
    return await prisma.event.findMany({
      where: {
        societyId,
        paidEvent: true,
        startDate: { gt: now },
        isDraft: false,
      },
      select: { id: true, ticketPrice: true, startDate: true },
    });
  }

  static async getCompletedPaymentsForEvent(eventId: string) {
    return await prisma.paymentTransaction.count({
      where: {
        eventId,
        status: "COMPLETED",
      },
    });
  }

  static async getHistoricalRevenue(societyId: string, periods: number = 6) {
    const now = new Date();
    const monthlyRevenue: number[] = [];

    for (let i = periods - 1; i >= 0; i--) {
      const startDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const endDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

      const revenue = await this.getTotalRevenue(societyId, {
        gte: startDate,
        lte: endDate,
      });

      monthlyRevenue.push(revenue._sum.amount || 0);
    }

    return monthlyRevenue;
  }

  static async getRevenueTrend(
    societyId: string,
    startDate: Date,
    endDate: Date,
    groupBy: "day" | "week" | "month" = "day"
  ): Promise<any> {
    const dateGrouping = this.getDateGrouping(groupBy);
    const result = await prisma.$queryRaw`
      SELECT 
        ${Prisma.sql([dateGrouping])} as date,
        SUM(pt."amount") as revenue,
        COUNT(*) as transactions
      FROM "PaymentTransaction" pt
      INNER JOIN "Event" e ON pt."eventId" = e."id"
      WHERE e."societyId" = ${societyId}
        AND pt."status" = 'COMPLETED'
        AND pt."paidAt" >= ${startDate}
        AND pt."paidAt" <= ${endDate}
      GROUP BY ${Prisma.sql([dateGrouping])}
      ORDER BY ${Prisma.sql([dateGrouping])} ASC
    `;
    return result;
  }

  static async getTopEarningEvents(societyId: string, limit: number = 10) {
    const result = await prisma.event.findMany({
      where: {
        societyId,
        isDraft: false,
      },
      select: {
        id: true,
        title: true,
        startDate: true,
        ticketPrice: true,
        _count: {
          select: {
            paymentTransactions: {
              where: {
                status: "COMPLETED",
              },
            },
          },
        },
        paymentTransactions: {
          where: {
            status: "COMPLETED",
          },
          select: {
            amount: true,
          },
        },
      },
      orderBy: {
        paymentTransactions: {
          _count: "desc",
        },
      },
      take: limit,
    });

    return result
      .map((event) => ({
        id: event.id,
        title: event.title,
        startDate: event.startDate,
        ticketPrice: event.ticketPrice,
        totalTransactions: event._count.paymentTransactions,
        totalRevenue: event.paymentTransactions.reduce(
          (sum, pt) => sum + pt.amount,
          0
        ),
      }))
      .sort((a, b) => b.totalRevenue - a.totalRevenue);
  }

  static async getTransactionVolumeTrend(
    societyId: string,
    startDate: Date,
    endDate: Date,
    groupBy: "day" | "week" | "month" = "day"
  ): Promise<any> {
    const dateGrouping = this.getDateGrouping(groupBy);
    const result = await prisma.$queryRaw`
      SELECT 
        ${Prisma.sql([dateGrouping])} as date,
        COUNT(*) as transaction_count,
        COUNT(DISTINCT pt."eventId") as unique_events
      FROM "PaymentTransaction" pt
      INNER JOIN "Event" e ON pt."eventId" = e."id"
      WHERE e."societyId" = ${societyId}
        AND pt."status" = 'COMPLETED'
        AND pt."paidAt" >= ${startDate}
        AND pt."paidAt" <= ${endDate}
      GROUP BY ${Prisma.sql([dateGrouping])}
      ORDER BY ${Prisma.sql([dateGrouping])} ASC
    `;
    return result;
  }

  static async fetchSocietyPaymentTransactions({
    societyId,
    page = 1,
    limit = 20,
    search = "",
    sortBy = "createdAt",
    sortOrder = "desc",
    status,
  }: {
    societyId: string;
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: "createdAt" | "paidAt";
    sortOrder?: "asc" | "desc";
    status?: string;
  }) {
    const skip = (page - 1) * limit;
    const where: any = {
      event: { societyId },
    };
    if (status) {
      where.status = status;
    }
    if (search && search.trim()) {
      where.OR = [
        { description: { contains: search, mode: "insensitive" } },
        { student: { firstName: { contains: search, mode: "insensitive" } } },
        { student: { lastName: { contains: search, mode: "insensitive" } } },
        { student: { email: { contains: search, mode: "insensitive" } } },
        {
          student: {
            registrationNumber: { contains: search, mode: "insensitive" },
          },
        },
        { event: { title: { contains: search, mode: "insensitive" } } },
      ];
    }
    const [transactions, total] = await Promise.all([
      prisma.paymentTransaction.findMany({
        where,
        include: {
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              registrationNumber: true,
              avatar: true,
            },
          },
          event: {
            select: {
              id: true,
              title: true,
              startDate: true,
              ticketPrice: true,
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.paymentTransaction.count({ where }),
    ]);
    return {
      transactions,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      limit,
    };
  }

  private static getDateGrouping(groupBy: "day" | "week" | "month") {
    switch (groupBy) {
      case "day":
        return 'DATE(pt."paidAt")';
      case "week":
        return "DATE_TRUNC('week', pt.\"paidAt\")";
      case "month":
        return "DATE_TRUNC('month', pt.\"paidAt\")";
      default:
        return 'DATE(pt."paidAt")';
    }
  }

  static async getRevenueBreakdown(
    societyId: string,
    startDate?: Date,
    endDate?: Date
  ) {
    const dateFilter = DateUtils.createDateFilter({ startDate, endDate });

    const where = {
      status: "COMPLETED" as const,
      event: { societyId },
      ...(dateFilter &&
        Object.keys(dateFilter).length > 0 && { paidAt: dateFilter }),
    };

    const [totalRevenue, totalTransactions, avgTransactionAmount] =
      await Promise.all([
        prisma.paymentTransaction.aggregate({
          _sum: { amount: true },
          where,
        }),
        prisma.paymentTransaction.count({ where }),
        prisma.paymentTransaction.aggregate({
          _avg: { amount: true },
          where,
        }),
      ]);

    return {
      totalRevenue: totalRevenue._sum.amount || 0,
      totalTransactions,
      avgTransactionAmount: avgTransactionAmount._avg.amount || 0,
    };
  }
}

// Business Logic Layer
class ProjectedRevenueCalculator {
  static async calculateAdvancedProjectedRevenue(
    societyId: string,
    options?: KPIOptions
  ): Promise<number> {
    const futurePaidEvents = await PaymentDataAccess.getFuturePaidEvents(
      societyId
    );

    if (futurePaidEvents.length === 0) return 0;

    // Get historical revenue data for trend analysis
    const historicalRevenue = await PaymentDataAccess.getHistoricalRevenue(
      societyId
    );

    // Calculate base projected revenue (current registrations)
    let baseProjectedRevenue = 0;
    const eventProjections: Array<{
      eventId: string;
      baseRevenue: number;
      projectedRevenue: number;
    }> = [];

    for (const event of futurePaidEvents) {
      if (!event.ticketPrice) continue;

      const paidRegs = await PaymentDataAccess.getCompletedPaymentsForEvent(
        event.id
      );
      const baseRevenue = paidRegs * event.ticketPrice;
      baseProjectedRevenue += baseRevenue;

      eventProjections.push({
        eventId: event.id,
        baseRevenue,
        projectedRevenue: baseRevenue,
      });
    }

    // Apply trend analysis if we have historical data
    if (historicalRevenue.length >= 3) {
      const movingAverage = MathUtils.calculateMovingAverage(historicalRevenue);
      const trendMultiplier = MathUtils.calculateLinearTrend(historicalRevenue);

      // Apply conservative growth prediction (limit to reasonable bounds)
      const growthFactor = Math.max(
        0.5,
        Math.min(2.0, 1 + trendMultiplier * 0.1)
      );
      const trendAdjustedRevenue = baseProjectedRevenue * growthFactor;

      // Weighted average between base projection and trend-adjusted projection
      const trendWeight = Math.min(historicalRevenue.length / 6, 1); // More weight with more data
      return (
        baseProjectedRevenue * (1 - trendWeight) +
        trendAdjustedRevenue * trendWeight
      );
    }

    return baseProjectedRevenue;
  }
}

// Main Service Class
class PaymentDashboardService {
  async getPaymentDashboardKPIs(
    societyId: string,
    options?: KPIOptions
  ): Promise<DashboardKPIs> {
    // 1. Validate payment configuration
    const paymentConfig = await PaymentDataAccess.getPaymentConfig(societyId);
    if (!paymentConfig?.stripeAccountId) {
      throw new ApiError(400, "Society payment setup not complete");
    }

    // 2. Get current account balance
    const currentAccountBalance = await PaymentDataAccess.getAccountBalance(
      paymentConfig.stripeAccountId
    );

    // 3. Setup date filters
    const dateFilter = DateUtils.createDateFilter(options);
    const previousPeriod =
      options?.startDate && options?.endDate
        ? DateUtils.calculatePreviousPeriod(options.startDate, options.endDate)
        : undefined;

    // 4. Calculate revenue metrics
    const [
      totalRevenueAllTime,
      totalRevenuePeriod,
      totalRevenuePreviousPeriod,
    ] = await Promise.all([
      PaymentDataAccess.getTotalRevenue(societyId),
      options?.startDate || options?.endDate
        ? PaymentDataAccess.getTotalRevenue(societyId, dateFilter)
        : PaymentDataAccess.getTotalRevenue(societyId),
      previousPeriod
        ? PaymentDataAccess.getTotalRevenue(societyId, {
            gte: previousPeriod.startDate,
            lte: previousPeriod.endDate,
          })
        : Promise.resolve({ _sum: { amount: 0 } }),
    ]);

    // 5. Calculate registration metrics
    const [
      totalPaidRegistrationsAllTime,
      totalPaidRegistrationsPeriod,
      totalPaidRegistrationsPreviousPeriod,
    ] = await Promise.all([
      PaymentDataAccess.getTotalPaidRegistrations(societyId),
      options?.startDate || options?.endDate
        ? PaymentDataAccess.getTotalPaidRegistrations(societyId, dateFilter)
        : PaymentDataAccess.getTotalPaidRegistrations(societyId),
      previousPeriod
        ? PaymentDataAccess.getTotalPaidRegistrations(societyId, {
            gte: previousPeriod.startDate,
            lte: previousPeriod.endDate,
          })
        : Promise.resolve(0),
    ]);

    // 6. Calculate projected revenue with advanced algorithm
    const upcomingProjectedRevenue =
      await ProjectedRevenueCalculator.calculateAdvancedProjectedRevenue(
        societyId,
        options
      );

    // 7. Calculate percentage changes
    const revenueChange = previousPeriod
      ? MathUtils.percentChange(
          totalRevenuePeriod._sum.amount || 0,
          totalRevenuePreviousPeriod._sum.amount || 0
        )
      : 0;

    const registrationsChange = previousPeriod
      ? MathUtils.percentChange(
          totalPaidRegistrationsPeriod,
          totalPaidRegistrationsPreviousPeriod
        )
      : 0;

    return {
      currentAccountBalance,
      totalRevenue: {
        allTime: totalRevenueAllTime._sum.amount || 0,
        period: totalRevenuePeriod._sum.amount || 0,
        change: revenueChange,
      },
      totalPaidRegistrations: {
        allTime: totalPaidRegistrationsAllTime,
        period: totalPaidRegistrationsPeriod,
        change: registrationsChange,
      },
      upcomingProjectedRevenue,
    };
  }

  async getRevenueTrend(
    societyId: string,
    startDate: Date,
    endDate: Date,
    groupBy: "day" | "week" | "month" = "day"
  ) {
    const paymentConfig = await PaymentDataAccess.getPaymentConfig(societyId);
    if (!paymentConfig?.stripeAccountId) {
      throw new ApiError(400, "Society payment setup not complete");
    }

    const trendData = await PaymentDataAccess.getRevenueTrend(
      societyId,
      startDate,
      endDate,
      groupBy
    );

    return trendData.map((item: any) => ({
      date: item.date,
      revenue: Number(item.revenue) || 0,
      transactions: Number(item.transactions) || 0,
    }));
  }

  async getTopEarningEvents(societyId: string, limit: number = 10) {
    const paymentConfig = await PaymentDataAccess.getPaymentConfig(societyId);
    if (!paymentConfig?.stripeAccountId) {
      throw new ApiError(400, "Society payment setup not complete");
    }

    return await PaymentDataAccess.getTopEarningEvents(societyId, limit);
  }

  async getTransactionVolumeTrend(
    societyId: string,
    startDate: Date,
    endDate: Date,
    groupBy: "day" | "week" | "month" = "day"
  ) {
    const paymentConfig = await PaymentDataAccess.getPaymentConfig(societyId);
    if (!paymentConfig?.stripeAccountId) {
      throw new ApiError(400, "Society payment setup not complete");
    }

    const trendData = await PaymentDataAccess.getTransactionVolumeTrend(
      societyId,
      startDate,
      endDate,
      groupBy
    );

    return trendData.map((item: any) => ({
      date: item.date,
      transactionCount: Number(item.transaction_count) || 0,
      uniqueEvents: Number(item.unique_events) || 0,
    }));
  }

  async getRevenueBreakdown(
    societyId: string,
    startDate?: Date,
    endDate?: Date
  ) {
    const paymentConfig = await PaymentDataAccess.getPaymentConfig(societyId);
    if (!paymentConfig?.stripeAccountId) {
      throw new ApiError(400, "Society payment setup not complete");
    }

    return await PaymentDataAccess.getRevenueBreakdown(
      societyId,
      startDate,
      endDate
    );
  }

  async fetchSocietyPaymentTransactions(options: {
    societyId: string;
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: "createdAt" | "paidAt";
    sortOrder?: "asc" | "desc";
    status?: string;
  }) {
    const paymentConfig = await PaymentDataAccess.getPaymentConfig(
      options.societyId
    );
    if (!paymentConfig?.isOnboarded) {
      throw new ApiError(400, "Society payment setup not complete");
    }
    return await PaymentDataAccess.fetchSocietyPaymentTransactions(options);
  }
}

export default new PaymentDashboardService();
