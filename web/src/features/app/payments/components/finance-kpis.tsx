import {
  ChartLine,
  CircleDollarSign,
  Info,
  TicketCheck,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useGetPaymentDashboardKPIsQuery } from "../api";
import { useMemo } from "react";
import { KPICardSkeleton } from "@/components/skeleton/kpi-card-skeleton";

export const FinanceKPIs: React.FC<{ societyId: string }> = ({ societyId }) => {
  const { startDate, endDate } = useMemo(() => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 30);
    return {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    };
  }, []);

  const { data, isLoading } = useGetPaymentDashboardKPIsQuery({
    societyId,
    startDate,
    endDate,
  });

  if (isLoading) {
    return <FinanceKPIsSkeleton />;
  }

  return (
    <div className="grid grid-cols-4 gap-4 py-4">
      <div className="flex flex-col justify-between gap-y-6 p-4 bg-white rounded-lg drop-shadow-e1">
        <div className="flex-1 flex items-center justify-between">
          <div className="h-full space-y-3">
            <div className="b3-regular text-neutral-600">Pending Payout</div>
            <div className="h5-semibold">
              RS {data ? data.currentAccountBalance : 0}
            </div>
          </div>
          <Wallet className="size-12 text-primary-600 p-2 rounded-full bg-primary-200/65" />
        </div>
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-neutral-800" />
          <p className="b3-regular text-neutral-800">
            {data && data.currentAccountBalance === 0
              ? "All payouts cleared."
              : "Payout to your bank account pending."}
          </p>
        </div>
      </div>

      <div className="flex flex-col justify-between gap-y-6 p-4 bg-white rounded-lg drop-shadow-e1">
        <div className="flex-1 flex items-center justify-between">
          <div className="h-full space-y-3">
            <div className="b3-regular text-neutral-600">Total Revenue</div>
            <div>
              <p className="h5-semibold">
                RS {data ? data.totalRevenue.period : 0}
              </p>
              <p className="b3-regular text-neutral-600">
                All Time: RS {data ? data.totalRevenue.allTime : 0}
              </p>
            </div>
          </div>
          <CircleDollarSign className="size-12 text-secondary-600 p-2 rounded-full bg-secondary-200/70" />
        </div>
        <Trend change={data ? data.totalRevenue.change : 0} />
      </div>

      <div className="flex flex-col justify-between gap-y-6 p-4 bg-white rounded-lg drop-shadow-e1">
        <div className="flex-1 flex items-center justify-between">
          <div className="h-full space-y-3">
            <div className="b3-regular text-neutral-600">
              Paid Registrations
            </div>
            <div>
              <p className="h5-semibold">
                {data ? data.totalPaidRegistrations.period : 0}
              </p>
              <p className="b3-regular text-neutral-600">
                All Time: {data ? data.totalPaidRegistrations.allTime : 0}
              </p>
            </div>
          </div>
          <TicketCheck className="size-12 text-yellow-500 p-2 rounded-full bg-yellow-200/65" />
        </div>
        <Trend change={data ? data.totalPaidRegistrations.change : 0} />
      </div>

      <div className="flex flex-col justify-between gap-y-6 p-4 bg-white rounded-lg drop-shadow-e1">
        <div className="flex-1 flex items-center justify-between">
          <div className="h-full space-y-3">
            <div className="b3-regular text-neutral-600">
              Projected Revenues
            </div>
            <div>
              <p className="h5-semibold">
                {data ? data.upcomingProjectedRevenue : 0}
              </p>
            </div>
          </div>
          <ChartLine className="size-12 text-accent-500 p-2 rounded-full bg-accent-200/65" />
        </div>
        <p className="b3-regular text-neutral-800 flex items-center gap-2">
          <Info className="h-4 w-4 text-neutral-800" />
          Events estimated revenues
        </p>
      </div>
    </div>
  );
};

const Trend: React.FC<{ change: number }> = ({ change }) => {
  if (change < 0) {
    return (
      <div className="b3-regular text-neutral-800 flex items-center gap-1">
        <TrendingUp className="h-4 w-4 text-red-600" />
        <span className="text-red-600">{change}%</span>
        Down from last month
      </div>
    );
  } else {
    return (
      <div className="b3-regular text-neutral-800 flex items-center gap-1">
        <TrendingUp className="h-4 w-4 text-emerald-600" />
        <span className="text-emerald-600">{change}%</span>
        Up from last month
      </div>
    );
  }
};

const FinanceKPIsSkeleton = () => {
  return (
    <div className="grid grid-cols-4 gap-4 py-4">
      <KPICardSkeleton />
      <KPICardSkeleton />
      <KPICardSkeleton />
      <KPICardSkeleton />
    </div>
  );
};
