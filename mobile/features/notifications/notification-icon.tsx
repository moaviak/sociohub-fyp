import { Icon } from "@/components/ui/icon";
import { useAppSelector } from "@/store/hooks";
import { UserType } from "@/types";
import { useRouter } from "expo-router";
import { Bell } from "lucide-react-native";
import { View, Text, TouchableOpacity } from "react-native";

const formatCount = (count: number) => {
  if (count > 9) {
    return "9+";
  } else {
    return count;
  }
};

const NotificationIcon = () => {
  const { unreadCount } = useAppSelector((state) => state.notifications);
  const { userType } = useAppSelector((state) => state.auth);

  const router = useRouter();

  return (
    <TouchableOpacity
      className="relative mr-4"
      onPress={() =>
        router.push(
          userType === UserType.STUDENT
            ? "/(student-tabs)/home/notifications"
            : "/(advisor-tabs)/home/notifications"
        )
      }
    >
      <Icon as={Bell} size="xl" />
      {unreadCount > 0 && (
        <View
          className="bg-red-500 rounded-full justify-center items-center absolute"
          style={{
            width: 16,
            height: 16,
            top: -6,
            right: -4,
          }}
        >
          <Text className="text-white text-xs">{formatCount(unreadCount)}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};
export default NotificationIcon;
