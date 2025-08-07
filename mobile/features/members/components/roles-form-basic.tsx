import { Controller, UseFormReturn } from "react-hook-form";
import { RolesFormSchema, RolesFormValues } from "../schema";
import { VStack } from "@/components/ui/vstack";
import {
  FormControl,
  FormControlError,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
} from "@/components/ui/form-control";
import { Input, InputField } from "@/components/ui/input";
import { Textarea, TextareaInput } from "@/components/ui/textarea";
import {
  Select,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicator,
  SelectDragIndicatorWrapper,
  SelectIcon,
  SelectInput,
  SelectItem,
  SelectPortal,
  SelectTrigger,
} from "@/components/ui/select";
import { ChevronDownIcon } from "lucide-react-native";
import { ScrollView } from "react-native";

export const RoleFormBasic = ({ form }: { form: any }) => {
  const minSemesterValue = form.watch("minSemester");

  return (
    <VStack space="lg" style={{ paddingBottom: 24 }}>
      {/* Role Name */}
      <FormControl isInvalid={!!form.formState.errors.name} isRequired>
        <FormControlLabel>
          <FormControlLabelText>Role Name</FormControlLabelText>
        </FormControlLabel>
        <Controller
          control={form.control}
          name="name"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              variant="outline"
              className="border border-neutral-300 rounded-lg h-11"
            >
              <InputField
                placeholder="Enter role name"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
              />
            </Input>
          )}
        />
        {form.formState.errors.name && (
          <FormControlError>
            <FormControlErrorText>
              {form.formState.errors.name?.message}
            </FormControlErrorText>
          </FormControlError>
        )}
      </FormControl>

      {/* Role Description */}
      <FormControl isInvalid={!!form.formState.errors.description}>
        <FormControlLabel>
          <FormControlLabelText>Role Description</FormControlLabelText>
        </FormControlLabel>
        <Controller
          control={form.control}
          name="description"
          render={({ field: { onChange, onBlur, value } }) => (
            <Textarea className="border border-neutral-300 rounded-lg min-h-20">
              <TextareaInput
                placeholder="Short description of role"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                multiline
                numberOfLines={4}
                className="align-top"
              />
            </Textarea>
          )}
        />
        {form.formState.errors.description && (
          <FormControlError>
            <FormControlErrorText>
              {form.formState.errors.description?.message}
            </FormControlErrorText>
          </FormControlError>
        )}
      </FormControl>

      {/* Minimum Semester */}
      <FormControl isInvalid={!!form.formState.errors.minSemester}>
        <FormControlLabel>
          <FormControlLabelText>Minimum Semester Required</FormControlLabelText>
        </FormControlLabel>
        <Controller
          control={form.control}
          name="minSemester"
          render={({ field: { onChange, value } }) => (
            <Select
              onValueChange={(val) => {
                if (val === "none") {
                  onChange(undefined);
                } else {
                  const numValue = parseInt(val, 10);
                  if (!isNaN(numValue) && numValue > 0) {
                    onChange(numValue);
                  }
                }
              }}
              className="flex-1 min-w-0"
            >
              <SelectTrigger
                variant="outline"
                className="h-11 border-neutral-300 rounded-lg justify-between"
              >
                <SelectInput
                  placeholder="Select minimum semester"
                  value={value !== undefined ? value.toString() : "none"}
                />
                <SelectIcon className="mr-2" as={ChevronDownIcon} />
              </SelectTrigger>
              <SelectPortal>
                <SelectBackdrop />
                <SelectContent className="max-h-[50vh]">
                  <SelectDragIndicatorWrapper>
                    <SelectDragIndicator />
                  </SelectDragIndicatorWrapper>
                  <ScrollView className="w-full">
                    <SelectItem label="None" value="none" />
                    {Array.from({ length: 10 }, (_, i) => i + 1).map(
                      (semester) => (
                        <SelectItem
                          key={semester}
                          label={semester.toString()}
                          value={semester.toString()}
                        />
                      )
                    )}
                  </ScrollView>
                </SelectContent>
              </SelectPortal>
            </Select>
          )}
        />
        {form.formState.errors.minSemester && (
          <FormControlError>
            <FormControlErrorText>
              {form.formState.errors.minSemester?.message}
            </FormControlErrorText>
          </FormControlError>
        )}
      </FormControl>
    </VStack>
  );
};
