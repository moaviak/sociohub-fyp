import { View, Text, Image } from "react-native";

import { icons } from "@/constants";
import { VStack } from "@/components/ui/vstack";
import { ScanTicket } from "@/components/menu/scan-ticket/scan-ticket";
import { useAppSelector } from "@/store/hooks";

const MenuPage = () => {
  const { user } = useAppSelector((state) => state.auth);
  const haveEventPrivilege =
    user &&
    "registrationNumber" in user &&
    user.societies?.some((society) =>
      society.privileges.includes("event_management")
    );

  return (
    <View className="bg-white flex-1 px-4 py-2 gap-4">
      <View className="w-full px-4 py-2">
        <Text className="font-heading font-bold text-2xl">Menu Options</Text>
      </View>
      <VStack space="md">
        {haveEventPrivilege && (
          <View className="gap-2">
            <ScanTicket />
            <View className="w-full h-0.5 bg-neutral-200" />
          </View>
        )}
      </VStack>
    </View>
  );
};
export default MenuPage;
