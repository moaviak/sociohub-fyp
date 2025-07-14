import { DataTable } from "@/components/ui/data-table";
import { useGetTransactionsQuery } from "../api";
import { transactionsColumns } from "../columns";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router";

export const RecentTransactions: React.FC<{ societyId: string }> = ({
  societyId,
}) => {
  const { data, isLoading } = useGetTransactionsQuery({ societyId });
  const location = useLocation();

  return (
    <div className="space-y-4">
      <div className="w-full flex items-center justify-between">
        <h6 className="h5-bold">Recent Transactions</h6>
        <Button variant="link" asChild>
          <Link to={`${location.pathname}/transactions`}>View more</Link>
        </Button>
      </div>
      <div>
        <DataTable
          isLoading={isLoading}
          columns={transactionsColumns}
          data={data?.transactions || []}
        />
      </div>
    </div>
  );
};
