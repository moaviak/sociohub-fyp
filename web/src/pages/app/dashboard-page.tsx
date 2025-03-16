import { useAppSelector } from "@/app/hooks";
import { AvatarGroup } from "@/components/avatar-group";
import { Navigate } from "react-router";

const DashboardPage = () => {
  const { user, userType } = useAppSelector((state) => state.auth);

  if (!user || !userType) {
    return <Navigate to="/" />;
  }

  return (
    <div>
      <AvatarGroup user={user} userType={userType} />
    </div>
  );
};
export default DashboardPage;
