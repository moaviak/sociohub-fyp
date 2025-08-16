import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  useWindowDimensions,
  TouchableOpacity,
  ScrollView,
  Animated,
} from "react-native";
import { TabView, SceneMap, TabBarProps } from "react-native-tab-view";
import { useLocalSearchParams, useRouter } from "expo-router";
import Societies from "@/features/societies";
import Events from "@/features/events";
import People from "@/features/users/people";
import Announcements from "@/features/announcements";

const renderScene = SceneMap({
  societies: Societies,
  events: Events,
  people: People,
  announcements: Announcements,
});

// Define the route type
type TabRoute = {
  key: string;
  title: string;
};

const ExplorePage = () => {
  const layout = useWindowDimensions();
  const router = useRouter();
  const { tab } = useLocalSearchParams<{ tab?: string }>();

  // Tab routes configuration
  const routes: TabRoute[] = [
    { key: "societies", title: "Societies" },
    { key: "events", title: "Events" },
    { key: "people", title: "People" },
    { key: "announcements", title: "Announcements" },
  ];

  // Function to get initial tab index based on query parameter
  const getInitialTabIndex = () => {
    if (!tab) return 0; // Default to "Societies" if no tab query

    const tabIndex = routes.findIndex((route) => route.key === tab);
    return tabIndex !== -1 ? tabIndex : 0; // Return found index or default to 0
  };

  const [index, setIndex] = useState<number>(getInitialTabIndex());
  const scrollViewRef = useRef<ScrollView>(null);

  // Update tab index when query parameter changes
  useEffect(() => {
    const newIndex = getInitialTabIndex();
    setIndex(newIndex);

    // Handle scroll position for the new tab
    if (newIndex === 2 || newIndex === 3) {
      // People or Announcements
      scrollViewRef.current?.scrollTo({
        x: layout.width / 3, // Scroll to show Announcements tab
        animated: true,
      });
    } else {
      scrollViewRef.current?.scrollTo({
        x: 0, // Scroll back to beginning
        animated: true,
      });
    }
  }, [tab, layout.width]);

  // Calculate tab width to show 3 tabs initially
  const tabWidth = layout.width / 3;

  // Handle tab change and scroll behavior
  const handleIndexChange = (newIndex: number) => {
    setIndex(newIndex);

    // Update URL with the new tab parameter
    const selectedTab = routes[newIndex];
    router.setParams({ tab: selectedTab.key });

    // Scroll logic to show the "Announcements" tab when "People" is selected
    if (newIndex === 2 || newIndex === 3) {
      // People or Announcements
      scrollViewRef.current?.scrollTo({
        x: tabWidth, // Scroll to show Announcements tab
        animated: true,
      });
    } else {
      scrollViewRef.current?.scrollTo({
        x: 0, // Scroll back to beginning
        animated: true,
      });
    }
  };

  // Custom Tab Bar with horizontal scroll
  const renderTabBar = (props: TabBarProps<TabRoute>) => {
    const inputRange = props.navigationState.routes.map(
      (_: TabRoute, i: number) => i
    );

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
          {props.navigationState.routes.map((route: TabRoute, i: number) => {
            const opacity = props.position.interpolate({
              inputRange,
              outputRange: inputRange.map((inputIndex: number) =>
                inputIndex === i ? 1 : 0.7
              ),
            });

            const isActive = i === props.navigationState.index;

            return (
              <TouchableOpacity
                key={route.key}
                className="items-center py-3 px-2 border-b-primary-500"
                style={{
                  width: tabWidth,
                  borderBottomWidth: isActive ? 3 : 0,
                }}
                onPress={() => handleIndexChange(i)}
                activeOpacity={0.8}
              >
                <Animated.Text
                  className={`text-center text-sm ${
                    isActive
                      ? "text-primary-500 font-semibold"
                      : "text-neutral-500"
                  }`}
                  style={{
                    opacity,
                  }}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {route.title}
                </Animated.Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  return (
    <View className="bg-white flex-1 py-2 gap-4">
      {/* Header */}
      <View className="w-full px-4 py-2 flex-row gap-2">
        <Text className="font-heading font-bold text-2xl">Explore</Text>
        <Text className="font-heading font-bold text-2xl text-primary-500">
          SocioHub
        </Text>
      </View>

      {/* Tab View with custom scrollable tab bar */}
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={handleIndexChange}
        initialLayout={{ width: layout.width }}
        renderTabBar={renderTabBar}
        swipeEnabled={true}
        lazy={false}
        style={{ flex: 1 }}
      />
    </View>
  );
};

export default ExplorePage;
