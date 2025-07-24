import { Payments } from "@/features/app/payments";
import useGetSocietyId from "@/hooks/useGetSocietyId";
import { Navigate, Outlet, useLocation } from "react-router";

const PaymentsPage = () => {
  const societyId = useGetSocietyId();
  const location = useLocation();

  if (!societyId) {
    return <Navigate to={"/dashboard"} />;
  }

  if (
    location.pathname !== "/payments" &&
    location.pathname !== `/payments/${societyId}`
  ) {
    return <Outlet />;
  }

  return (
    <div className="flex flex-col px-4 py-2">
      <div>
        <h3 className="h3-semibold">Payments & Finance</h3>
        <p className="b3-regular">
          Manage and track your society's financial transactions.
        </p>
      </div>
      <div className="flex-1 flex">
        <Payments societyId={societyId} />
      </div>
    </div>
  );
};
export default PaymentsPage;
