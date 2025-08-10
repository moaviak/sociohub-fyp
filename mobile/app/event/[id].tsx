import EventDetail from "@/features/events/event-detail";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { View, Text, TouchableOpacity, SafeAreaView } from "react-native";

const EventScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* Main Content */}
      <View className="flex-1 p-4 bg-white">
        <EventDetail eventId={id} />
      </View>
    </SafeAreaView>
  );
};

export default EventScreen;
