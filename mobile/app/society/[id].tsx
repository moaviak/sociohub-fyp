import { useLocalSearchParams } from "expo-router";
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SocietyPage() {
  const { id } = useLocalSearchParams();

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white">
      <Text>{id}</Text>
    </SafeAreaView>
  );
}
