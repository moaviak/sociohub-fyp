import { Header } from "@/app/_layout";
import { Stack } from "expo-router";

export default function EventsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          header: () => <Header title="Events" />,
        }}
      />
    </Stack>
  );
}
