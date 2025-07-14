import React, { useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  useGetRevenueTrendQuery,
  useGetTopEarningEventsQuery,
  useGetTransactionVolumeTrendQuery,
} from "../api";
import { SpinnerLoader } from "@/components/spinner-loader";
import { cn, formatDate } from "@/lib/utils";
import { chartDataUtils, currencyUtils } from "@/lib/finance-analysis-utils";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Clock3Icon } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";

export const RevenueAnalysis: React.FC<{ societyId: string }> = ({
  societyId,
}) => {
  // Date range state
  const [dateRange, setDateRange] = React.useState<{ from: Date; to: Date }>(
    () => {
      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - 30);
      return { from: start, to: end };
    }
  );
  // Group by state
  const [groupBy, setGroupBy] = React.useState<"day" | "week" | "month">(
    "week"
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h6 className="h5-bold">Revenue Analysis</h6>
        <FilterOptions
          dateRange={dateRange}
          setDateRange={setDateRange}
          groupBy={groupBy}
          setGroupBy={setGroupBy}
        />
      </div>
      <div className="grid grid-cols-6 grid-rows-6 gap-4">
        <div className="col-span-3 row-span-3">
          <RevenueTrend
            societyId={societyId}
            startDate={dateRange.from.toISOString()}
            endDate={dateRange.to.toISOString()}
            groupBy={groupBy}
          />
        </div>
        <div className="col-span-3 row-span-3 col-start-1 row-start-4">
          <TransactionVolumeTrend
            societyId={societyId}
            startDate={dateRange.from.toISOString()}
            endDate={dateRange.to.toISOString()}
            groupBy={groupBy}
          />
        </div>
        <div className="col-span-3 row-span-4 col-start-4 row-start-2">
          <TopEarningEvents
            societyId={societyId}
            startDate={dateRange.from.toISOString()}
            endDate={dateRange.to.toISOString()}
            groupBy={groupBy}
          />
        </div>
      </div>
    </div>
  );
};

const RevenueTrend: React.FC<{
  societyId: string;
  startDate: string;
  endDate: string;
  groupBy: "day" | "week" | "month";
}> = ({ societyId, startDate, endDate, groupBy }) => {
  const { data: rawData, isLoading } = useGetRevenueTrendQuery({
    societyId,
    startDate,
    endDate,
    groupBy,
  });

  const data = useMemo(() => {
    if (!rawData) return [];
    return chartDataUtils.fillMissingPeriods(
      rawData,
      startDate,
      endDate,
      groupBy
    );
  }, [rawData, startDate, endDate, groupBy]);

  const chartConfig = {
    revenue: {
      label: "Revenue",
      color: "oklch(0.646 0.222 41.116)",
    },
  } satisfies ChartConfig;

  return (
    <div className="aspect-[3/2] bg-card drop-shadow-sm rounded-lg border p-6 space-y-4">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Revenue over time</h3>
        <p className="text-sm text-muted-foreground">
          Revenue trends of past data
        </p>
      </div>
      {isLoading ? (
        <div className="w-full h-full flex items-center justify-center">
          <SpinnerLoader size="sm" />
        </div>
      ) : (
        <ChartContainer config={chartConfig} className="h-full w-full">
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={(value) => format(value, "dd-MM-yyyy")}
              tickLine={false}
              axisLine={false}
              className="text-xs"
            />
            <YAxis
              tickFormatter={(value) => currencyUtils.formatCurrency(value)}
              tickLine={false}
              axisLine={false}
              className="text-xs"
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent accessibilityLayer hideLabel />}
              formatter={(value, name) => [
                currencyUtils.formatCurrency(value as number),
                chartConfig[name as keyof typeof chartConfig]?.label || name,
              ]}
              labelFormatter={(label) => `Date: ${format(label, "dd-MM-yyyy")}`}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="var(--color-revenue)"
              strokeWidth={2}
              fillOpacity={0.2}
              fill="var(--color-revenue)"
            />
          </AreaChart>
        </ChartContainer>
      )}
    </div>
  );
};

const TransactionVolumeTrend: React.FC<{
  societyId: string;
  startDate: string;
  endDate: string;
  groupBy: "day" | "week" | "month";
}> = ({ societyId, startDate, endDate, groupBy }) => {
  const { data: rawData, isLoading } = useGetTransactionVolumeTrendQuery({
    societyId,
    startDate,
    endDate,
    groupBy,
  });

  // Process data with utility function
  const data = useMemo(() => {
    if (!rawData) return [];
    return chartDataUtils.fillMissingPeriodsForTransactionVolume(
      rawData,
      startDate,
      endDate,
      groupBy
    );
  }, [rawData, startDate, endDate, groupBy]);

  const chartConfig = {
    transactionCount: {
      label: "Transactions",
      color: "oklch(0.6 0.118 184.704)",
    },
    uniqueEvents: {
      label: "Unique Events",
      color: "oklch(0.398 0.07 227.392)",
    },
  } satisfies ChartConfig;

  return (
    <div className="aspect-[3/2] bg-card drop-shadow-sm rounded-lg border p-6 space-y-4">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Transaction Volume</h3>
        <p className="text-sm text-muted-foreground">
          Successful transactions and unique events over time
        </p>
      </div>
      {isLoading ? (
        <div className="w-full h-full flex items-center justify-center">
          <SpinnerLoader size="sm" />
        </div>
      ) : (
        <ChartContainer config={chartConfig} className="h-full w-full">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={(value) => format(value, "dd-MM-yyyy")}
              tickLine={false}
              axisLine={false}
              className="text-xs"
            />
            <YAxis tickLine={false} axisLine={false} className="text-xs" />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent accessibilityLayer />}
              formatter={(value, name) => [
                value,
                chartConfig[name as keyof typeof chartConfig]?.label || name,
              ]}
              labelFormatter={(label) => `Date: ${format(label, "dd-MM-yyyy")}`}
            />
            <Line
              type="monotone"
              dataKey="transactionCount"
              stroke="var(--color-transactionCount)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="uniqueEvents"
              stroke="var(--color-uniqueEvents)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ChartContainer>
      )}
    </div>
  );
};

const TopEarningEvents: React.FC<{
  societyId: string;
  startDate: string;
  endDate: string;
  groupBy: "day" | "week" | "month";
}> = ({ societyId, startDate, endDate, groupBy }) => {
  const { data: rawData, isLoading } = useGetTopEarningEventsQuery({
    societyId,
    startDate,
    endDate,
    groupBy,
  });

  const sortedData = useMemo(() => {
    if (!rawData) return [];
    return [...rawData]
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 5); // Changed to 5 to match the title
  }, [rawData]);

  if (isLoading) {
    return (
      <div className="w-full aspect-square flex items-center justify-center">
        <SpinnerLoader size="sm" />
      </div>
    );
  }

  const chartConfig = {
    totalRevenue: {
      label: "Total Revenue",
      color: "oklch(0.488 0.243 264.376)",
    },
  } satisfies ChartConfig;

  return (
    <div className="aspect-square bg-card drop-shadow-sm rounded-lg border p-6 space-y-4">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Top 5 Earning Events</h3>
        <p className="text-sm text-muted-foreground">
          Highest revenue generating events
        </p>
      </div>
      {isLoading ? (
        <div className="w-full h-full flex items-center justify-center">
          <SpinnerLoader size="sm" />
        </div>
      ) : (
        <ChartContainer config={chartConfig} className="h-full w-full">
          <BarChart
            data={sortedData}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="title"
              angle={-45}
              textAnchor="end"
              interval={0}
              className="text-xs"
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tickFormatter={(value) => currencyUtils.formatCurrency(value)}
              className="text-xs"
              tickLine={false}
              axisLine={false}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent accessibilityLayer hideLabel />}
              formatter={(value, name) => [
                currencyUtils.formatCurrency(value as number),
                chartConfig[name as keyof typeof chartConfig]?.label || name,
              ]}
            />
            <Bar
              dataKey="totalRevenue"
              fill="var(--color-totalRevenue)"
              radius={[4, 4, 0, 0]}
              maxBarSize={80}
            />
          </BarChart>
        </ChartContainer>
      )}
    </div>
  );
};

// Update FilterOptions to accept and set groupBy
const FilterOptions: React.FC<{
  dateRange: { from: Date; to: Date };
  setDateRange: (range: { from: Date; to: Date }) => void;
  groupBy: "day" | "week" | "month";
  setGroupBy: (value: "day" | "week" | "month") => void;
}> = ({ dateRange, setDateRange, groupBy, setGroupBy }) => {
  return (
    <div className="flex items-center gap-4">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn("pl-3 text-left font-normal")}
          >
            <span>
              {dateRange.from && dateRange.to
                ? `${formatDate(dateRange.from.toISOString())} - ${formatDate(
                    dateRange.to.toISOString()
                  )}`
                : "Select date range"}
            </span>
            <CalendarIcon className="ml-auto h-4 w-4 opacity-70" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 flex gap-2" align="end">
          <Calendar
            mode="single"
            defaultMonth={dateRange.from}
            captionLayout="dropdown"
            selected={dateRange.from}
            onSelect={(date) => {
              if (date) {
                setDateRange({ ...dateRange, from: date });
              }
            }}
            className="rounded-lg border shadow-sm"
          />
          <Calendar
            mode="single"
            defaultMonth={dateRange.to}
            captionLayout="dropdown"
            selected={dateRange.to}
            onSelect={(date) => {
              if (date) {
                setDateRange({ ...dateRange, to: date });
              }
            }}
            className="rounded-lg border shadow-sm"
          />
        </PopoverContent>
      </Popover>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn("pl-3 text-left font-normal")}
          >
            <span>Group By</span>
            <Clock3Icon className="ml-auto h-4 w-4 opacity-70" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto drop-shadow-xl flex gap-2 "
          align="end"
        >
          <RadioGroup value={groupBy} onValueChange={setGroupBy}>
            <div className="flex items-center gap-3">
              <RadioGroupItem value="day" id="r1" />
              <Label htmlFor="r1">Day</Label>
            </div>
            <div className="flex items-center gap-3">
              <RadioGroupItem value="week" id="r2" />
              <Label htmlFor="r2">Week</Label>
            </div>
            <div className="flex items-center gap-3">
              <RadioGroupItem value="month" id="r3" />
              <Label htmlFor="r3">Month</Label>
            </div>
          </RadioGroup>
        </PopoverContent>
      </Popover>
    </div>
  );
};
