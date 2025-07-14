// Date Utility Functions
export const dateUtils = {
  /**
   * Format date for display
   */
  formatDate: (dateString: string, options?: Intl.DateTimeFormatOptions) => {
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
    };

    return new Date(dateString).toLocaleDateString("en-US", {
      ...defaultOptions,
      ...options,
    });
  },

  /**
   * Format date for charts (short format)
   */
  formatChartDate: (
    dateString: string,
    groupBy: "day" | "week" | "month" = "day"
  ) => {
    const date = new Date(dateString);

    switch (groupBy) {
      case "day":
        return date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
      case "week":
        return `Week ${getWeekNumber(date)}`;
      case "month":
        return date.toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        });
      default:
        return date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
    }
  },

  /**
   * Get date ranges for quick filters
   */
  getDateRanges: () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    const lastMonth = new Date(today);
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const last3Months = new Date(today);
    last3Months.setMonth(last3Months.getMonth() - 3);

    const lastYear = new Date(today);
    lastYear.setFullYear(lastYear.getFullYear() - 1);

    return {
      today: {
        label: "Today",
        startDate: today.toISOString().split("T")[0],
        endDate: today.toISOString().split("T")[0],
      },
      yesterday: {
        label: "Yesterday",
        startDate: yesterday.toISOString().split("T")[0],
        endDate: yesterday.toISOString().split("T")[0],
      },
      lastWeek: {
        label: "Last 7 Days",
        startDate: lastWeek.toISOString().split("T")[0],
        endDate: today.toISOString().split("T")[0],
      },
      lastMonth: {
        label: "Last 30 Days",
        startDate: lastMonth.toISOString().split("T")[0],
        endDate: today.toISOString().split("T")[0],
      },
      last3Months: {
        label: "Last 3 Months",
        startDate: last3Months.toISOString().split("T")[0],
        endDate: today.toISOString().split("T")[0],
      },
      lastYear: {
        label: "Last Year",
        startDate: lastYear.toISOString().split("T")[0],
        endDate: today.toISOString().split("T")[0],
      },
    };
  },

  /**
   * Validate date range
   */
  validateDateRange: (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return { valid: false, error: "Invalid date format" };
    }

    if (start >= end) {
      return { valid: false, error: "Start date must be before end date" };
    }

    const maxRange = 365; // days
    const diffInDays = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffInDays > maxRange) {
      return {
        valid: false,
        error: `Date range cannot exceed ${maxRange} days`,
      };
    }

    return { valid: true, error: null };
  },
};

// Currency Utility Functions
export const currencyUtils = {
  /**
   * Format currency value
   */
  formatCurrency: (value: number, currency: string = "PKR") => {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  },

  /**
   * Format currency for charts (abbreviated)
   */
  formatCurrencyCompact: (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  },

  /**
   * Calculate percentage change
   */
  calculatePercentageChange: (current: number, previous: number) => {
    if (previous === 0) return current === 0 ? 0 : 100;
    return ((current - previous) / Math.abs(previous)) * 100;
  },

  /**
   * Format percentage
   */
  formatPercentage: (value: number, decimals: number = 1) => {
    return `${value.toFixed(decimals)}%`;
  },
};

// Chart Utility Functions
export const chartUtils = {
  /**
   * Generate chart colors
   */
  getChartColors: () => ({
    primary: "#1a6fcc",
    secondary: "#835ec7",
    accent: "#e85aad",
    danger: "#fb2c36",
    warning: "#d08700",
    success: "#00bc7d",
    info: "#1a6fcc",
    gradients: {
      primary: "linear-gradient(135deg, #0d3866 0%, #4da2ff 100%)",
      secondary: "linear-gradient(135deg, #422f64 0%, #b691fa 100%)",
    },
  }),

  /**
   * Generate random colors for charts
   */
  generateColors: (count: number) => {
    const colors = [
      "#1a6fcc",
      "#835ec7",
      "#e85aad",
      "#fb2c36",
      "#145399",
      "#422f64",
      "#009966",
      "#f0b100",
      "#ba488a",
      "#00bc7d",
    ];

    // Shuffle the colors array to add randomness
    const shuffled = [...colors];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // If count > colors.length, repeat the shuffled array as needed
    const result: string[] = [];
    while (result.length < count) {
      result.push(...shuffled);
    }
    return result.slice(0, count);
  },

  /**
   * Format tooltip content
   */
  formatTooltip: (value: number, name: string) => {
    if (
      name.toLowerCase().includes("revenue") ||
      name.toLowerCase().includes("amount")
    ) {
      return [currencyUtils.formatCurrency(value), name];
    }
    return [value, name];
  },
};

// Helper Functions
function getWeekNumber(date: Date): number {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

/**
 * Get the start of week (Sunday) for a given date
 */
const getWeekStart = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const diff = d.getDate() - day; // Calculate how many days to subtract to get to Sunday
  const result = new Date(d.setDate(diff));
  console.log(
    "getWeekStart - Input:",
    date,
    "Day of week:",
    day,
    "Diff:",
    diff,
    "Result:",
    result
  );
  return result;
};

/**
 * Get the start of month for a given date
 */
const getMonthStart = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

/**
 * Format date to YYYY-MM-DD string
 */
const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Generate all periods within a date range
 */
const generatePeriods = (
  start: Date,
  end: Date,
  groupBy: "day" | "week" | "month"
): Array<{ date: string; key: string }> => {
  const periods: Array<{ date: string; key: string }> = [];
  let current: Date;

  switch (groupBy) {
    case "day":
      current = new Date(start);
      while (current <= end) {
        const dateStr = formatDate(current);
        periods.push({ date: dateStr, key: dateStr });
        current.setDate(current.getDate() + 1);
      }
      break;

    case "week":
      // Start from the Sunday of the week containing the start date
      current = getWeekStart(start);
      console.log("generatePeriods - Week start:", current);

      // Continue until we've covered all weeks that intersect with our date range
      while (current <= end) {
        const dateStr = formatDate(current);
        console.log(
          "generatePeriods - Adding period:",
          dateStr,
          "Current date:",
          current
        );
        periods.push({ date: dateStr, key: dateStr });
        current = new Date(current); // Create new date object
        current.setDate(current.getDate() + 7);
        console.log("generatePeriods - Next current:", current);
      }
      break;

    case "month":
      current = getMonthStart(start);

      // Continue until we've covered all months that intersect with our date range
      while (current <= end) {
        const dateStr = formatDate(current);
        periods.push({ date: dateStr, key: dateStr });
        current = new Date(current); // Create new date object
        current.setMonth(current.getMonth() + 1);
      }
      break;
  }

  return periods;
};

/**
 * Determine which period a given date belongs to
 */
const getDatePeriod = (
  date: Date,
  groupBy: "day" | "week" | "month"
): string => {
  switch (groupBy) {
    case "day":
      return formatDate(date);
    case "week":
      return formatDate(getWeekStart(date));
    case "month":
      return formatDate(getMonthStart(date));
    default:
      return formatDate(date);
  }
};

export const chartDataUtils = {
  /**
   * Fill missing periods in chart data with zero values
   * @param data - Original data from API
   * @param startDate - Start date of the period (YYYY-MM-DD format)
   * @param endDate - End date of the period (YYYY-MM-DD format)
   * @param groupBy - Period grouping: 'day', 'week', or 'month'
   * @returns Formatted data with all periods filled
   */
  fillMissingPeriods: (
    data: Array<{
      date: string;
      revenue: number;
      transactions: number;
    }>,
    startDate: string,
    endDate: string,
    groupBy: "day" | "week" | "month" = "day"
  ) => {
    // Parse dates - handle DD-MM-YYYY format
    const parseDate = (dateStr: string): Date => {
      if (dateStr.includes("-") && dateStr.split("-")[0].length === 2) {
        // DD-MM-YYYY format
        const [day, month, year] = dateStr.split("-");
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      } else {
        // YYYY-MM-DD format or ISO string
        return new Date(dateStr);
      }
    };

    const start = parseDate(startDate);
    const end = parseDate(endDate);

    console.log("Debug - Start date:", start, "End date:", end);
    console.log("Debug - Group by:", groupBy);

    // Generate all periods in the date range
    const allPeriods = generatePeriods(start, end, groupBy);
    console.log("Debug - Generated periods:", allPeriods);

    // Create a map of existing data for quick lookup
    const dataMap = new Map<
      string,
      { revenue: number; transactions: number }
    >();

    data.forEach((item) => {
      const itemDate = new Date(item.date);
      const periodKey = getDatePeriod(itemDate, groupBy);

      console.log(
        "Debug - Item date:",
        item.date,
        "Parsed as:",
        itemDate,
        "Period key:",
        periodKey
      );

      // If multiple records exist for the same period, sum them up
      if (dataMap.has(periodKey)) {
        const existing = dataMap.get(periodKey)!;
        dataMap.set(periodKey, {
          revenue: existing.revenue + item.revenue,
          transactions: existing.transactions + item.transactions,
        });
      } else {
        dataMap.set(periodKey, {
          revenue: item.revenue,
          transactions: item.transactions,
        });
      }
    });

    console.log("Debug - Data map:", dataMap);

    // Fill in missing periods with zero values
    const result = allPeriods.map((period) => ({
      date: period.date,
      revenue: dataMap.get(period.key)?.revenue || 0,
      transactions: dataMap.get(period.key)?.transactions || 0,
    }));

    console.log("Debug - Final result:", result);
    return result;
  },

  /**
   * Fill missing periods for transaction volume trend data
   * @param data - Transaction volume trend data from API
   * @param startDate - Start date of the period (YYYY-MM-DD format)
   * @param endDate - End date of the period (YYYY-MM-DD format)
   * @param groupBy - Period grouping: 'day', 'week', or 'month'
   * @returns Formatted data with all periods filled
   */
  fillMissingPeriodsForTransactionVolume: (
    data: Array<{
      date: string;
      transactionCount: number;
      uniqueEvents: number;
    }>,
    startDate: string,
    endDate: string,
    groupBy: "day" | "week" | "month" = "day"
  ) => {
    // Parse dates - handle DD-MM-YYYY format
    const parseDate = (dateStr: string): Date => {
      if (dateStr.includes("-") && dateStr.split("-")[0].length === 2) {
        // DD-MM-YYYY format
        const [day, month, year] = dateStr.split("-");
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      } else {
        // YYYY-MM-DD format or ISO string
        return new Date(dateStr);
      }
    };

    const start = parseDate(startDate);
    const end = parseDate(endDate);

    // Generate all periods in the date range
    const allPeriods = generatePeriods(start, end, groupBy);

    // Create a map of existing data for quick lookup
    const dataMap = new Map<
      string,
      { transactionCount: number; uniqueEvents: number }
    >();

    data.forEach((item) => {
      const itemDate = new Date(item.date);
      const periodKey = getDatePeriod(itemDate, groupBy);

      // If multiple records exist for the same period, sum them up
      if (dataMap.has(periodKey)) {
        const existing = dataMap.get(periodKey)!;
        dataMap.set(periodKey, {
          transactionCount: existing.transactionCount + item.transactionCount,
          uniqueEvents: existing.uniqueEvents + item.uniqueEvents,
        });
      } else {
        dataMap.set(periodKey, {
          transactionCount: item.transactionCount,
          uniqueEvents: item.uniqueEvents,
        });
      }
    });

    // Fill in missing periods with zero values
    return allPeriods.map((period) => ({
      date: period.date,
      transactionCount: dataMap.get(period.key)?.transactionCount || 0,
      uniqueEvents: dataMap.get(period.key)?.uniqueEvents || 0,
    }));
  },
};

// Alternative approach for week grouping that uses week numbers
export const chartDataUtilsWeekNumber = {
  /**
   * Fill missing periods using week numbers instead of Monday dates
   */
  fillMissingPeriodsWithWeekNumbers: (
    data: Array<{
      date: string;
      revenue: number;
      transactions: number;
    }>,
    startDate: string,
    endDate: string,
    groupBy: "day" | "week" | "month" = "day"
  ) => {
    if (groupBy !== "week") {
      return chartDataUtils.fillMissingPeriods(
        data,
        startDate,
        endDate,
        groupBy
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Generate all weeks in the date range
    const allWeeks = generateWeekPeriods(start, end);

    // Create a map of existing data for quick lookup
    const dataMap = new Map<
      string,
      { revenue: number; transactions: number }
    >();

    data.forEach((item) => {
      const weekKey = getWeekKey(new Date(item.date));
      if (dataMap.has(weekKey)) {
        const existing = dataMap.get(weekKey)!;
        dataMap.set(weekKey, {
          revenue: existing.revenue + item.revenue,
          transactions: existing.transactions + item.transactions,
        });
      } else {
        dataMap.set(weekKey, {
          revenue: item.revenue,
          transactions: item.transactions,
        });
      }
    });

    // Fill in missing weeks with zero values
    return allWeeks.map((week) => ({
      date: week.date,
      revenue: dataMap.get(week.key)?.revenue || 0,
      transactions: dataMap.get(week.key)?.transactions || 0,
    }));
  },
};

/**
 * Generate all weeks between start and end dates
 */
function generateWeekPeriods(
  startDate: Date,
  endDate: Date
): Array<{ date: string; key: string }> {
  const weeks: Array<{ date: string; key: string }> = [];
  const current = new Date(startDate);

  // Move to the beginning of the week (Monday)
  current.setDate(current.getDate() - current.getDay() + 1);

  while (current <= endDate) {
    const weekKey = getWeekKey(current);
    const dateString = current.toISOString().split("T")[0];

    weeks.push({
      date: dateString,
      key: weekKey,
    });

    // Move to next week
    current.setDate(current.getDate() + 7);
  }

  return weeks;
}

/**
 * Get week key in format YYYY-WW
 */
function getWeekKey(date: Date): string {
  const year = date.getFullYear();
  const weekNumber = getWeekNumber(date);
  return `${year}-${String(weekNumber).padStart(2, "0")}`;
}
