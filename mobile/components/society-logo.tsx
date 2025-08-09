import { Society } from "@/types";
import { View, Text } from "react-native";
import { Avatar, AvatarImage } from "./ui/avatar";
import { Icon } from "./ui/icon";
import { Building } from "lucide-react-native";
import { Link } from "expo-router";

export const SocietyLogo = ({ society }: { society: Society }) => {
  return (
    <Link
      href={{ pathname: "/society/[id]", params: { id: society.id } }}
      style={{ flex: 1, flexShrink: 1 }}
    >
      <View
        className="flex-row items-center gap-2 p-2"
        style={{ flexShrink: 1 }}
      >
        {/* Placeholder for society logo */}
        <Avatar className="bg-primary-500">
          <Icon as={Building} className="text-white" />
          <AvatarImage
            source={{
              uri: society.logo,
            }}
          />
        </Avatar>
        <Text
          className="font-medium text-neutral-600"
          numberOfLines={1}
          style={{ flexShrink: 1 }}
        >
          {society.name}
        </Text>
      </View>
    </Link>
  );
};
