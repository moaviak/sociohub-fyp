import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { VStack } from "@/components/ui/vstack";
import { SearchIcon } from "lucide-react-native";
import { ScrollView, View, Text } from "react-native";
import { useGetSocietiesQuery } from "./api";
import { SocietyCard } from "./components/society-card";
import { useState } from "react";
import { useDebounceCallback } from "usehooks-ts";

const Societies = () => {
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const debouncedSetSearch = useDebounceCallback(setSearch, 300);

  // Use the debounced search value for the API call
  const {
    data: societies,
    isLoading,
    isFetching,
  } = useGetSocietiesQuery({ search });

  const handleInputChange = (text: string) => {
    setInput(text);
    debouncedSetSearch(text);
  };

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
            placeholder="Search Societies..."
            value={input}
            onChangeText={handleInputChange}
          />
        </Input>

        <VStack space="lg">
          {isLoading ? (
            // Render skeleton cards while loading or typing
            Array.from({ length: 10 }).map((_, index) => (
              <SocietyCard.Skeleton key={`skeleton-${index}`} />
            ))
          ) : societies && societies.length > 0 ? (
            // Render actual society cards when we have results
            societies.map((society) => (
              <SocietyCard key={society.id} society={society} />
            ))
          ) : (
            // Show no results message
            <View className="items-center justify-center py-12">
              <Text className="text-gray-500 text-center">
                No societies found
              </Text>
            </View>
          )}
        </VStack>
      </VStack>
    </ScrollView>
  );
};

export default Societies;
