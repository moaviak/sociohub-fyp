import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";

interface RolesFormBasicProps {
  form: UseFormReturn<{
    name: string;
    description?: string | undefined;
    privileges?: string[] | undefined;
    members?: string[] | undefined;
  }>;
}

export const RolesFormBasic = ({ form }: RolesFormBasicProps) => {
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
    </>
  );
};
