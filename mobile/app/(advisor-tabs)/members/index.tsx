import { MembersTabs } from "@/components/members-tabs";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const MembersPage = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View className="bg-white flex-1 gap-4">
        <MembersTabs />
      </View>
    </GestureHandlerRootView>
  );
};
export default MembersPage;
