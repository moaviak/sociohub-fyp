import SocietyEvents from "@/features/events/society-events";
import useGetSocietyId from "@/hooks/useGetSocietyId";
import { View } from "react-native";

const EventsScreen = () => {
  const societyId = useGetSocietyId();

  return (
    <View className="bg-white flex-1 gap-4 border-t border-gray-200">
      <SocietyEvents societyId={societyId} />
    </View>
  );
};

export default EventsScreen;
