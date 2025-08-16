import { useAppSelector } from "@/store/hooks";
import { UserType } from "@/types";
import { Redirect } from "expo-router";

const HomePage = () => {
  const { userType, isAuthChecked, isTokenLoading } = useAppSelector(
    (state) => state.auth
  );

  // While auth is being checked, splash screen is still showing
  // So we just return null here instead of a loading indicator
  if (!isAuthChecked || isTokenLoading) {
    return null;
  }

  // If no userType is set, default to auth screen
  if (!userType) {
    return <Redirect href="/auth/sign-in" />;
  }

  // Only redirect to respective tabs when we have a valid userType
  return userType === UserType.STUDENT ? (
    <Redirect href="/(student-tabs)/home" />
  ) : (
    <Redirect href="/(advisor-tabs)/home" />
  );
};

export default HomePage;
