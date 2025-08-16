import EventDetail from "@/features/events/event-detail";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ArrowLeft } from "lucide-react-native";
import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Header } from "../_layout";

const EventScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white">
      <Header title="Event Details" backButton />
      {/* Main Content */}
      <View className="flex-1 p-4 bg-white">
        <EventDetail eventId={id} />
      </View>
    </SafeAreaView>
  );
};

export default EventScreen;
