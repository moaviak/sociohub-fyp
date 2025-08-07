import { Controller, UseFormReturn } from "react-hook-form";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SocietyRegistrationFormValues } from "../schema";
import { VStack } from "@/components/ui/vstack";
import {
  Checkbox,
  CheckboxIcon,
  CheckboxIndicator,
  CheckboxLabel,
} from "@/components/ui/checkbox";
import {
  FormControlError,
  FormControlErrorText,
} from "@/components/ui/form-control";
import { CheckIcon } from "lucide-react-native";
import { useState } from "react";

export const SocietyRules = ({
  form,
}: {
  form: UseFormReturn<SocietyRegistrationFormValues>;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <VStack space="md" className="bg-blue-50 p-4 rounded-lg">
      {/* Collapsible Rules Section */}
      {open && (
        <ScrollView
          className="max-h-64 bg-neutral-50 border border-neutral-400 rounded-lg p-4"
          showsVerticalScrollIndicator={true}
        >
          <VStack space="md">
            <View>
              <Text className="font-semibold text-sm text-gray-800 mb-1">
                1. Respect and Professional Conduct
              </Text>
              <Text className="text-sm text-gray-700">
                Members shall treat all fellow students, advisors, and
                university staff with respect and courtesy at all times.
                Discrimination, harassment, or any form of misconduct will not
                be tolerated.
              </Text>
            </View>

            <View>
              <Text className="font-semibold text-sm text-gray-800 mb-1">
                2. Active Participation
              </Text>
              <Text className="text-sm text-gray-700">
                Members are expected to participate actively in society
                meetings, events, and activities. Repeated absence or
                non-involvement may result in revocation of membership.
              </Text>
            </View>

            <View>
              <Text className="font-semibold text-sm text-gray-800 mb-1">
                3. Compliance with Society Structure
              </Text>
              <Text className="text-sm text-gray-700">
                Members must respect the society's internal structure, including
                the authority of advisors, heads, and designated roles.
                Instructions given by society officials must be followed in good
                faith.
              </Text>
            </View>

            <View>
              <Text className="font-semibold text-sm text-gray-800 mb-1">
                4. Adherence to University Policies
              </Text>
              <Text className="text-sm text-gray-700">
                All society activities must comply with the rules and code of
                conduct set forth by the university administration. Unauthorized
                use of university property or name for personal or society
                purposes is strictly prohibited.
              </Text>
            </View>

            <View>
              <Text className="font-semibold text-sm text-gray-800 mb-1">
                5. Responsible Representation
              </Text>
              <Text className="text-sm text-gray-700">
                Members represent the society and the university during internal
                and external events. Any behavior that tarnishes the reputation
                of either is subject to disciplinary action.
              </Text>
            </View>

            <View>
              <Text className="font-semibold text-sm text-gray-800 mb-1">
                6. Financial Transparency and Integrity
              </Text>
              <Text className="text-sm text-gray-700">
                Members involved in event organization or handling finances must
                operate transparently and maintain proper records. Misuse of
                funds or resources will result in immediate removal and possible
                university action.
              </Text>
            </View>

            <View>
              <Text className="font-semibold text-sm text-gray-800 mb-1">
                7. Confidentiality and Data Protection
              </Text>
              <Text className="text-sm text-gray-700">
                Internal matters and data shared within the society (e.g., event
                plans, communications) should not be disclosed without
                authorization.
              </Text>
            </View>

            <View>
              <Text className="font-semibold text-sm text-gray-800 mb-1">
                8. Zero Tolerance for Misconduct
              </Text>
              <Text className="text-sm text-gray-700">
                Any act of dishonesty, violence, plagiarism, or disruptive
                behavior will lead to strict disciplinary measures including
                removal from the society.
              </Text>
            </View>

            <View>
              <Text className="font-semibold text-sm text-gray-800 mb-1">
                9. Resignation and Termination
              </Text>
              <Text className="text-sm text-gray-700">
                Members may resign from the society by submitting a formal
                request. The society reserves the right to terminate membership
                on grounds of non-compliance or misconduct, subject to advisor
                approval.
              </Text>
            </View>

            <View>
              <Text className="font-semibold text-sm text-gray-800 mb-1">
                10. Acceptance of Amendments
              </Text>
              <Text className="text-sm text-gray-700">
                Members agree to comply with future amendments to society rules
                as approved by the society's advisor and management committee.
              </Text>
            </View>
          </VStack>
        </ScrollView>
      )}

      {/* Agreement Checkbox */}
      <Controller
        control={form.control}
        name="isAgree"
        render={({ field: { onChange, value } }) => (
          <View className="flex-row items-start mt-2">
            <Checkbox
              value={value ? "true" : "false"}
              onChange={(checked) => onChange(checked)}
              className="mr-2"
            >
              <CheckboxIndicator>
                <CheckboxIcon as={CheckIcon} />
              </CheckboxIndicator>
            </Checkbox>
            <View className="flex-1">
              <Text className="text-sm text-primary-800 leading-5">
                I agree to abide by the{" "}
                <Text
                  onPress={() => setOpen(!open)}
                  className="text-primary-600 text-sm underline"
                >
                  society's rules
                </Text>{" "}
                and actively participate in its activities.
              </Text>
            </View>
          </View>
        )}
      />

      {form.formState.errors.isAgree && (
        <FormControlError>
          <FormControlErrorText>
            {form.formState.errors.isAgree?.message}
          </FormControlErrorText>
        </FormControlError>
      )}
    </VStack>
  );
};
