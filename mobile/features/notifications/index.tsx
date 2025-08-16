import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  TouchableHighlight,
  TouchableOpacity,
} from "react-native";
import { useGetNotificationsQuery } from "./api";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Heading } from "@/components/ui/heading";
import { cn, formatTimeShort } from "@/lib/utils";
import { markNotificationRead } from "@/providers/socket-provider";
import { markNotificationAsRead } from "./slice";
import { useRouter } from "expo-router";
import { Notification } from "@/types";

const Notifications = () => {
  const { isLoading } = useGetNotificationsQuery();
  const dispatch = useAppDispatch();
  const { notifications, unreadCount } = useAppSelector(
    (state) => state.notifications
  );
  const router = useRouter();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
        <Text>Loading Notifications...</Text>
      </View>
    );
  }

  const handleClick = (notification: Notification) => {
    if (notification.mobileRedirectUrl) {
      router.push({
        pathname: notification.mobileRedirectUrl?.pathname as any,
        params: notification.mobileRedirectUrl?.params,
      });
    }
    markNotificationRead(notification.id);
    dispatch(markNotificationAsRead(notification.id));
  };

  // Group notifications by time periods
  const groupNotificationsByTime = (notifications: Notification[]) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const groups = {
      today: [] as Notification[],
      yesterday: [] as Notification[],
      lastWeek: [] as Notification[],
      lastMonth: [] as Notification[],
      older: [] as Notification[],
    };

    notifications?.forEach((notification) => {
      const createdAt = notification.createdAt
        ? new Date(notification.createdAt)
        : "";

      if (createdAt >= today) {
        groups.today.push(notification);
      } else if (createdAt >= yesterday) {
        groups.yesterday.push(notification);
      } else if (createdAt >= lastWeek) {
        groups.lastWeek.push(notification);
      } else if (createdAt >= lastMonth) {
        groups.lastMonth.push(notification);
      } else {
        groups.older.push(notification);
      }
    });

    return groups;
  };

  const groupedNotifications = groupNotificationsByTime(notifications || []);

  const renderNotification = (notification: Notification) => (
    <TouchableOpacity
      key={notification.id}
      onPress={() => handleClick(notification)}
      className={cn(
        "flex-row items-center gap-3 p-4",
        notification.isRead ? "bg-white" : "bg-primary-100/25"
      )}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          flex: 1,
        }}
      >
        {notification.image && (
          <Avatar>
            <AvatarImage
              source={{
                uri: notification.image,
              }}
              alt="notification"
            />
          </Avatar>
        )}
        <VStack style={{ flex: 1 }}>
          <HStack className="justify-between" space="md">
            <Heading
              size="sm"
              className="text-typography-950"
              numberOfLines={1}
              style={{ flexShrink: 1 }}
            >
              {notification.title}
            </Heading>
            {notification.createdAt && (
              <Text className="text-typography-500 text-sm">
                {formatTimeShort(notification.createdAt)}
              </Text>
            )}
          </HStack>
          <Text className="text-typography-500 text-sm" numberOfLines={2}>
            {notification.description}
          </Text>
        </VStack>
      </View>
    </TouchableOpacity>
  );

  const renderSection = (title: string, notifications: Notification[]) => {
    if (notifications.length === 0) return null;

    return (
      <VStack key={title} space="xs">
        <Text className="text-typography-700 font-semibold text-base px-4 pt-4 pb-2">
          {title}
        </Text>
        <VStack space="xs">{notifications.map(renderNotification)}</VStack>
      </VStack>
    );
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingVertical: 16 }}
    >
      <VStack space="md">
        {renderSection("Today", groupedNotifications.today)}
        {renderSection("Yesterday", groupedNotifications.yesterday)}
        {renderSection("Last 7 days", groupedNotifications.lastWeek)}
        {renderSection("Last 30 days", groupedNotifications.lastMonth)}
        {renderSection("Older", groupedNotifications.older)}

        {notifications?.length === 0 && (
          <View className="flex-1 items-center justify-center p-8">
            <Text className="text-typography-500 text-center">
              No notifications yet
            </Text>
          </View>
        )}
      </VStack>
    </ScrollView>
  );
};

export default Notifications;
