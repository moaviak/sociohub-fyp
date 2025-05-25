import { UseFormReturn } from "react-hook-form";

import { EventFormData } from "../../schema";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Editor } from "./editor";
import { EventCategories } from "@/data";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import FileUploader from "@/components/file-uploader";

interface BasicInfoProps {
  form: UseFormReturn<EventFormData>;
  banner?: string;
}

export const BasicInfo = ({ form, banner }: BasicInfoProps) => {
  return (
    <div className="space-y-4">
      <h3 className="h6-semibold">Basic Event Information</h3>

      <div className="space-y-4">
        <FormField
          control={form.control}
          name="eventTitle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Event Title <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Annual Debate Competition 2025"
                  className="outline-1 outline-neutral-400"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="eventTagline"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Tagline</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="A catchy phrase summarizing the event."
                  className="outline-1 outline-neutral-400"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="detailedDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Detailed Description</FormLabel>
              <FormControl>
                <Editor value={field.value} setValue={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="eventCategories"
          render={({ field }) => (
            <FormItem className="flex items-center gap-x-4">
              <FormLabel className="text-nowrap mb-0">
                Event Categories <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <div className="flex flex-wrap flex-1 px-4 gap-4">
                  {EventCategories.map((category) => {
                    const displayName = category.valueOf();
                    return (
                      <div
                        className="flex items-center justify-center gap-2"
                        key={displayName}
                      >
                        <Checkbox
                          checked={field.value?.includes(category)}
                          onCheckedChange={(checked) => {
                            const currentValue = field.value || [];
                            if (checked) {
                              field.onChange([...currentValue, category]);
                            } else {
                              field.onChange(
                                currentValue.filter(
                                  (value) => value !== category
                                )
                              );
                            }
                          }}
                          className="data-[state=checked]:bg-primary-600 data-[state=checked]:border-primary-600"
                          id={displayName}
                        />
                        <Label
                          className="b3-medium leading-none"
                          htmlFor={displayName}
                        >
                          {displayName}
                        </Label>
                      </div>
                    );
                  })}
                </div>
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="eventImage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Image</FormLabel>
              <FormControl>
                {(() => {
                  return (
                    <FileUploader
                      onFileChange={field.onChange}
                      placeholderText={{
                        main: "Drag your image or",
                        browse: "browse",
                        sizeLimit: "Max size: 5 MB",
                      }}
                      existingImages={banner ? [{ url: banner }] : []}
                    />
                  );
                })()}
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};
