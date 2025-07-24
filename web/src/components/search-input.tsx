import { Loader2, Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SearchInputProps {
  placeholder?: string;
  className?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isSearching?: boolean;
}

export const SearchInput = ({
  placeholder,
  className,
  value,
  onChange,
  isSearching,
}: SearchInputProps) => {
  return (
    <div className="relative min-w-fit">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-500" />
      <Input
        className={cn(
          "w-md outline outline-neutral-400 rounded-xl px-10",
          className
        )}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
      {isSearching && (
        <Loader2 className="animate-spin w-5 h-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-500" />
      )}
    </div>
  );
};
