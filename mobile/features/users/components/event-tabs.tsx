import { TabRoute } from "@/components/members-tabs";
import { Icon } from "@/components/ui/icon";
import { useLocalSearchParams, useRouter } from "expo-router";
import { CalendarCheck2, CalendarPlus2 } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  useWindowDimensions,
  ScrollView,
  TouchableOpacity,
  Animated,
} from "react-native";
import { MyEvents } from "@/features/events/my-events";

export const InvitedEvents = () => {
  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-4">
        <Text className="text-lg font-semibold mb-4">Invited Events</Text>
        <Text className="text-gray-600">
          The feature will be soon available.
        </Text>
      </View>
    </ScrollView>
  );
};

export const EventTabs = () => {
  const layout = useWindowDimensions();
  const router = useRouter();
  const { tab } = useLocalSearchParams<{ tab?: string }>();

  const routes = [
    { key: "myEvents", title: "My Events" },
    { key: "invitedEvents", title: "Invited Events" },
  ];

  const icons = {
    myEvents: CalendarCheck2,
    invitedEvents: CalendarPlus2,
  };

  const getInitialTabIndex = () => {
    if (!tab) return 0;
    const tabIndex = routes.findIndex((route) => route.key === tab);
    return tabIndex !== -1 ? tabIndex : 0;
  };

  const [index, setIndex] = useState<number>(getInitialTabIndex());
  const scrollViewRef = useRef<ScrollView>(null);

  // Update tab index when query parameter changes
  useEffect(() => {
    const newIndex = getInitialTabIndex();
    setIndex(newIndex);
  }, [tab]);

  const tabWidth = layout.width / 2;

  const handleIndexChange = (newIndex: number) => {
    setIndex(newIndex);
    const selectedTab = routes[newIndex];
    router.setParams({ tab: selectedTab.key });
  };

  // Manual scene rendering - this should definitely work
  const renderCurrentScene = () => {
    switch (index) {
      case 0:
        return <MyEvents />;
      case 1:
        return <InvitedEvents />;
      default:
        return (
          <View className="flex-1 justify-center items-center bg-white">
            <Text>Error: Unknown tab index {index}</Text>
          </View>
        );
    }
  };

  // Custom Tab Bar
  const renderTabBar = () => {
    return (
      <View className="elevation-none shadow-none border-b border-b-neutral-300 bg-white">
        <ScrollView
          ref={scrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ flexGrow: 0 }}
          contentContainerStyle={{ paddingHorizontal: 0 }}
          bounces={false}
        >
          {routes.map((route, i: number) => {
            const isActive = i === index;

            return (
              <TouchableOpacity
                key={route.key}
                className="flex-row justify-center items-center gap-2 py-3 px-2 border-b-primary-500"
                style={{
                  width: tabWidth,
                  borderBottomWidth: isActive ? 3 : 0,
                }}
                onPress={() => handleIndexChange(i)}
                activeOpacity={0.8}
              >
                <Icon
                  as={icons[route.key as keyof typeof icons]}
                  className={isActive ? "text-primary-500" : "text-neutral-500"}
                />
                <Text
                  className={`text-center text-sm ${
                    isActive
                      ? "text-primary-500 font-semibold"
                      : "text-neutral-500"
                  }`}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {route.title}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      {renderTabBar()}
      {renderCurrentScene()}
    </View>
  );
};
