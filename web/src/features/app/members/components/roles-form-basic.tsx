import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { useEffect, useState } from "react";

interface RolesFormBasicProps {
  form: UseFormReturn<
    {
      name: string;
      minSemester?: number | undefined;
      description?: string | undefined;
      privileges?: string[] | undefined;
      members?: string[] | undefined;
    },
    undefined
  >;
}

export const RolesFormBasic = ({ form }: RolesFormBasicProps) => {
  // Get the current value from the form
  const minSemesterValue = form.watch("minSemester");

  // Initialize select value state based on the current form value
  const [semesterValue, setSemesterValue] = useState<string>(
    minSemesterValue !== undefined &&
      minSemesterValue !== null &&
      !isNaN(minSemesterValue)
      ? String(minSemesterValue)
      : "none"
  );

  // Update select value when form value changes
  useEffect(() => {
    if (
      minSemesterValue === undefined ||
      minSemesterValue === null ||
      isNaN(minSemesterValue)
    ) {
      setSemesterValue("none");
    } else {
      setSemesterValue(String(minSemesterValue));
    }
  }, [minSemesterValue]);

  return (
    <>
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Role Name</FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder="Enter role name"
                className="outline-1 outline-neutral-400"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Role Description</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Short description of role"
                className="min-h-28 resize-none outline-neutral-400 outline"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="minSemester"
        render={({ field }) => {
          return (
            <FormItem>
              <FormLabel>Minimum Semester Required</FormLabel>
              <Select
                value={semesterValue}
                onValueChange={(val) => {
                  console.log("Select value changed to:", val);
                  if (val === "none") {
                    // For "None" selection, clear the field value
                    field.onChange(undefined);
                    setSemesterValue("none");
                  } else {
                    // For semester selection, set the numeric value
                    const numValue = parseInt(val, 10);
                    if (!isNaN(numValue) && numValue > 0) {
                      field.onChange(numValue);
                      setSemesterValue(val);
                    }
                  }
                }}
              >
                <FormControl>
                  <SelectTrigger className="outline outline-neutral-400">
                    <SelectValue placeholder="Select minimum semester">
                      {semesterValue === "none" ? "None" : `${semesterValue}`}
                    </SelectValue>
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {Array.from({ length: 10 }, (_, i) => i + 1).map(
                    (semester) => (
                      <SelectItem key={semester} value={semester.toString()}>
                        {semester}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          );
        }}
      />
    </>
  );
};
