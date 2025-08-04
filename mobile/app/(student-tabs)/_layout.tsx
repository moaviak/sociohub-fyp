import { icons, images } from "@/constants";
import { useAppSelector } from "@/store/hooks";
import { UserType } from "@/types";
import { Advisor } from "@/types/type";
import { router, Tabs } from "expo-router";
import { useEffect } from "react";
import {
  ActivityIndicator,
  Image,
  ImageSourcePropType,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const TabIcon = ({
  icon,
  color,
  focused,
  name,
}: {
  icon: ImageSourcePropType;
  color: string;
  focused: boolean;
  name: string;
}) => {
  return (
    <View
      className="items-center"
      style={{
        height: 60,
        justifyContent: "space-between",
        paddingBottom: 4,
        paddingTop: 8,
        width: 70,
        minWidth: 70,
      }}
    >
      <View
        style={{
          height: 26,
          width: 26,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Image
          source={icon}
          resizeMode="contain"
          tintColor={color}
          style={{ width: 26, height: 26 }}
        />
      </View>
      <Text
        className="font-body text-xs text-center"
        numberOfLines={1}
        style={{
          color,
          fontWeight: focused ? "600" : "400",
          fontSize: 12,
          lineHeight: 14,
          width: 70,
        }}
      >
        {name}
      </Text>
    </View>
  );
};

const ProfileTabIcon = ({
  icon,
  color,
  focused,
  name,
}: {
  icon: string | ImageSourcePropType;
  color: string;
  focused: boolean;
  name: string;
}) => {
  return (
    <View
      className="items-center"
      style={{
        height: 60,
        justifyContent: "space-between",
        paddingBottom: 4,
        paddingTop: 8,
        width: 70,
        minWidth: 70,
      }}
    >
      <View
        style={{
          height: 26,
          width: 26,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Image
          source={typeof icon === "string" ? { uri: icon } : icon}
          resizeMode="cover"
          style={{ width: 26, height: 26, borderRadius: 13 }}
        />
      </View>
      <Text
        className="font-body text-xs text-center"
        numberOfLines={1}
        style={{
          color,
          fontWeight: focused ? "600" : "400",
          fontSize: 12,
          lineHeight: 14,
          width: 70,
        }}
      >
        {name}
      </Text>
    </View>
  );
};

const MenuTabIcon = () => {
  return (
    <View
      className="items-center"
      style={{
        height: 60,
        justifyContent: "center",
        paddingBottom: 4,
        paddingTop: 8,
        width: 70,
        minWidth: 70,
      }}
    >
      <View
        style={{
          height: 44,
          width: 44,
          borderRadius: 22,
          backgroundColor: "#218bff",
          justifyContent: "center",
          alignItems: "center",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.25,
          shadowRadius: 6,
          elevation: 6,
        }}
      >
        <Image
          source={icons.menu}
          style={{ width: 24, height: 24, tintColor: "#fff" }}
        />
      </View>
      {/* No label for menu */}
    </View>
  );
};

export default function StudentTabsLayout() {
  const { isAuthChecked, isAuthenticated, user, userType } = useAppSelector(
    (state) => state.auth
  );

  // Handle navigation effects
  useEffect(() => {
    if (!isAuthChecked) {
      // Still loading, don't redirect yet
      return;
    }

    if (!isAuthenticated) {
      // Not authenticated, redirect to sign-in
      router.replace("/auth/sign-in");
      return;
    }

    // User is authenticated, check for completion steps
    if (user) {
      if (!user.isEmailVerified) {
        router.replace("/auth/verify-email");
      } else if (
        userType === UserType.ADVISOR &&
        !(user as Advisor).societyId
      ) {
        router.replace("/auth/society-form");
      }
      // If all conditions are met, user stays on the current route (dashboard)
    }
  }, [isAuthChecked, isAuthenticated, user, userType]);

  // Show loading state while checking auth
  if (!isAuthChecked || !isAuthenticated) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white">
      <Tabs
        screenOptions={{
          tabBarShowLabel: false,
          headerShown: false,
          tabBarActiveTintColor: "#218bff",
          tabBarInactiveTintColor: "#7a7a7a",
          tabBarStyle: {
            position: "absolute",
            height: 80,
            paddingTop: 12,
            paddingBottom: 8,
            paddingHorizontal: 16,
            backgroundColor: "#fff",
            elevation: 10,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.08,
            shadowRadius: 6,
          },
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: "Home",
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                icon={icons.home}
                color={color}
                focused={focused}
                name="Home"
              />
            ),
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: "Explore",
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                icon={icons.explore}
                color={color}
                focused={focused}
                name="Explore"
              />
            ),
          }}
        />
        <Tabs.Screen
          name="menu"
          options={{
            title: "Menu",
            tabBarIcon: () => <MenuTabIcon />,
          }}
        />
        <Tabs.Screen
          name="chats"
          options={{
            title: "Chats",
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                icon={icons.chats}
                color={color}
                focused={focused}
                name="Chats"
              />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color, focused }) => (
              <ProfileTabIcon
                icon={user?.avatar || images.avatar}
                color={color}
                focused={focused}
                name="Profile"
              />
            ),
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
}
