import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { EventCategories as categoriesArray } from "@/data";
import { ChevronDown, ListFilterPlus } from "lucide-react";
import { z } from "zod";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useState } from "react";
import { useAppSelector } from "@/app/hooks";
import { useParams } from "react-router";
import { haveEventsPrivilege } from "@/lib/utils";
import { EventCategories } from "@/features/app/events/schema";
import { Advisor } from "@/types";

const FilterSchema = z.object({
  status: z.enum(["upcoming", "past", "draft"]).optional(),
  categories: z.array(EventCategories).min(0),
});

type FilterData = z.infer<typeof FilterSchema>;

interface SearchFilterProps {
  onFilterChange: (filters: FilterData) => void;
}

export const SearchFilter = ({ onFilterChange }: SearchFilterProps) => {
  const { user } = useAppSelector((state) => state.auth);
  const { societyId } = useParams();
  const [isOpen, setIsOpen] = useState(false);
  const form = useForm<FilterData>({
    resolver: zodResolver(FilterSchema),
    defaultValues: {
      categories: [],
      status: undefined,
    },
  });

  const isStudent = user && "registrationNumber" in user;
  const havePrivilege = isStudent
    ? haveEventsPrivilege(user.societies || [], societyId || "")
    : !societyId || societyId === (user as Advisor).societyId;
  const onSubmit = (data: FilterData) => {
    onFilterChange(data);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="rounded-full">
          <ListFilterPlus className="h-5 w-5" />
          <span className="mr-2">Filters</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="drop-shadow-lg min-w-sm">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="flex flex-col gap-y-2">
                  <FormLabel>Event Status</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="upcoming" />
                        </FormControl>
                        <FormLabel className="b3-regular">Upcoming</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="past" />
                        </FormControl>
                        <FormLabel className="b3-regular">Past</FormLabel>
                      </FormItem>
                      {havePrivilege && (
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="draft" />
                          </FormControl>
                          <FormLabel className="b3-regular">Draft</FormLabel>
                        </FormItem>
                      )}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="categories"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel>Event Categories</FormLabel>
                  </div>
                  <div className="flex gap-4 flex-wrap">
                    {categoriesArray.map((category, idx) => (
                      <FormField
                        key={idx}
                        control={form.control}
                        name="categories"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={idx}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(category)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([
                                          ...field.value,
                                          category,
                                        ])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== category
                                          )
                                        );
                                  }}
                                  className="data-[state=checked]:bg-primary-600 data-[state=checked]:border-primary-600"
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal">
                                {category}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-x-2">
              <Button
                variant="destructive"
                size={"sm"}
                onClick={(e) => {
                  e.preventDefault();
                  form.reset();
                }}
              >
                Clear
              </Button>
              <Button type="submit" size={"sm"}>
                Apply
              </Button>
            </div>
          </form>
        </Form>
      </PopoverContent>
    </Popover>
  );
};
