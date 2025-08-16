import { View, Text, ActivityIndicator, ScrollView } from "react-native";
import { useGetRecentAnnouncementsQuery } from "./api";
import { VStack } from "@/components/ui/vstack";
import { AnnouncementCard } from "./components/announcement-card";

const Announcements = () => {
  const { data: announcements, isLoading } = useGetRecentAnnouncementsQuery({
    limit: 20,
  });

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text>Announcements Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={{ flex: 1 }}
      contentContainerStyle={{
        paddingTop: 20,
        paddingBottom: 20,
      }}
    >
      <VStack space="md">
        {announcements?.map((announcement) => (
          <AnnouncementCard key={announcement.id} announcement={announcement} />
        ))}
      </VStack>
    </ScrollView>
  );
};

export default Announcements;
