import { useAppSelector } from "@/store/hooks";
import { UserType } from "@/types";
import { Redirect } from "expo-router";
import { Text } from "react-native";

const HomePage = () => {
  const { userType } = useAppSelector((state) => state.auth);

  return userType === UserType.STUDENT ? (
    <Redirect href="/(student-tabs)/home" />
  ) : userType === UserType.ADVISOR ? (
    <Redirect href="/(advisor-tabs)/home" />
  ) : (
    <Text>Loading...</Text>
  );
};

export default HomePage;
