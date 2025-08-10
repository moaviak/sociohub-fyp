import { VStack } from "@/components/ui/vstack";
import { useGetMyRegistrationsQuery } from "@/features/events/api";
import { View, Text, ActivityIndicator, ScrollView } from "react-native";
import { EventCard } from "./components/event-card";

export const MyEvents = () => {
  const { data: events, isLoading } = useGetMyRegistrationsQuery();

  if (isLoading) {
    return (
      <View className="p-6">
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      className="p-6"
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingBottom: 20 }}
    >
      <VStack space="md">
        {events?.map((event) => (
          <EventCard key={event.id} event={event} variant="registered" />
        ))}
      </VStack>
    </ScrollView>
  );
};
