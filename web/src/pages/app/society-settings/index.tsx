import { useAppSelector } from "@/app/hooks";
import { havePaymentsPrivilege, haveSettingsPrivilege } from "@/lib/utils";
import { Advisor } from "@/types";
import { Navigate, useParams } from "react-router";

const SocietySettingsPage = () => {
  const { user } = useAppSelector((state) => state.auth);
  const { societyId } = useParams();

  const isStudent = user && "registrationNumber" in user;

  if (isStudent && !societyId) {
    return <Navigate to="/dashboard" />;
  }

  const accessSettings = isStudent
    ? haveSettingsPrivilege(user.societies || [], societyId || "")
    : !societyId || societyId === (user as Advisor).societyId;

  const accessPayments = isStudent
    ? havePaymentsPrivilege(user.societies || [], societyId || "")
    : true;

  return accessSettings ? (
    <Navigate to={"profile"} />
  ) : accessPayments ? (
    <Navigate to={"payments"} />
  ) : (
    <Navigate to={"/dashboard"} />
  );
};
export default SocietySettingsPage;
