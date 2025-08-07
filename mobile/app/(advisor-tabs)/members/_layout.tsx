import { Stack } from "expo-router";
import { Text, View } from "react-native";

export default function MembersLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          header: () => (
            <View className="flex-row items-center p-4 bg-white">
              <Text className="text-2xl font-heading font-bold">
                Members & Roles
              </Text>
            </View>
          ),
        }}
      />
    </Stack>
  );
}
