import SocietyAnnouncements from "@/features/announcements/society-announcements";
import useGetSocietyId from "@/hooks/useGetSocietyId";
import { View, Text } from "react-native";

const AnnouncementsScreen = () => {
  const societyId = useGetSocietyId();

  return (
    <View className="bg-white flex-1">
      <SocietyAnnouncements societyId={societyId} />
    </View>
  );
};

export default AnnouncementsScreen;
