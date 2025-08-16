import { RelativePathString } from "expo-router";
import { Drawer } from "expo-router/drawer";
import { Text, View, TouchableOpacity, ScrollView } from "react-native";
import { DrawerToggleButton } from "@react-navigation/drawer";
import { useAppSelector } from "@/store/hooks";
import { Icon } from "@/components/ui/icon";
import {
  Bell,
  ChevronDown,
  ChevronRight,
  Users,
  Building,
  CalendarCheck,
  Megaphone,
  ShieldHalf,
  CircleDollarSign,
  ImagePlus,
  Settings,
  Home,
} from "lucide-react-native";
import { useState } from "react";
import { router } from "expo-router";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Society } from "@/types";
import { PRIVILEGES } from "@/constants";
import { Header } from "@/app/_layout";
import NotificationIcon from "@/features/notifications/notification-icon";

const HomeHeader = () => {
  return (
    <View className="flex-row items-center p-4 bg-white border-b border-b-neutral-300">
      <DrawerToggleButton tintColor="#218bff" />
      <Text className="text-xl font-bold ml-2 text-neutral-800 flex-1">
        Home
      </Text>
      <NotificationIcon />
    </View>
  );
};

const getSocietyRoutes = (society: Society & { privileges: string[] }) => {
  return [
    {
      key: "profile",
      label: "Society Profile",
      icon: Building,
      pathname: "/society/[id]",
    },
    {
      key: "events",
      label: "Events",
      icon: CalendarCheck,
      pathname: "/(student-tabs)/home/[societyId]/events",
    },
    {
      key: "members",
      label: "Members",
      icon: Users,
      pathname: "/(student-tabs)/home/[societyId]/members",
    },
    {
      key: "announcements",
      label: "Announcements",
      icon: Megaphone,
      pathname: "/(student-tabs)/home/[societyId]/announcements",
    },
    {
      key: "teams",
      label: "Teams",
      icon: ShieldHalf,
      pathname: "/(student-tabs)/home/[societyId]/teams",
    },
    ...(society.privileges.includes(PRIVILEGES.PAYMENT_FINANCE_MANAGEMENT)
      ? [
          {
            key: "payments",
            label: "Payments",
            icon: CircleDollarSign,
            pathname: "/(student-tabs)/home/[societyId]/payments",
          },
        ]
      : []),
    ...(society.privileges.includes(PRIVILEGES.CONTENT_MANAGEMENT)
      ? [
          {
            key: "create-post",
            label: "Create Post",
            icon: ImagePlus,
            pathname: "/(student-tabs)/home/[societyId]/create-post",
          },
        ]
      : []),
    ...(society.privileges.includes(PRIVILEGES.SOCIETY_SETTINGS_MANAGEMENT)
      ? [
          {
            key: "setting",
            label: "Society Settings",
            icon: Settings,
            pathname: "/(student-tabs)/home/[societyId]/settings",
          },
        ]
      : []),
  ];
};

const CustomDrawerContent = ({ navigation }: any) => {
  const { user } = useAppSelector((state) => state.auth);
  const societies = user && "registrationNumber" in user ? user.societies : [];
  const [expandedSocieties, setExpandedSocieties] = useState<string[]>([]);

  const toggleSociety = (societyId: string) => {
    setExpandedSocieties((prev) =>
      prev.includes(societyId)
        ? prev.filter((id) => id !== societyId)
        : [...prev, societyId]
    );
  };

  const navigateToSocietyRoute = (societyId: string, pathname: string) => {
    navigation.closeDrawer();
    router.push({
      pathname: pathname as RelativePathString,
      params: { societyId },
    });
  };

  return (
    <ScrollView style={{ flex: 1 }} className="p-4">
      <TouchableOpacity
        className="flex-row items-center py-3 px-4"
        onPress={() => router.push("/(student-tabs)/home")}
      >
        <Icon as={Home} size="md" className="text-neutral-500 mr-3" />
        <Text className="text-lg text-neutral-800">Home</Text>
      </TouchableOpacity>
      {/* Societies */}
      {societies?.map(({ society }) => {
        const isExpanded = expandedSocieties.includes(society.id);

        return (
          <View key={society.id} className="border-b border-neutral-100">
            {/* Society Header */}
            <TouchableOpacity
              className="flex-row items-center justify-between py-2"
              onPress={() => toggleSociety(society.id)}
            >
              <View className="flex-row items-center gap-2 flex-1">
                <Avatar className="bg-primary-500">
                  <Icon as={Building} className="text-white" />
                  <AvatarImage
                    source={{
                      uri: society.logo,
                    }}
                  />
                </Avatar>
                <Text
                  className="text-lg font-semibold text-neutral-800 flex-1"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {society.name}
                </Text>
              </View>
              <Icon
                as={isExpanded ? ChevronDown : ChevronRight}
                size="md"
                className="text-neutral-500"
              />
            </TouchableOpacity>

            {/* Society Routes */}
            {isExpanded && (
              <View className="pl-6 pb-2">
                {getSocietyRoutes(society).map((route) => (
                  <TouchableOpacity
                    key={route.key}
                    className="flex-row items-center py-3"
                    onPress={() =>
                      navigateToSocietyRoute(society.id, route.pathname)
                    }
                  >
                    <Icon
                      as={route.icon}
                      size="md"
                      className="text-neutral-500 mr-3"
                    />
                    <Text className="text-sm text-neutral-600">
                      {route.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        );
      })}

      {societies?.length === 0 && (
        <View className="py-8 items-center">
          <Text className="text-neutral-500 text-center">
            No societies joined yet
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

export default function HomeLayout() {
  return (
    <Drawer
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          backgroundColor: "#fff",
          width: 320,
        },
        drawerActiveTintColor: "#218bff",
        drawerInactiveTintColor: "#7a7a7a",
      }}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen
        name="index"
        options={{
          drawerItemStyle: { display: "none" }, // Hide from drawer menu
          header: () => <HomeHeader />,
          headerShown: true,
        }}
      />
      <Drawer.Screen
        name="notifications"
        options={{
          drawerItemStyle: { display: "none" }, // Hide from drawer menu
          header: () => <Header title="Notifications" backButton />,
          headerShown: true,
        }}
      />

      {/* Dynamic routes for each society */}
      <Drawer.Screen
        name="[societyId]"
        options={{
          drawerItemStyle: { display: "none" }, // Hide from drawer menu
          headerShown: false,
        }}
      />
    </Drawer>
  );
}
