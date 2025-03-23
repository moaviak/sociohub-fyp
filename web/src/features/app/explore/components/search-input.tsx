import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SearchInputProps {
  placeholder?: string;
  className?: string;
}

export const SearchInput = ({ placeholder, className }: SearchInputProps) => {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-500" />
      <Input
        className={cn(
          "w-md outline outline-neutral-400 rounded-xl pl-10",
          className
        )}
        placeholder={placeholder}
      />
    </div>
  );
};
