import { Icon } from "@/components/ui/icon";
import { Stack } from "expo-router";
import { Bell } from "lucide-react-native";
import { Text, View } from "react-native";

export default function HomeLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          header: () => (
            <View className="flex-row items-center p-4 bg-white border-b border-b-neutral-300">
              <Text className="text-2xl font-bold font-heading ml-2 text-neutral-600 flex-1">
                Home
              </Text>
              <Icon as={Bell} size="xl" className="mr-4" />
            </View>
          ),
        }}
      />
    </Stack>
  );
}
