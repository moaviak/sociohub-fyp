import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { VStack } from "@/components/ui/vstack";
import {
  MessageCircle,
  MessageCircleMore,
  SearchIcon,
} from "lucide-react-native";
import { useState, useCallback } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { useDebounceCallback } from "usehooks-ts";
import { useGetAllUsersInfiniteQuery } from "./api";
import { UserAvatar } from "@/components/user-avatar";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { useAppSelector } from "@/store/hooks";
import { IOScrollView, InView } from "react-native-intersection-observer";

const People = () => {
  const currentUser = useAppSelector((state) => state.auth.user);
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const debouncedSetSearch = useDebounceCallback(setSearch, 300);

  const {
    data,
    isLoading,
    isFetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetAllUsersInfiniteQuery({ limit: 20, search });
  const users = data?.pages.flat().flatMap((user) => user.users) ?? [];

  // Intersection observer callback for infinite scroll
  const handleIntersection = useCallback(
    (inView: boolean) => {
      if (inView && hasNextPage && !isFetchingNextPage && !isFetching) {
        fetchNextPage();
      }
    },
    [hasNextPage, isFetchingNextPage, isFetching, fetchNextPage]
  );

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="text-gray-500 mt-4">Loading users...</Text>
      </View>
    );
  }

  const handleInputChange = (text: string) => {
    setInput(text);
    debouncedSetSearch(text);
  };

  const renderLoadingFooter = () => {
    if (!isFetchingNextPage) return null;

    return (
      <View className="py-4 items-center">
        <ActivityIndicator size="small" color="#3b82f6" />
        <Text className="text-gray-500 mt-2 text-sm">
          Loading more users...
        </Text>
      </View>
    );
  };

  const renderEndMessage = () => {
    if (users.length === 0 || hasNextPage || isFetchingNextPage) return null;

    return (
      <View className="py-4 items-center">
        <Text className="text-gray-500 text-sm">You've reached the end</Text>
      </View>
    );
  };

  return (
    <IOScrollView
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
            placeholder="Search People..."
            value={input}
            onChangeText={handleInputChange}
          />
        </Input>

        <VStack space="md" style={{ marginBottom: 16 }}>
          {users.length > 0 ? (
            <>
              {users.map((user) => (
                <View
                  key={user.id}
                  className="flex-row justify-between items-center"
                >
                  <UserAvatar user={user} />
                  {user.id !== currentUser?.id && (
                    <Button variant="outline" size="sm">
                      <ButtonIcon
                        as={MessageCircleMore}
                        className="text-primary-500"
                      />
                      <ButtonText>Message</ButtonText>
                    </Button>
                  )}
                </View>
              ))}

              {/* Infinite Scroll Trigger */}
              {hasNextPage && (
                <InView
                  onChange={handleIntersection}
                  threshold={0.1}
                  rootMargin="100px"
                >
                  <View style={{ height: 20 }}>
                    {/* Invisible trigger element */}
                  </View>
                </InView>
              )}

              {/* Loading Footer */}
              {renderLoadingFooter()}

              {/* End Message */}
              {renderEndMessage()}
            </>
          ) : (
            <View className="items-center justify-center py-12">
              <Text className="text-gray-500 text-center">
                {search
                  ? `No users found matching "${search}"`
                  : "No users found"}
              </Text>
            </View>
          )}
        </VStack>
      </VStack>
    </IOScrollView>
  );
};

export default People;
