import { useState } from "react";
import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { useDebounceCallback } from "usehooks-ts";
import { useGetEventsQuery } from "./api";
import { VStack } from "@/components/ui/vstack";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { SearchIcon } from "lucide-react-native";
import { EventCard } from "./components/event-card";

const Events = () => {
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const debouncedSetSearch = useDebounceCallback(setSearch, 300);

  const { data: events, isLoading, isFetching } = useGetEventsQuery({ search });

  const handleInputChange = (text: string) => {
    setInput(text);
    debouncedSetSearch(text);
  };

  // Check if we should show loading state
  const shouldShowLoading = isLoading || (isFetching && !events);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      className="p-6"
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingBottom: 20 }}
    >
      <VStack space="xl" className="flex-1">
        {/* Search Input */}
        <Input size="lg" className="px-4 rounded-xl">
          <InputSlot className="pl-3">
            <InputIcon as={SearchIcon} />
          </InputSlot>
          <InputField
            placeholder="Search Events..."
            value={input}
            onChangeText={handleInputChange}
          />
        </Input>

        <VStack space="md" style={{ marginBottom: 16 }}>
          {shouldShowLoading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="small" />
            </View>
          ) : events && events.length > 0 ? (
            // Render actual society cards when we have results
            events.map((event) => <EventCard key={event.id} event={event} />)
          ) : (
            // Show no results message
            <View className="items-center justify-center py-12">
              <Text className="text-gray-500 text-center">No events found</Text>
            </View>
          )}
        </VStack>
      </VStack>
    </ScrollView>
  );
};

export default Events;
