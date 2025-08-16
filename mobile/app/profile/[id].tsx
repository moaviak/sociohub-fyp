import Profile from "@/features/users";
import { useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Header } from "../_layout";

const ProfileScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white">
      <Header title="User Profile" backButton />
      <Profile userId={id} />
    </SafeAreaView>
  );
};

export default ProfileScreen;
