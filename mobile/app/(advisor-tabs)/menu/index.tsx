import { Header } from "@/app/_layout";
import { Icon } from "@/components/ui/icon";
import { VStack } from "@/components/ui/vstack";
import { useAppSelector } from "@/store/hooks";
import { Advisor } from "@/types";
import { useRouter } from "expo-router";
import {
  Building,
  CircleDollarSign,
  ImagePlus,
  Megaphone,
  Settings,
  ShieldHalf,
} from "lucide-react-native";
import { Text, TouchableOpacity, View } from "react-native";

const MenuPage = () => {
  const user = useAppSelector((state) => state.auth.user);
  const router = useRouter();

  const routes = [
    {
      key: "profile",
      label: "Society Profile",
      icon: Building,
      pathname: {
        pathname: "/society/[id]",
        params: { id: (user as Advisor).societyId },
      },
    },
    {
      key: "announcements",
      label: "Announcements",
      icon: Megaphone,
      pathname: "/(advisor-tabs)/menu/announcements",
    },
    {
      key: "teams",
      label: "Teams",
      icon: ShieldHalf,
      pathname: "/(advisor-tabs)/menu/teams",
    },
    {
      key: "payments",
      label: "Payments",
      icon: CircleDollarSign,
      pathname: "/(advisor-tabs)/menu/payments",
    },
    {
      key: "create-post",
      label: "Create Post",
      icon: ImagePlus,
      pathname: "/(advisor-tabs)/menu/create-post",
    },
    {
      key: "settings",
      label: "Society Settings",
      icon: Settings,
      pathname: "/(advisor-tabs)/menu/settings",
    },
  ];

  return (
    <View className="bg-white flex-1">
      <VStack space="sm" className="py-4">
        {routes.map((route) => (
          <TouchableOpacity
            onPress={() => router.push(route.pathname as any)}
            key={route.key}
            className="flex-row gap-3 items-center p-4 border-b border-neutral-300"
          >
            <Icon as={route.icon} size="xl" />
            <Text className="flex-1 text-lg">{route.label}</Text>
          </TouchableOpacity>
        ))}
      </VStack>
    </View>
  );
};
export default MenuPage;
