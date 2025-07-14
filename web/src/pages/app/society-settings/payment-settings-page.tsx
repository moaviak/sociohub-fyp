import { PaymentOnboarding } from "@/features/app/payments/payment-onboarding";
import useGetSocietyId from "@/hooks/useGetSocietyId";
import { Navigate, Outlet, useLocation } from "react-router";

const PaymentSettingsPage = () => {
  const societyId = useGetSocietyId();
  const location = useLocation();

  if (!societyId) {
    return <Navigate to={"/dashboard"} />;
  }

  if (
    location.pathname !== "/settings/payments" &&
    location.pathname !== `/settings/${societyId}/payments`
  ) {
    return <Outlet />;
  }

  return (
    <div className="h-full w-full p-4">
      <PaymentOnboarding societyId={societyId} />
    </div>
  );
};
export default PaymentSettingsPage;
