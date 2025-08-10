import { Stack, useRouter } from "expo-router";
import { ArrowLeft, Menu } from "lucide-react-native";
import { Text, TouchableOpacity, View } from "react-native";

const ProfileHeader = () => {
  const router = useRouter();

  return (
    <View className="flex-row items-center p-4 bg-white border-b border-neutral-300">
      <Text className="text-2xl font-heading font-bold flex-1">My Profile</Text>
      <TouchableOpacity
        onPress={() => router.push("/(advisor-tabs)/profile/settings")}
        className="mr-2"
        activeOpacity={0.7}
      >
        <Menu size={24} color="#333" />
      </TouchableOpacity>
    </View>
  );
};

const SettingsHeader = () => {
  const router = useRouter();

  return (
    <View className="flex-row items-center p-4 bg-white border-b border-neutral-300">
      <TouchableOpacity
        onPress={() => router.back()}
        className="mr-3 p-2 -ml-2"
        activeOpacity={0.7}
      >
        <ArrowLeft size={24} color="#333" />
      </TouchableOpacity>
      <Text className="text-2xl font-heading font-bold flex-1">Settings</Text>
    </View>
  );
};

const EditProfileHeader = () => {
  const router = useRouter();

  return (
    <View className="flex-row items-center p-4 bg-white border-b border-neutral-300">
      <TouchableOpacity
        onPress={() => router.back()}
        className="mr-3 p-2 -ml-2"
        activeOpacity={0.7}
      >
        <ArrowLeft size={24} color="#333" />
      </TouchableOpacity>
      <Text className="text-2xl font-heading font-bold flex-1">
        Edit Profile
      </Text>
    </View>
  );
};

export default function ProfileLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ header: ProfileHeader }} />
      <Stack.Screen
        name="settings"
        options={{ header: SettingsHeader, animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="edit-profile"
        options={{ header: EditProfileHeader, animation: "slide_from_right" }}
      />
    </Stack>
  );
}
