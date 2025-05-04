import { Button, ButtonText } from "@/components/ui/button";
import { useLogoutMutation } from "@/store/auth/api";
import { useAppSelector } from "@/store/hooks";
import { View, Text } from "react-native";

const HomePage = () => {
  const { user } = useAppSelector((state) => state.auth);

  const [logout, { isLoading }] = useLogoutMutation();

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
      <Button onPress={() => logout()} isDisabled={isLoading}>
        <ButtonText>Logout</ButtonText>
      </Button>
    </View>
  );
};

export default HomePage;
