import { useAppSelector } from "@/store/hooks";
import { UserType } from "@/types";
import { Redirect } from "expo-router";

const HomePage = () => {
  const { userType } = useAppSelector((state) => state.auth);

  return userType === UserType.STUDENT ? (
    <Redirect href="/(student-tabs)/home" />
  ) : (
    <Redirect href="/(advisor-tabs)/home" />
  );
};

export default HomePage;
