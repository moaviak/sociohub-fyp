import useGetSocietyId from "@/hooks/useGetSocietyId";
import { useState } from "react";
import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { useDebounceCallback } from "usehooks-ts";
import { useGetSocietyRequestsQuery } from "./api";
import { VStack } from "@/components/ui/vstack";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { SearchIcon } from "lucide-react-native";
import { RequestCard } from "./components/request-card";

const JoinRequests = () => {
  const societyId = useGetSocietyId();
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const debouncedSetSearch = useDebounceCallback(setSearch, 300);

  const {
    data: requests,
    isFetching,
    isLoading,
  } = useGetSocietyRequestsQuery({
    societyId,
    search,
  });

  const handleInputChange = (text: string) => {
    setInput(text);
    debouncedSetSearch(text);
  };

  // Check if we should show loading state
  const shouldShowLoading = isLoading || (isFetching && !requests);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      className="flex-1 p-6"
      contentContainerStyle={{ paddingBottom: 20 }}
    >
      <VStack space="xl" className="flex-1">
        {/* Search Input */}
        <Input size="lg" className="px-4 rounded-xl">
          <InputSlot className="pl-3">
            <InputIcon as={SearchIcon} />
          </InputSlot>
          <InputField
            placeholder="Search Requests..."
            value={input}
            onChangeText={handleInputChange}
          />
        </Input>

        <VStack>
          {shouldShowLoading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="small" />
            </View>
          ) : requests && requests.length > 0 ? (
            // Render actual society cards when we have results
            requests.map((request) => (
              <RequestCard key={request.id} request={request} />
            ))
          ) : (
            // Show no results message
            <View className="items-center justify-center py-12">
              <Text className="text-gray-500 text-center">
                No requests found
              </Text>
            </View>
          )}
        </VStack>
      </VStack>
    </ScrollView>
  );
};

export default JoinRequests;
