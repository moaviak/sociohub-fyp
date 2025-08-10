import Profile from "@/features/users";
import { useLocalSearchParams } from "expo-router";
import { View, Text, SafeAreaView } from "react-native";

const ProfileScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <SafeAreaView className="bg-white flex-1">
      <Profile userId={id} />
    </SafeAreaView>
  );
};

export default ProfileScreen;
