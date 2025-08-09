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
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 bg-white border-b border-gray-200">
        {/* Back Button */}
        <TouchableOpacity
          onPress={handleGoBack}
          className="mr-3 p-2 -ml-2"
          activeOpacity={0.7}
        >
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>

        {/* Header Title */}
        <Text className="flex-1 text-lg font-semibold text-gray-900">
          Event Details
        </Text>
      </View>

      {/* Main Content */}
      <View className="flex-1 p-4 bg-white">
        <EventDetail eventId={id} />
      </View>
    </SafeAreaView>
  );
};

export default EventScreen;
