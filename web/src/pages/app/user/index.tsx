import { UserProfile } from "@/features/app/users";
import { Navigate, useParams } from "react-router";

const UserProfilePage = () => {
  const { id } = useParams();

  if (!id) {
    return <Navigate to={"/dashboard"} />;
  }

  return (
    <div className="h-full">
      <UserProfile id={id} />
    </div>
  );
};
export default UserProfilePage;
