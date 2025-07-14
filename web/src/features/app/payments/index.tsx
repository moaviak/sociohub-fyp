import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useGetOnboardingStatusQuery } from "./api";
import { FinanceKPIs } from "./components/finance-kpis";
import { RevenueAnalysis } from "./components/revenue-analysis";
import { AlertCircleIcon } from "lucide-react";
import { RecentTransactions } from "./components/recent-transactions";

export const Payments: React.FC<{ societyId: string }> = ({ societyId }) => {
  const { data, isLoading } = useGetOnboardingStatusQuery(societyId);
  const onboardingStatus = data && !("error" in data) ? data : undefined;
  const isOnboarded = onboardingStatus?.isOnboarded;

  if (!isLoading && !isOnboarded) {
    return (
      <Alert variant="destructive">
        <AlertCircleIcon />
        <AlertTitle>Payment Setup Required</AlertTitle>
        <AlertDescription>
          To view your payment data, you need to complete the payment setup
          process.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6 w-full py-4">
      <FinanceKPIs societyId={societyId} />
      <RevenueAnalysis societyId={societyId} />
      <RecentTransactions societyId={societyId} />
    </div>
  );
};
