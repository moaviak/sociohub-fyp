import { useState } from "react";
import { useDebounceCallback } from "usehooks-ts";
import { useGetSocietyMembersQuery } from "../api";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { VStack } from "@/components/ui/vstack";
import { Input, InputField } from "@/components/ui/input";
import {
  Checkbox,
  CheckboxIcon,
  CheckboxIndicator,
} from "@/components/ui/checkbox";
import { CheckIcon } from "@/components/ui/icon";

export const RoleFormMembers = ({
  form,
  societyId,
}: {
  form: any;
  societyId: string | null;
}) => {
  const [search, setSearch] = useState("");
  const [input, setInput] = useState("");
  const debouncedSetSearch = useDebounceCallback(setSearch, 300);

  const {
    data: members,
    isFetching,
    isLoading,
  } = useGetSocietyMembersQuery({
    societyId: societyId || "",
    search,
  });

  const selectedMemberIds = form.watch("members") || [];

  const handleInputChange = (text: string) => {
    setInput(text);
    debouncedSetSearch(text);
  };

  const toggleMemberSelection = (memberId: string) => {
    const currentMembers = [...selectedMemberIds];

    if (currentMembers.includes(memberId)) {
      form.setValue(
        "members",
        currentMembers.filter((id) => id !== memberId)
      );
    } else {
      form.setValue("members", [...currentMembers, memberId]);
    }
  };

  return (
    <View style={{ height: 400 }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled={true}
      >
        <VStack space="md">
          <Text className="text-base font-medium text-gray-800">
            Assign this role to members.
          </Text>

          {/* Search Input */}
          <Input
            variant="outline"
            className="border border-neutral-300 rounded-lg h-11"
          >
            <InputField
              placeholder="Search member"
              value={input}
              onChangeText={handleInputChange}
            />
          </Input>

          {/* Members List */}
          <ScrollView className="max-h-64 min-h-64">
            {isLoading ? (
              <View className="flex-1 justify-center items-center py-8">
                <ActivityIndicator />
              </View>
            ) : (
              <VStack space="sm">
                {members?.map((member) => {
                  const isSelected = selectedMemberIds.includes(member.id);

                  return (
                    <View
                      key={member.id}
                      className={`flex-row items-center gap-3 p-3 rounded-md border ${
                        isSelected
                          ? "border-primary-600 bg-primary-100/20"
                          : "border-gray-200"
                      }`}
                    >
                      <Checkbox
                        value={isSelected ? "true" : "false"}
                        isChecked={isSelected}
                        onChange={() => toggleMemberSelection(member.id)}
                        className="h-5 w-5"
                      >
                        <CheckboxIndicator>
                          <CheckboxIcon as={CheckIcon} />
                        </CheckboxIndicator>
                      </Checkbox>
                      <View className="flex-1">
                        <Text className="text-sm font-medium text-gray-800">
                          {`${member.firstName} ${member.lastName}`}
                        </Text>
                        <Text className="text-xs text-gray-600">
                          {member.email}
                        </Text>
                      </View>
                    </View>
                  );
                })}

                {members?.length === 0 && !isLoading && (
                  <View className="flex-1 justify-center items-center py-8">
                    <Text className="text-gray-500">No members found</Text>
                  </View>
                )}
              </VStack>
            )}
          </ScrollView>
        </VStack>
      </ScrollView>
    </View>
  );
};
