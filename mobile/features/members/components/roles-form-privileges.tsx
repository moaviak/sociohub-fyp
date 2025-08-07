import {
  Checkbox,
  CheckboxIcon,
  CheckboxIndicator,
} from "@/components/ui/checkbox";
import { CheckIcon } from "@/components/ui/icon";
import { VStack } from "@/components/ui/vstack";
import { ROLES_PRIVILEGES } from "@/data";
import { ScrollView, Text, View } from "react-native";

export const RoleFormPrivileges = ({ form }: { form: any }) => {
  const selectedPrivileges = form.watch("privileges") || [];

  const togglePrivilege = (key: string) => {
    const currentPrivileges = [...selectedPrivileges];

    if (currentPrivileges.includes(key)) {
      form.setValue(
        "privileges",
        currentPrivileges.filter((privilege) => privilege !== key)
      );
    } else {
      form.setValue("privileges", [...currentPrivileges, key]);
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
            Assign privileges to the role.
          </Text>

          <VStack space="sm">
            {ROLES_PRIVILEGES.map((privilege) => {
              const isSelected = selectedPrivileges?.includes(privilege.key);

              return (
                <View
                  key={privilege.key}
                  className={`flex-row items-center gap-3 p-3 rounded-md border ${
                    isSelected
                      ? "border-primary-600 bg-primary-100/20"
                      : "border-gray-200"
                  }`}
                >
                  <Checkbox
                    value={isSelected ? "true" : "false"}
                    isChecked={isSelected}
                    onChange={() => togglePrivilege(privilege.key)}
                    className="h-5 w-5"
                  >
                    <CheckboxIndicator>
                      <CheckboxIcon as={CheckIcon} />
                    </CheckboxIndicator>
                  </Checkbox>
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-gray-800">
                      {privilege.title}
                    </Text>
                    <Text className="text-xs text-gray-600">
                      {privilege.description}
                    </Text>
                  </View>
                </View>
              );
            })}
          </VStack>
        </VStack>
      </ScrollView>
    </View>
  );
};
