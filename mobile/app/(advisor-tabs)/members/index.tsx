import { MembersTabs } from "@/components/members-tabs";
import { View } from "react-native";

const MembersPage = () => {
  return (
    <View className="bg-white flex-1 gap-4">
      <MembersTabs />
    </View>
  );
};
export default MembersPage;
