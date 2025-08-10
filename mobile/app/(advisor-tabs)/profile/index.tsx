import Profile from "@/features/users";
import { useAppSelector } from "@/store/hooks";
import { View, Text } from "react-native";

const ProfilePage = () => {
  const user = useAppSelector((state) => state.auth.user);

  if (!user) return null;

  return (
    <View className="bg-white flex-1">
      <Profile userId={user.id} />
    </View>
  );
};

export default ProfilePage;
