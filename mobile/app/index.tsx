import { useAppSelector } from "@/store/hooks";
import { UserType } from "@/types";
import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";

const HomePage = () => {
  const { userType, isAuthChecked, isTokenLoading } = useAppSelector(
    (state) => state.auth
  );

  // Show loading indicator while auth is being checked or tokens are being loaded
  if (!isAuthChecked || isTokenLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
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
