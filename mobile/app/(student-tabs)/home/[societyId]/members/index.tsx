import { MembersTabs } from "@/components/members-tabs";
import { PRIVILEGES } from "@/constants";
import Members from "@/features/members";
import { checkPrivilege } from "@/lib/utils";
import { useAppSelector } from "@/store/hooks";
import { useLocalSearchParams } from "expo-router";
import { View } from "react-native";
const MembersScreen = () => {
  const { societyId } = useLocalSearchParams<{ societyId?: string }>();

  const user = useAppSelector((state) => state.auth.user);
  const isStudent = user && "registrationNumber" in user;

  if (!societyId) {
    return null;
  }

  const havePrivilege =
    !isStudent ||
    checkPrivilege(
      user.societies || [],
      societyId,
      PRIVILEGES.MEMBER_MANAGEMENT
    );

  return (
    <View
      className={`bg-white flex-1 gap-4 ${
        havePrivilege ? "" : "border-t border-gray-200"
      }`}
    >
      {havePrivilege ? <MembersTabs /> : <Members />}
    </View>
  );
};
export default MembersScreen;
