import { Badge, BadgeText } from "@/components/ui/badge";
import { Role } from "@/types/type";
import { View, Text } from "react-native";

export const RolesBadges = ({ roles }: { roles: Role[] }) => {
  return (
    <View className="flex-row gap-x-1">
      <View className="px-2 py-1 rounded-lg border bg-secondary-100/40 border-secondary-400">
        <Text className="text-secondary-600 text-xs">{roles[0].name}</Text>
      </View>
      {roles.length > 1 && (
        <View className="px-2 py-1 rounded-lg border bg-primary-100/40 border-primary-400">
          <Text className="text-primary-600 text-xs">+{roles.length - 1}</Text>
        </View>
      )}
    </View>
  );
};
