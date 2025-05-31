import { useAppSelector } from "@/app/hooks";
import { AdvisorDashboard } from "@/features/app/dashboard/advisor-dashboard";
import { StudentDashboard } from "@/features/app/dashboard/student-dashboard";
import { UserType } from "@/types";

const DashboardPage = () => {
  const { userType } = useAppSelector((state) => state.auth);

  if (!userType) {
    return null;
  }

  return (
    <div className="flex flex-col px-4 py-2">
      <div>
        <h3 className="h3-semibold">{`${userType
          .charAt(0)
          .toUpperCase()}${userType.substring(1)} Dashboard`}</h3>
        <p className="b3-regular">
          Your personalized hub for society activities and announcements.
        </p>
      </div>
      <div className="flex-1 flex">
        {userType === UserType.STUDENT ? (
          <StudentDashboard />
        ) : (
          <AdvisorDashboard />
        )}
      </div>
    </div>
  );
};
export default DashboardPage;
