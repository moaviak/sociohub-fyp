import { Transactions } from "@/features/app/payments/transactions";
import useGetSocietyId from "@/hooks/useGetSocietyId";

const TransactionsPage = () => {
  const societyId = useGetSocietyId();

  return (
    <div className="flex flex-col px-4 py-2 ">
      <div>
        <h3 className="h3-semibold">Transactions</h3>
        <p className="b3-regular">
          Explore a detailed record of all financial transactions.
        </p>
      </div>
      <div className="flex-1 flex">
        <Transactions societyId={societyId!} />
      </div>
    </div>
  );
};
export default TransactionsPage;
