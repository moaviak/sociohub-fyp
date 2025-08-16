import { Icon } from "@/components/ui/icon";
import { VStack } from "@/components/ui/vstack";
import { getDeviceId } from "@/features/notifications/push-notifications";
import { useToastUtility } from "@/hooks/useToastUtility";
import { useLogoutMutation } from "@/store/auth/api";
import { useRouter } from "expo-router";
import { ChevronRight, LogOut, UserPen } from "lucide-react-native";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";

const Settings = () => {
  const router = useRouter();
  const { showErrorToast } = useToastUtility();
  const [logout, { isLoading }] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      const deviceId = await getDeviceId();

      await logout({ deviceId: deviceId ?? undefined }).unwrap();
    } catch (error) {
      showErrorToast("Error logging out. Please try again");
    }
  };

  return (
    <View className="bg-white flex-1 justify-between py-2">
      <VStack>
        <TouchableOpacity
          className="flex-row items-center gap-4 py-4 px-6  border-b border-neutral-300"
          activeOpacity={0.7}
          onPress={() => router.push("/(student-tabs)/profile/edit-profile")}
        >
          <UserPen size={24} color="#333" />
          <Text className="font-body text-lg font-medium flex-1">
            Edit Profile
          </Text>
          <Icon as={ChevronRight} color="#333" size="lg" />
        </TouchableOpacity>
      </VStack>
      <TouchableOpacity
        className="flex-row items-center gap-4 py-4 px-6"
        activeOpacity={0.7}
        onPress={handleLogout}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={"#ff0000"} />
        ) : (
          <Icon as={LogOut} className="text-error-500" size="xl" />
        )}
        <Text className="font-body text-lg text-error-500">Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Settings;
