import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { useGetSocietyAnnouncementsQuery } from "./api";
import { VStack } from "@/components/ui/vstack";
import { AnnouncementCard } from "./components/announcement-card";
import { Fab, FabIcon, FabLabel } from "@/components/ui/fab";
import { AddIcon } from "@/components/ui/icon";
import { useAppSelector } from "@/store/hooks";
import { checkPrivilege } from "@/lib/utils";
import { PRIVILEGES } from "@/constants";
import { Advisor } from "@/types";
import { useState } from "react";
import { AnnouncementForm } from "./components/announcement-form";

const SocietyAnnouncements = ({ societyId }: { societyId: string }) => {
  const [showForm, setShowForm] = useState(false);
  const user = useAppSelector((state) => state.auth.user);

  const isStudent = user && "registrationNumber" in user;
  const havePrivilege = isStudent
    ? checkPrivilege(
        user.societies || [],
        societyId,
        PRIVILEGES.ANNOUNCEMENT_MANAGEMENT
      )
    : (user as Advisor).societyId === societyId;

  const { data: announcements, isLoading } = useGetSocietyAnnouncementsQuery({
    societyId,
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
    <>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: 20,
          paddingBottom: havePrivilege ? 60 : 20,
        }}
      >
        <VStack space="md">
          {announcements?.map((announcement) => (
            <AnnouncementCard
              key={announcement.id}
              announcement={announcement}
              havePrivilege={havePrivilege}
            />
          ))}
        </VStack>
      </ScrollView>
      {havePrivilege && (
        <Fab
          size="md"
          placement="bottom right"
          onPress={() => setShowForm(true)}
        >
          <FabIcon as={AddIcon} />
          <FabLabel>Create New</FabLabel>
        </Fab>
      )}
      {showForm && (
        <AnnouncementForm
          societyId={societyId}
          open={showForm}
          setOpen={setShowForm}
        />
      )}
    </>
  );
};

export default SocietyAnnouncements;
