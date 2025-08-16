import { useAppSelector } from "@/store/hooks";
import { View, Text } from "react-native";

const HomePage = () => {
  const { user } = useAppSelector((state) => state.auth);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontFamily: "Poppins-Bold", fontSize: 24 }}>
        Home Page
      </Text>
      {user && (
        <Text style={{ fontFamily: "Poppins-Regular", marginTop: 10 }}>
          Welcome, {user.firstName || "User"}!
        </Text>
      )}
    </View>
  );
};

export default HomePage;
