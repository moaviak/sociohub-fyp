import { Stack } from "expo-router";
import { useLocalSearchParams } from "expo-router";
import { View, Text } from "react-native";
import { DrawerToggleButton } from "@react-navigation/drawer";
import { useAppSelector } from "@/store/hooks";

const SocietyHeader = ({ title }: { title: string }) => {
  const { societyId } = useLocalSearchParams();
  const { user } = useAppSelector((state) => state.auth);
  const societies = user && "registrationNumber" in user ? user.societies : [];

  const society = societies?.find(({ society }) => society.id === societyId);

  return (
    <View className="flex-row items-center px-4 py-3 bg-white">
      <DrawerToggleButton tintColor="#218bff" />
      <View className="flex-1 ml-2">
        <Text className="text-xl font-semibold text-neutral-800">{title}</Text>
        {society && (
          <Text className="text-sm text-neutral-400">
            {society.society.name}
          </Text>
        )}
      </View>
    </View>
  );
};

export default function SocietyLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
      }}
    >
      <Stack.Screen
        name="events"
        options={{
          header: () => <SocietyHeader title="Events" />,
        }}
      />
      <Stack.Screen
        name="members"
        options={{
          header: () => <SocietyHeader title="Members" />,
        }}
      />
      <Stack.Screen
        name="announcements"
        options={{
          header: () => <SocietyHeader title="Announcements" />,
        }}
      />
      <Stack.Screen
        name="teams"
        options={{
          header: () => <SocietyHeader title="Teams" />,
        }}
      />
      <Stack.Screen
        name="payments"
        options={{
          header: () => <SocietyHeader title="Payments" />,
        }}
      />
      <Stack.Screen
        name="create-post"
        options={{
          header: () => <SocietyHeader title="Create Post" />,
        }}
      />
      <Stack.Screen
        name="settings"
        options={{
          header: () => <SocietyHeader title="Society Settings" />,
        }}
      />
    </Stack>
  );
}
